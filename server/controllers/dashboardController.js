const db = require("../config/db");

const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // =========================
        // INVOICE SUMMARY
        // =========================

        const [invoiceStats] = await db.query(
            `
            SELECT
                COUNT(*) AS total_invoices,
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COALESCE(SUM(paid_amount), 0) AS paid_amount,
                COALESCE(SUM(remaining_amount), 0) AS remaining_amount
            FROM invoices
            WHERE user_id = ?
            `,
            [userId]
        );


        // =========================
        // INVOICE STATUS
        // =========================

        const [invoiceStatusStats] = await db.query(
            `
            SELECT
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'partially_paid' THEN 1 ELSE 0 END) AS partially_paid,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue
            FROM invoices
            WHERE user_id = ?
            `,
            [userId]
        );


        // =========================
        // QUOTATIONS
        // =========================

        const [quotationStats] = await db.query(
            `
            SELECT COUNT(*) AS total_quotations
            FROM quotations
            WHERE user_id = ?
            `,
            [userId]
        );


        // =========================
        // CUSTOMERS
        // =========================

        const [customerStats] = await db.query(
            `
            SELECT COUNT(*) AS total_customers
            FROM customers
            WHERE user_id = ?
            `,
            [userId]
        );


        // =========================
        // PRODUCTS
        // =========================

        const [productStats] = await db.query(
            `
            SELECT COUNT(*) AS total_products
            FROM products
            WHERE user_id = ?
            `,
            [userId]
        );


        // =========================
        // RECENT INVOICES
        // =========================

        const [recentInvoices] = await db.query(
            `
            SELECT
                id,
                invoice_number,
                issue_date,
                total_amount,
                status
            FROM invoices
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
            `,
            [userId]
        );


        // =========================
        // OVERDUE INVOICES
        // =========================

        const [overdueInvoices] = await db.query(
            `
            SELECT
                id,
                invoice_number,
                customer_id,
                total_amount,
                remaining_amount,
                due_date
            FROM invoices
            WHERE user_id = ?
              AND remaining_amount > 0
              AND due_date < CURDATE()
            ORDER BY due_date ASC
            LIMIT 5
            `,
            [userId]
        );


        // =========================
        // DUE SOON INVOICES
        // =========================

        const [dueSoonInvoices] = await db.query(
            `
            SELECT
                id,
                invoice_number,
                customer_id,
                total_amount,
                remaining_amount,
                due_date
            FROM invoices
            WHERE user_id = ?
              AND remaining_amount > 0
              AND due_date >= CURDATE()
              AND due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY due_date ASC
            LIMIT 5
            `,
            [userId]
        );


        // =========================
        // REVENUE TREND
        // =========================

        const [revenueTrend] = await db.query(
            `
            SELECT
                DATE_FORMAT(issue_date, '%Y-%m') AS month,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM invoices
            WHERE user_id = ?
              AND issue_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
            GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
            ORDER BY month ASC
            `,
            [userId]
        );


        // =========================
        // TOP CUSTOMERS
        // =========================

        const [topCustomers] = await db.query(
            `
            SELECT
                c.id AS customer_id,
                c.name AS customer_name,
                COALESCE(SUM(i.total_amount), 0) AS total_amount
            FROM invoices i
            INNER JOIN customers c
                ON c.id = i.customer_id
            WHERE i.user_id = ?
            GROUP BY c.id, c.name
            ORDER BY total_amount DESC
            LIMIT 5
            `,
            [userId]
        );


        // =========================
        // FINAL RESPONSE
        // =========================

        res.json({
            success: true,

            data: {

                // Invoice summary
                total_invoices: invoiceStats[0].total_invoices,
                total_sales: invoiceStats[0].total_sales,
                paid_amount: invoiceStats[0].paid_amount,
                remaining_amount: invoiceStats[0].remaining_amount,


                // Invoice status
                invoice_status: {
                    pending: Number(
                        invoiceStatusStats[0].pending || 0
                    ),

                    partially_paid: Number(
                        invoiceStatusStats[0].partially_paid || 0
                    ),

                    paid: Number(
                        invoiceStatusStats[0].paid || 0
                    ),

                    overdue: Number(
                        invoiceStatusStats[0].overdue || 0
                    ),
                },


                // Other statistics
                total_quotations:
                    quotationStats[0].total_quotations,

                total_customers:
                    customerStats[0].total_customers,

                total_products:
                    productStats[0].total_products,


                // Dashboard sections
                recent_invoices: recentInvoices,

                overdue_invoices: overdueInvoices,

                due_soon_invoices: dueSoonInvoices,

                revenue_trend: revenueTrend,

                top_customers: topCustomers,
            },
        });

    } catch (error) {

        console.error(
            "Dashboard summary error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary",
        });
    }
};


module.exports = {
    getDashboardSummary,
};