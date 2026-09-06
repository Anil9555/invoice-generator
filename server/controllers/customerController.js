const db = require("../config/db");


// Get all customers
const getCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(
            `
    SELECT *
    FROM customers
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: customers,
        });

    } catch (error) {
        console.error("Get customers error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customers",
        });
    }
};


// Create customer
const createCustomer = async (req, res) => {
    try {
        const {
            name,
            company_name,
            email,
            phone,
        } = req.body;


        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required",
            });
        }


        const [result] = await db.query(
            `
            INSERT INTO customers
            (
                user_id,
                name,
                company_name,
                email,
                phone
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                req.user.id,
                name,
                company_name || null,
                email || null,
                phone || null,
            ]
        );


        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: {
                id: result.insertId,
                name,
                company_name: company_name || "",
                email: email || "",
                phone: phone || "",
            },
        });

    } catch (error) {
        console.error("Create customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create customer",
        });
    }
};


// Update customer
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            company_name,
            email,
            phone,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required",
            });
        }

        const [result] = await db.query(
            `
            UPDATE customers
            SET
                name = ?,
                company_name = ?,
                email = ?,
                phone = ?
            WHERE id = ? AND user_id = ?
            `,
            [
                name,
                company_name || null,
                email || null,
                phone || null,
                id,
                req.user.id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.json({
            success: true,
            message: "Customer updated successfully",
        });

    } catch (error) {
        console.error("Update customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update customer",
        });
    }
};


// Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM customers WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully",
        });

    } catch (error) {
        console.error("Delete customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete customer",
        });
    }
};


module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};


