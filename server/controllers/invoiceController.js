const db = require("../config/db");

// Test invoice API
const getInvoices = async (req, res) => {
    try {
        const [invoices] = await db.query(
            `
            SELECT
            i.id,
            i.customer_id,
            c.name AS customer_name,
            i.invoice_number,
            i.issue_date,
            i.due_date,
            i.status,
            i.subtotal,
            i.discount_type,
            i.discount_value,
            i.discount_amount,
            i.tax_amount,
            i.total_amount,
            i.paid_amount,
            i.remaining_amount,
            i.currency,
            i.notes,
            i.created_at,
            i.updated_at
            FROM invoices i
            JOIN customers c ON i.customer_id = c.id
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
           `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: invoices,
        });
    } catch (error) {
        console.error("Get invoices error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch invoices",
        });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const [invoices] = await db.query(
            `
            SELECT
                i.*,
                c.name AS customer_name,
                c.email AS customer_email,
                c.phone AS customer_phone
            FROM invoices i
            JOIN customers c ON i.customer_id = c.id
            WHERE i.id = ? AND i.user_id = ?
            `,
            [id, req.user.id]
        );

        if (invoices.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        const invoice = invoices[0];

        const [items] = await db.query(
            `
            SELECT
                id,
                product_id,
                item_type,
                name,
                description,
                sku,
                unit,
                quantity,
                unit_price,
                discount_type,
                discount_value,
                discount_amount,
                tax_rate,
                tax_amount,
                line_total
            FROM invoice_items
            WHERE invoice_id = ?
            ORDER BY id ASC
            `,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...invoice,
                items,
            },
        });

    } catch (error) {
        console.error("Get invoice by ID error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch invoice",
        });
    }
};

const createInvoice = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            customer_id,
            invoice_number,
            issue_date,
            due_date,
            items,
            discount_type,
            discount_value,
            currency,
            notes,
            terms_and_conditions,
            payment_instructions,
            paid_amount,
        } = req.body;

        // Basic validation
        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: "Customer is required",
            });
        }

        if (!invoice_number || !invoice_number.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invoice number is required",
            });
        }

        if (!issue_date) {
            return res.status(400).json({
                success: false,
                message: "Issue date is required",
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one invoice item is required",
            });
        }

        // Check customer belongs to logged-in user
        const [customers] = await connection.query(
            `
            SELECT id
            FROM customers
            WHERE id = ? AND user_id = ?
            `,
            [customer_id, req.user.id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Start transaction
        await connection.beginTransaction();

        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const invoiceItems = [];

        // Process every item
        for (const item of items) {
            if (!item.product_id) {
                throw new Error("Product is required for every invoice item");
            }

            const quantity = Number(item.quantity);

            if (!quantity || quantity <= 0) {
                throw new Error("Quantity must be greater than 0");
            }

            // Get product belonging to logged-in user
            const [products] = await connection.query(
                `
                SELECT
                    id,
                    item_type,
                    name,
                    description,
                    sku,
                    unit,
                    price,
                    tax_rate
                FROM products
                WHERE id = ? AND user_id = ?
                `,
                [item.product_id, req.user.id]
            );

            if (products.length === 0) {
                throw new Error("Product not found");
            }

            const product = products[0];

            const unitPrice = Number(product.price);
            const taxRate = Number(product.tax_rate || 0);

            // Item amount
            const itemSubtotal = quantity * unitPrice;

            // Item discount
            const itemDiscountType = item.discount_type || "fixed";
            const itemDiscountValue = Number(item.discount_value || 0);

            let itemDiscountAmount = 0;

            if (itemDiscountType === "percentage") {
                itemDiscountAmount =
                    itemSubtotal * (itemDiscountValue / 100);
            } else {
                itemDiscountAmount = itemDiscountValue;
            }

            // Prevent discount greater than item amount
            if (itemDiscountAmount > itemSubtotal) {
                itemDiscountAmount = itemSubtotal;
            }

            const taxableAmount = itemSubtotal - itemDiscountAmount;

            // Tax
            const itemTaxAmount =
                taxableAmount * (taxRate / 100);

            // Final line total
            const lineTotal = taxableAmount + itemTaxAmount;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscountAmount;
            totalTax += itemTaxAmount;

            invoiceItems.push({
                product_id: product.id,
                item_type: product.item_type,
                name: product.name,
                description: product.description,
                sku: product.sku,
                unit: product.unit,
                quantity,
                unit_price: unitPrice,
                discount_type: itemDiscountType,
                discount_value: itemDiscountValue,
                discount_amount: itemDiscountAmount,
                tax_rate: taxRate,
                tax_amount: itemTaxAmount,
                line_total: lineTotal,
            });
        }

        // Invoice-level discount
        // Invoice-level discount
        const invoiceDiscountType = discount_type || "fixed";
        const invoiceDiscountValue = Number(discount_value || 0);

        const amountAfterItemDiscount =
            subtotal - totalDiscount;

        let invoiceDiscountAmount = 0;

        if (invoiceDiscountType === "percentage") {
            invoiceDiscountAmount =
                amountAfterItemDiscount *
                (invoiceDiscountValue / 100);
        } else {
            invoiceDiscountAmount =
                invoiceDiscountValue;
        }

        if (invoiceDiscountAmount > amountAfterItemDiscount) {
            invoiceDiscountAmount =
                amountAfterItemDiscount;
        }

        // Final total
        const totalAmount =
            subtotal -
            totalDiscount -
            invoiceDiscountAmount +
            totalTax;

        const paidAmount = Number(paid_amount || 0);

        if (paidAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be negative.",
            });
        }

        if (paidAmount > totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be greater than invoice total.",
            });
        }

        const remainingAmount = totalAmount - paidAmount;

        // Save invoice
        const [invoiceResult] = await connection.query(
            `
            INSERT INTO invoices
            (
                user_id,
                customer_id,
                invoice_number,
                issue_date,
                due_date,
                status,
                subtotal,
                discount_type,
                discount_value,
                discount_amount,
                tax_amount,
                total_amount,
                paid_amount,
                remaining_amount,
                currency,
                notes,
                terms_and_conditions,
                payment_instructions
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.user.id,
                customer_id,
                invoice_number,
                issue_date,
                due_date || null,
                "draft",
                subtotal,
                invoiceDiscountType,
                invoiceDiscountValue,
                totalDiscount + invoiceDiscountAmount,
                totalTax,
                totalAmount,
                paidAmount,
                remainingAmount,
                currency || "INR",
                notes || null,
                terms_and_conditions || null,
                payment_instructions || null,
            ]
        );

        const invoiceId = invoiceResult.insertId;

        // Save invoice items
        for (const item of invoiceItems) {
            await connection.query(
                `
                INSERT INTO invoice_items
                (
                    invoice_id,
                    product_id,
                    item_type,
                    name,
                    description,
                    sku,
                    unit,
                    quantity,
                    unit_price,
                    discount_type,
                    discount_value,
                    discount_amount,
                    tax_rate,
                    tax_amount,
                    line_total
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    invoiceId,
                    item.product_id,
                    item.item_type,
                    item.name,
                    item.description,
                    item.sku,
                    item.unit,
                    item.quantity,
                    item.unit_price,
                    item.discount_type,
                    item.discount_value,
                    item.discount_amount,
                    item.tax_rate,
                    item.tax_amount,
                    item.line_total,
                ]
            );
        }

        // Everything successful
        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: {
                id: invoiceId,
                invoice_number,
                subtotal,
                discount_amount: invoiceDiscountAmount,
                tax_amount: totalTax,
                total_amount: totalAmount,
                paid_amount: paidAmount,
                remaining_amount: remainingAmount,
            },
        });

    } catch (error) {
        // Undo all database changes if anything fails
        await connection.rollback();

        console.error("Create invoice error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create invoice",
        });

    } finally {
        connection.release();
    }
};

const updateInvoice = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const {
            customer_id,
            issue_date,
            due_date,
            status,
            paid_amount,
            discount_type,
            discount_value,
            currency,
            notes,
            terms_and_conditions,
            payment_instructions,
            items,
        } = req.body;

        await connection.beginTransaction();

        // Check invoice belongs to logged-in user
        const [existingInvoice] = await connection.query(
            `
            SELECT id
            FROM invoices
            WHERE id = ? AND user_id = ?
            `,
            [id, req.user.id]
        );

        if (existingInvoice.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        // Validate customer
        const [customer] = await connection.query(
            `
            SELECT id
            FROM customers
            WHERE id = ? AND user_id = ?
            `,
            [customer_id, req.user.id]
        );

        if (customer.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Invalid customer",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "At least one invoice item is required",
            });
        }

        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const calculatedItems = [];

        // Calculate invoice items again
        for (const item of items) {
            const {
                product_id,
                quantity,
                discount_type: itemDiscountType,
                discount_value: itemDiscountValue,
            } = item;

            const [products] = await connection.query(
                `
                SELECT
                    id,
                    item_type,
                    name,
                    description,
                    sku,
                    unit,
                    price,
                    tax_rate
                FROM products
                WHERE id = ? AND user_id = ?
                `,
                [product_id, req.user.id]
            );

            if (products.length === 0) {
                throw new Error(`Product ${product_id} not found`);
            }

            const product = products[0];

            const itemSubtotal =
                Number(product.price) * Number(quantity);

            let itemDiscountAmount = 0;

            if (itemDiscountType === "percentage") {
                itemDiscountAmount =
                    itemSubtotal *
                    (Number(itemDiscountValue || 0) / 100);
            } else {
                itemDiscountAmount =
                    Number(itemDiscountValue || 0);
            }

            const taxableAmount =
                itemSubtotal - itemDiscountAmount;

            const itemTaxAmount =
                taxableAmount *
                (Number(product.tax_rate || 0) / 100);

            const lineTotal =
                taxableAmount + itemTaxAmount;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscountAmount;
            totalTax += itemTaxAmount;

            calculatedItems.push({
                product_id: product.id,
                item_type: product.item_type,
                name: product.name,
                description: product.description,
                sku: product.sku,
                unit: product.unit,
                quantity,
                unit_price: product.price,
                discount_type: itemDiscountType || "fixed",
                discount_value: itemDiscountValue || 0,
                discount_amount: itemDiscountAmount,
                tax_rate: product.tax_rate || 0,
                tax_amount: itemTaxAmount,
                line_total: lineTotal,
            });
        }

        // Invoice-level discount
        
        const amountAfterItemDiscount =
            subtotal - totalDiscount;

        let invoiceDiscountAmount = 0;

        if (discount_type === "percentage") {
            invoiceDiscountAmount =
                amountAfterItemDiscount *
                (Number(discount_value || 0) / 100);
        } else {
            invoiceDiscountAmount =
                Number(discount_value || 0);
        }

        invoiceDiscountAmount = Math.min(
            invoiceDiscountAmount,
            amountAfterItemDiscount
        );

        const totalAmount =
            subtotal -
            totalDiscount -
            invoiceDiscountAmount +
            totalTax;

        const paidAmount = Number(paid_amount || 0);

        if (paidAmount < 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be negative.",
            });
        }

        if (paidAmount > totalAmount) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be greater than invoice total.",
            });
        }

        // Update invoice
        await connection.query(
            `
            UPDATE invoices
            SET
                customer_id = ?,
                issue_date = ?,
                due_date = ?,
                status = ?,
                subtotal = ?,
                discount_type = ?,
                discount_value = ?,
                discount_amount = ?,
                tax_amount = ?,
                total_amount = ?,
                paid_amount = ?,
                remaining_amount = total_amount - paid_amount,
                currency = ?,
                notes = ?,
                terms_and_conditions = ?,
                payment_instructions = ?
            WHERE id = ? AND user_id = ?
            `,
            [
                customer_id,
                issue_date,
                due_date,
                status,
                subtotal,
                discount_type || "fixed",
                discount_value || 0,
                totalDiscount + invoiceDiscountAmount,
                totalTax,
                totalAmount,
                paidAmount,
                currency || "INR",
                notes || null,
                terms_and_conditions || null,
                payment_instructions || null,
                id,
                req.user.id,
            ]
        );

        // Remove old items
        await connection.query(
            `
            DELETE FROM invoice_items
            WHERE invoice_id = ?
            `,
            [id]
        );

        // Insert updated items
        for (const item of calculatedItems) {
            await connection.query(
                `
                INSERT INTO invoice_items (
                    invoice_id,
                    product_id,
                    item_type,
                    name,
                    description,
                    sku,
                    unit,
                    quantity,
                    unit_price,
                    discount_type,
                    discount_value,
                    discount_amount,
                    tax_rate,
                    tax_amount,
                    line_total
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    id,
                    item.product_id,
                    item.item_type,
                    item.name,
                    item.description,
                    item.sku,
                    item.unit,
                    item.quantity,
                    item.unit_price,
                    item.discount_type,
                    item.discount_value,
                    item.discount_amount,
                    item.tax_rate,
                    item.tax_amount,
                    item.line_total,
                ]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Invoice updated successfully",
            data: {
                id,
                subtotal,
                discount_amount:
                    totalDiscount + invoiceDiscountAmount,
                tax_amount: totalTax,
                total_amount: totalAmount,
            },
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update invoice error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update invoice",
        });
    } finally {
        connection.release();
    }
};

const deleteInvoice = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Check invoice belongs to logged-in user
        const [invoices] = await connection.query(
            `
            SELECT id
            FROM invoices
            WHERE id = ? AND user_id = ?
            `,
            [id, req.user.id]
        );

        if (invoices.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        // Delete invoice items first
        await connection.query(
            `
            DELETE FROM invoice_items
            WHERE invoice_id = ?
            `,
            [id]
        );

        // Delete invoice
        await connection.query(
            `
            DELETE FROM invoices
            WHERE id = ? AND user_id = ?
            `,
            [id, req.user.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Invoice deleted successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Delete invoice error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete invoice",
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};