import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getInvoiceById,
    updatePaymentStatus,
} from "../services/invoiceService";
import Button from "../components/Button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "../utils/formatDate";

function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePaymentUpdate = async () => {
        if (paidAmount === "") {
            alert("Please enter paid amount");
            return;
        }

        if (Number(paidAmount) <= 0) {
            alert("Payment amount must be greater than 0");
            return;
        }

        try {
            setPaymentLoading(true);

            const response = await updatePaymentStatus(
                id,
                Number(paidAmount)
            );

            setInvoice((prev) => ({
                ...prev,
                paid_amount: response.data.paid_amount,
                remaining_amount: response.data.remaining_amount,
                status: response.data.status,
            }));

            setPaidAmount("");

            alert("Payment updated successfully");
        } catch (error) {
            console.error("Payment update error:", error);
            alert(error.message || "Failed to update payment");
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.querySelector(".invoice-preview");

        if (!element) {
            alert("Invoice preview not found");
            return;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
        });

        const imageData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imageWidth = pdfWidth;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;

        let heightLeft = imageHeight;
        let position = 0;

        pdf.addImage(
            imageData,
            "PNG",
            0,
            position,
            imageWidth,
            imageHeight
        );

        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imageHeight;

            pdf.addPage();

            pdf.addImage(
                imageData,
                "PNG",
                0,
                position,
                imageWidth,
                imageHeight
            );

            heightLeft -= pdfHeight;
        }

        pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
    };

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
        <div className="invoice-preview-page">

            <div className="page-header">
                <h1>Invoice Preview</h1>

                <div>
                    <Button onClick={handleDownloadPDF}>
                        Download PDF
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/invoices")}
                    >
                        Back
                    </Button>
                </div>
            </div>

            <div className="invoice-preview">

                {/* Header */}
                <div className="invoice-header">
                    <div>
                        <h1>InvoicePro</h1>
                        <p>Invoice & Quotation Generator</p>
                    </div>

                    <div>
                        <h2>INVOICE</h2>
                        <p>
                            <strong>#{invoice.invoice_number}</strong>
                        </p>
                    </div>
                </div>

                {/* Customer & Invoice Info */}
                <div className="invoice-info">

                    <div>
                        <h3>Bill To</h3>

                        <p>
                            <strong>{invoice.customer_name}</strong>
                        </p>

                        <p>{invoice.customer_email}</p>
                        <p>{invoice.customer_phone}</p>
                    </div>

                    <div>
                        <p>
                            <strong>Issue Date:</strong>{" "}
                            {formatDate(invoice.issue_date)}
                        </p>

                        <p>
                            <strong>Due Date:</strong>{" "}
                            {formatDate(invoice.due_date)}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {invoice.status}
                        </p>
                    </div>

                </div>

                {/* Items */}
                <div className="invoice-items">

                    <h3>Items</h3>

                    {invoice.items?.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Discount</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.name}</strong>

                                            {item.description && (
                                                <div>
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>

                                        <td>{item.quantity}</td>

                                        <td>
                                            ₹
                                            {Number(
                                                item.unit_price
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                item.discount_amount
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                item.tax_amount
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                item.line_total
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No items found.</p>
                    )}

                </div>

                {/* Summary */}
                <div className="invoice-summary">

                    <div>
                        <span>Subtotal</span>
                        <strong>
                            ₹{Number(invoice.subtotal).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Discount</span>
                        <strong>
                            ₹{Number(invoice.discount_amount).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Tax</span>
                        <strong>
                            ₹{Number(invoice.tax_amount).toFixed(2)}
                        </strong>
                    </div>

                    <div className="invoice-total">
                        <span>Total</span>
                        <strong>
                            ₹{Number(invoice.total_amount).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Paid</span>
                        <strong>
                            ₹{Number(invoice.paid_amount).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Remaining</span>
                        <strong>
                            ₹{Number(invoice.remaining_amount).toFixed(2)}
                        </strong>
                    </div>

                </div>

                <div className="payment-section">
                    <h3>Update Payment</h3>

                    <div className="payment-form">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter paid amount"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                        />

                        <Button
                            onClick={handlePaymentUpdate}
                            disabled={paymentLoading}
                        >
                            {paymentLoading ? "Updating..." : "Update Payment"}
                        </Button>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="invoice-notes">
                        <h3>Notes</h3>
                        <p>{invoice.notes}</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default InvoiceDetails;