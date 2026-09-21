import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getQuotationById,
    convertQuotationToInvoice,
} from "../services/quotationService";
import Button from "../components/Button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function QuotationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleDownloadPDF = async () => {
        const element = document.querySelector(".invoice-preview");

        if (!element) {
            alert("Quotation preview not found");
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

        pdf.save(`Quotation-${quotation.quotation_number}.pdf`);
    };

    useEffect(() => {
        fetchQuotation();
    }, [id]);

    const fetchQuotation = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getQuotationById(id);

            setQuotation(response.data);
        } catch (error) {
            console.error("Fetch quotation details error:", error);
            setError(error.message || "Failed to load quotation");
        } finally {
            setLoading(false);
        }
    };

    const handleConvertToInvoice = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to convert this quotation into an invoice?"
        );

        if (!confirmed) return;

        try {
            const response = await convertQuotationToInvoice(id);

            alert(
                `Invoice ${response.data.invoice_number} created successfully!`
            );

            navigate(`/invoices/${response.data.invoice_id}`);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to convert quotation");
        }
    };

    if (loading) {
        return <h1>Loading quotation...</h1>;
    }

    if (error) {
        return (
            <div>
                <p className="form-error">{error}</p>

                <Button onClick={() => navigate("/quotations")}>
                    Back to Quotations
                </Button>
            </div>
        );
    }

    if (!quotation) {
        return <p>Quotation not found.</p>;
    }

    return (
        <div className="invoice-preview-page">

            <div className="page-header">
                <h1>Quotation Preview</h1>

                <div>
                    <Button onClick={handleDownloadPDF}>
                        Download PDF
                    </Button>

                    <Button onClick={handleConvertToInvoice}>
                        Convert to Invoice
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/quotations")}
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
                        <h2>QUOTATION</h2>
                        <p>
                            <strong>
                                #{quotation.quotation_number}
                            </strong>
                        </p>
                    </div>
                </div>

                {/* Customer & Quotation Info */}
                <div className="invoice-info">

                    <div>
                        <h3>Prepared For</h3>

                        <p>
                            <strong>
                                {quotation.customer_name}
                            </strong>
                        </p>

                        <p>
                            {quotation.customer_email || "-"}
                        </p>

                        <p>
                            {quotation.customer_phone || "-"}
                        </p>
                    </div>

                    <div>
                        <p>
                            <strong>Issue Date:</strong>{" "}
                            {quotation.issue_date}
                        </p>

                        <p>
                            <strong>Valid Until:</strong>{" "}
                            {quotation.valid_until || "-"}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {quotation.status}
                        </p>
                    </div>

                </div>

                {/* Items */}
                <div className="invoice-items">

                    <h3>Items</h3>

                    {quotation.items?.length > 0 ? (
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
                                {quotation.items.map((item) => (
                                    <tr key={item.id}>

                                        <td>
                                            <strong>
                                                {item.name}
                                            </strong>

                                            {item.description && (
                                                <div>
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {item.quantity}
                                        </td>

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
                            ₹
                            {Number(
                                quotation.subtotal
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Discount</span>

                        <strong>
                            ₹
                            {Number(
                                quotation.discount_amount
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Tax</span>

                        <strong>
                            ₹
                            {Number(
                                quotation.tax_amount
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div className="invoice-total">
                        <span>Total</span>

                        <strong>
                            ₹
                            {Number(
                                quotation.total_amount
                            ).toFixed(2)}
                        </strong>
                    </div>

                </div>

                {/* Notes */}
                {quotation.notes && (
                    <div className="invoice-notes">
                        <h3>Notes</h3>

                        <p>
                            {quotation.notes}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default QuotationDetails;