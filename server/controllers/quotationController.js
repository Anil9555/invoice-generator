const db = require("../config/db");

const getQuotations = async (req, res) => {
    try {
        const [quotations] = await db.query(
            `
            SELECT
                q.id,
                q.customer_id,
                c.name AS customer_name,
                q.quotation_number,
                q.issue_date,
                q.valid_until AS expiry_date,
                q.status,
                q.subtotal,
                q.discount_type,
                q.discount_value,
                q.discount_amount,
                q.tax_amount,
                q.total_amount,
                q.currency,
                q.notes,
                q.created_at,
                q.updated_at
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: quotations,
        });
    } catch (error) {
        console.error("Get quotations error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch quotations",
        });
    }
};

const getQuotationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [quotations] = await db.query(
            `
            SELECT
                q.id,
                q.customer_id,
                c.name AS customer_name,
                c.email AS customer_email,
                c.phone AS customer_phone,
                q.quotation_number,
                q.issue_date,
                q.valid_until,
                q.status,
                q.subtotal,
                q.discount_type,
                q.discount_value,
                q.discount_amount,
                q.tax_amount,
                q.total_amount,
                q.currency,
                q.notes,
                q.terms_and_conditions,
                q.created_at,
                q.updated_at
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.id = ? AND q.user_id = ?
            `,
            [id, req.user.id]
        );

        if (quotations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        const quotation = quotations[0];

        const [items] = await db.query(
            `
            SELECT
                id,
                quotation_id,
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
            FROM quotation_items
            WHERE quotation_id = ?
            ORDER BY id ASC
            `,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...quotation,
                items,
            },
        });
    } catch (error) {
        console.error("Get quotation by ID error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch quotation",
        });
    }
};

const createQuotation = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            customer_id,
            quotation_number,
            issue_date,
            valid_until,
            items,
            discount_type,
            discount_value,
            currency,
            notes,
            terms_and_conditions,
        } = req.body;

        // Basic validation
        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: "Customer is required",
            });
        }

        if (!quotation_number || !quotation_number.trim()) {
            return res.status(400).json({
                success: false,
                message: "Quotation number is required",
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
                message: "At least one quotation item is required",
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

        // Calculation will be added in the next step

        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const quotationItems = [];

        for (const item of items) {
            if (!item.product_id) {
                throw new Error("Product is required for every quotation item");
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

            // Item subtotal
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

            const taxableAmount =
                itemSubtotal - itemDiscountAmount;

            // Tax
            const itemTaxAmount =
                taxableAmount * (taxRate / 100);

            // Line total
            const lineTotal =
                taxableAmount + itemTaxAmount;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscountAmount;
            totalTax += itemTaxAmount;

            quotationItems.push({
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

        // Quotation-level discount
        const quotationDiscountType = discount_type || "fixed";
        const quotationDiscountValue = Number(discount_value || 0);

        const amountAfterItemDiscount =
            subtotal - totalDiscount;

        let quotationDiscountAmount = 0;

        if (quotationDiscountType === "percentage") {
            quotationDiscountAmount =
                amountAfterItemDiscount *
                (quotationDiscountValue / 100);
        } else {
            quotationDiscountAmount =
                quotationDiscountValue;
        }

        if (quotationDiscountAmount > amountAfterItemDiscount) {
            quotationDiscountAmount =
                amountAfterItemDiscount;
        }

        // Final total
        const totalAmount =
            subtotal -
            totalDiscount -
            quotationDiscountAmount +
            totalTax;

        // Save quotation
        const [quotationResult] = await connection.query(
            `
    INSERT INTO quotations
    (
        user_id,
        customer_id,
        quotation_number,
        issue_date,
        valid_until,
        status,
        subtotal,
        discount_type,
        discount_value,
        discount_amount,
        tax_amount,
        total_amount,
        currency,
        notes,
        terms_and_conditions
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            [
                req.user.id,
                customer_id,
                quotation_number,
                issue_date,
                valid_until || null,
                "draft",
                subtotal,
                quotationDiscountType,
                quotationDiscountValue,
                totalDiscount + quotationDiscountAmount,
                totalTax,
                totalAmount,
                currency || "INR",
                notes || null,
                terms_and_conditions || null,
            ]
        );

        const quotationId = quotationResult.insertId;

        // Save quotation items
        for (const item of quotationItems) {
            await connection.query(
                `
        INSERT INTO quotation_items
        (
            quotation_id,
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
                    quotationId,
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

        //Commit

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Quotation created successfully",
            data: {
                id: quotationId,
                quotation_number,
                subtotal,
                discount_amount:
                    totalDiscount + quotationDiscountAmount,
                tax_amount: totalTax,
                total_amount: totalAmount,
            },
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create quotation error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create quotation",
        });
    } finally {
        connection.release();
    }
};

const updateQuotation = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;

        const {
            customer_id,
            quotation_number,
            issue_date,
            valid_until,
            items,
            discount_type,
            discount_value,
            currency,
            notes,
            terms_and_conditions,
            status,
        } = req.body;

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: "Customer is required",
            });
        }

        if (!quotation_number || !quotation_number.trim()) {
            return res.status(400).json({
                success: false,
                message: "Quotation number is required",
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
                message: "At least one quotation item is required",
            });
        }

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

        const [existingQuotation] = await connection.query(
            `
            SELECT id
            FROM quotations
            WHERE id = ? AND user_id = ?
            `,
            [id, req.user.id]
        );

        if (existingQuotation.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        await connection.beginTransaction();

        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const quotationItems = [];

        for (const item of items) {
            if (!item.product_id) {
                throw new Error(
                    "Product is required for every quotation item"
                );
            }

            const quantity = Number(item.quantity);

            if (!quantity || quantity <= 0) {
                throw new Error("Quantity must be greater than 0");
            }

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

            const itemSubtotal = quantity * unitPrice;

            const itemDiscountType = item.discount_type || "fixed";
            const itemDiscountValue =
                Number(item.discount_value || 0);

            let itemDiscountAmount = 0;

            if (itemDiscountType === "percentage") {
                itemDiscountAmount =
                    itemSubtotal *
                    (itemDiscountValue / 100);
            } else {
                itemDiscountAmount = itemDiscountValue;
            }

            itemDiscountAmount = Math.min(
                itemDiscountAmount,
                itemSubtotal
            );

            const taxableAmount =
                itemSubtotal - itemDiscountAmount;

            const itemTaxAmount =
                taxableAmount * (taxRate / 100);

            const lineTotal =
                taxableAmount + itemTaxAmount;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscountAmount;
            totalTax += itemTaxAmount;

            quotationItems.push({
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

        const quotationDiscountType =
            discount_type || "fixed";

        const quotationDiscountValue =
            Number(discount_value || 0);

        const amountAfterItemDiscount =
            subtotal - totalDiscount;

        let quotationDiscountAmount = 0;

        if (quotationDiscountType === "percentage") {
            quotationDiscountAmount =
                amountAfterItemDiscount *
                (quotationDiscountValue / 100);
        } else {
            quotationDiscountAmount =
                quotationDiscountValue;
        }

        quotationDiscountAmount = Math.min(
            quotationDiscountAmount,
            amountAfterItemDiscount
        );

        const totalAmount =
            subtotal -
            totalDiscount -
            quotationDiscountAmount +
            totalTax;

        await connection.query(
            `
            UPDATE quotations
            SET
                customer_id = ?,
                quotation_number = ?,
                issue_date = ?,
                valid_until = ?,
                status = ?,
                subtotal = ?,
                discount_type = ?,
                discount_value = ?,
                discount_amount = ?,
                tax_amount = ?,
                total_amount = ?,
                currency = ?,
                notes = ?,
                terms_and_conditions = ?
            WHERE id = ? AND user_id = ?
            `,
            [
                customer_id,
                quotation_number,
                issue_date,
                valid_until || null,
                status || "draft",
                subtotal,
                quotationDiscountType,
                quotationDiscountValue,
                totalDiscount + quotationDiscountAmount,
                totalTax,
                totalAmount,
                currency || "INR",
                notes || null,
                terms_and_conditions || null,
                id,
                req.user.id,
            ]
        );

        await connection.query(
            `
            DELETE FROM quotation_items
            WHERE quotation_id = ?
            `,
            [id]
        );

        for (const item of quotationItems) {
            await connection.query(
                `
                INSERT INTO quotation_items
                (
                    quotation_id,
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
            message: "Quotation updated successfully",
            data: {
                id,
                quotation_number,
                subtotal,
                discount_amount:
                    totalDiscount +
                    quotationDiscountAmount,
                tax_amount: totalTax,
                total_amount: totalAmount,
            },
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update quotation error:", error);

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update quotation",
        });
    } finally {
        connection.release();
    }
};

const deleteQuotation = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Check quotation ownership
        const [quotations] = await connection.query(
            `SELECT id
             FROM quotations
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        if (quotations.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        // Delete quotation items first
        await connection.query(
            `DELETE FROM quotation_items
             WHERE quotation_id = ?`,
            [id]
        );

        // Delete quotation
        await connection.query(
            `DELETE FROM quotations
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Quotation deleted successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Delete quotation error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete quotation",
        });
    } finally {
        connection.release();
    }
};

//convertQuotation To invoice

const convertQuotationToInvoice = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // 1. Get quotation and check ownership
        const [quotations] = await connection.query(
            `SELECT *
             FROM quotations
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        if (quotations.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        const quotation = quotations[0];

        // Prevent duplicate conversion
        if (quotation.status === "accepted") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This quotation has already been converted to an invoice",
            });
        }

        // 2. Get quotation items
        const [quotationItems] = await connection.query(
            `SELECT *
             FROM quotation_items
             WHERE quotation_id = ?`,
            [id]
        );

        if (quotationItems.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Quotation has no items",
            });
        }

        // 3. Generate invoice number
        const [lastInvoices] = await connection.query(
            `SELECT invoice_number
             FROM invoices
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT 1`,
            [req.user.id]
        );

        let invoiceNumber;

        if (lastInvoices.length === 0) {
            invoiceNumber = "INV-0001";
        } else {
            const lastNumber = lastInvoices[0].invoice_number;

            const numberPart = parseInt(
                lastNumber.replace(/\D/g, ""),
                10
            ) || 0;

            invoiceNumber = `INV-${String(numberPart + 1).padStart(4, "0")}`;
        }

        // 4. Create invoice
        const [invoiceResult] = await connection.query(
            `INSERT INTO invoices
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
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                quotation.customer_id,
                invoiceNumber,
                quotation.issue_date,
                quotation.valid_until,
                "pending",
                quotation.subtotal,
                quotation.discount_type,
                quotation.discount_value,
                quotation.discount_amount,
                quotation.tax_amount,
                quotation.total_amount,
                0,
                quotation.total_amount,
                quotation.currency || "INR",
                quotation.notes || null,
            ]
        );

        const invoiceId = invoiceResult.insertId;

        // 5. Copy quotation items to invoice items
        for (const item of quotationItems) {
            await connection.query(
                `INSERT INTO invoice_items
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
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

        // 6. Mark quotation as accepted
        await connection.query(
            `UPDATE quotations
             SET status = 'accepted'
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Quotation converted to invoice successfully",
            data: {
                invoice_id: invoiceId,
                invoice_number: invoiceNumber,
            },
        });
    } catch (error) {
        await connection.rollback();

        console.error("Convert quotation to invoice error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to convert quotation to invoice",
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
};