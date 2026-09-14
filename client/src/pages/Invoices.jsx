import { useEffect, useState } from "react";
import {
    getInvoices,
    deleteInvoice,
} from "../services/invoiceService";

import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this invoice?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            await deleteInvoice(id);

            setInvoices((currentInvoices) =>
                currentInvoices.filter((invoice) => invoice.id !== id)
            );
        } catch (error) {
            console.error("Delete invoice error:", error);
            alert(error.message || "Failed to delete invoice");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getInvoices();

                setInvoices(response.data || []);
            } catch (error) {
                console.error("Fetch invoices error:", error);
                setError(error.message || "Failed to fetch invoices");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) {
        return <h1>Loading invoices...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    return (
        <div>
            <h1>Invoices</h1>

            {invoices.length === 0 ? (
                <p>No invoices found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Invoice No.</th>
                            <th>Customer</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.invoice_number}</td>
                                <td>{invoice.customer_name}</td>
                                <td>{formatDate(invoice.issue_date)}</td>
                                <td>{formatDate(invoice.due_date)}</td>
                                <td>{invoice.status}</td>
                                <td>
                                    ₹{Number(invoice.total_amount).toFixed(2)}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                                    >
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(invoice.id)}
                                        disabled={deletingId === invoice.id}
                                    >
                                        {deletingId === invoice.id ? "Deleting..." : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Invoices;