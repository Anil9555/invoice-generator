const db = require("../config/db");

// Get all products
// Get all products
const getProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            `
            SELECT
                id,
                user_id,
                item_type AS type,
                name,
                description,
                sku,
                unit,
                price,
                tax_rate,
                status,
                created_at,
                updated_at
            FROM products
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Create product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            sku,
            unit,
            price,
            tax_rate,
            status,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product/Service name is required",
            });
        }

        if (price === undefined || price === "") {
            return res.status(400).json({
                success: false,
                message: "Price is required",
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative",
            });
        }

        if (
            tax_rate !== undefined &&
            (Number(tax_rate) < 0 || Number(tax_rate) > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "Tax rate must be between 0 and 100",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO products
            (
                user_id,
                name,
                description,
                item_type,
                sku,
                unit,
                price,
                tax_rate,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.user.id,
                name,
                description || null,
                type || "product",
                sku || null,
                unit || null,
                price,
                tax_rate || 0,
                status || "active"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product/Service created successfully",
            data: {
                id: result.insertId,
                name,
                description: description || "",
                type: type || "product",
                sku: sku || "",
                unit: unit || "",
                price,
                tax_rate: tax_rate || 0,
            },
        });
    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product/service",
        });
    }
};


// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            type,
            sku,
            unit,
            price,
            tax_rate,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product/Service name is required",
            });
        }

        if (price === undefined || price === "") {
            return res.status(400).json({
                success: false,
                message: "Price is required",
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative",
            });
        }

        if (
            tax_rate !== undefined &&
            (Number(tax_rate) < 0 || Number(tax_rate) > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "Tax rate must be between 0 and 100",
            });
        }

        const [result] = await db.query(
            `
    UPDATE products
    SET
        name = ?,
        description = ?,
        item_type = ?,
        sku = ?,
        unit = ?,
        price = ?,
        tax_rate = ?,
        status = ?
    WHERE id = ? AND user_id = ?
    `,
            [
                name,
                description || null,
                type || "product",
                sku || null,
                unit || null,
                price,
                tax_rate || 0,
                status || "active",
                id,
                req.user.id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product/Service not found",
            });
        }

        res.json({
            success: true,
            message: "Product/Service updated successfully",
        });
    } catch (error) {
        console.error("Update product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update product/service",
        });
    }
};


// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product/Service not found",
            });
        }

        res.json({
            success: true,
            message: "Product/Service deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product/service",
        });
    }
};


module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};