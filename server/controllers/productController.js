const db = require("../config/db");

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
            ORDER BY created_at DESC
            `
        );

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
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

        const [result] = await db.query(
            `
            INSERT INTO products
            (
                user_id,
                name,
                description,
                item_type,
                price,
                tax_rate
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                1,
                name,
                description || null,
                type || "product",
                price,
                tax_rate || 0,
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
            price,
            tax_rate,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product/Service name is required",
            });
        }

        const [result] = await db.query(
            `
            UPDATE products
            SET
                name = ?,
                description = ?,
                item_type = ?,
                price = ?,
                tax_rate = ?
            WHERE id = ?
            `,
            [
                name,
                description || null,
                type || "product",
                price,
                tax_rate || 0,
                id,
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
            "DELETE FROM products WHERE id = ?",
            [id]
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