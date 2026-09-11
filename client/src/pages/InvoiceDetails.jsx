import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "../services/invoiceService";

function InvoiceDetails() {
    const { id } = useParams();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getInvoiceById(id);

                setInvoice(response.data);
            } catch (error) {
                console.error("Fetch invoice error:", error);
                setError(error.message || "Failed to fetch invoice");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id]);

    if (loading) {
        return <h1>Loading invoice...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!invoice) {
        return <h1>Invoice not found</h1>;
    }

    return (
        <div>
            <h1>Invoice Details</h1>

            <p>
                <strong>Invoice Number:</strong>{" "}
                {invoice.invoice_number}
            </p>

            <p>
                <strong>Customer:</strong>{" "}
                {invoice.customer_name}
            </p>

            <p>
                <strong>Email:</strong>{" "}
                {invoice.customer_email}
            </p>

            <p>
                <strong>Phone:</strong>{" "}
                {invoice.customer_phone}
            </p>

            <p>
                <strong>Issue Date:</strong>{" "}
                {invoice.issue_date}
            </p>

            <p>
                <strong>Due Date:</strong>{" "}
                {invoice.due_date}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {invoice.status}
            </p>

            <h2>Items</h2>

            {invoice.items?.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Tax</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>
                                    ₹{Number(item.unit_price).toFixed(2)}
                                </td>
                                <td>
                                    ₹{Number(item.tax_amount).toFixed(2)}
                                </td>
                                <td>
                                    ₹{Number(item.line_total).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No items found.</p>
            )}

            <h2>Summary</h2>

            <p>
                <strong>Subtotal:</strong>{" "}
                ₹{Number(invoice.subtotal).toFixed(2)}
            </p>

            <p>
                <strong>Discount:</strong>{" "}
                ₹{Number(invoice.discount_amount).toFixed(2)}
            </p>

            <p>
                <strong>Tax:</strong>{" "}
                ₹{Number(invoice.tax_amount).toFixed(2)}
            </p>

            <p>
                <strong>Total:</strong>{" "}
                ₹{Number(invoice.total_amount).toFixed(2)}
            </p>

            <p>
                <strong>Paid:</strong>{" "}
                ₹{Number(invoice.paid_amount).toFixed(2)}
            </p>

            <p>
                <strong>Remaining:</strong>{" "}
                ₹{Number(invoice.remaining_amount).toFixed(2)}
            </p>
        </div>
    );
}

export default InvoiceDetails;