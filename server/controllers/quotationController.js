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

module.exports = {
    getQuotations,
    createQuotation,
};