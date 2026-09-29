import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInvoiceById,
  updatePaymentStatus,
  deleteInvoice,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

    const remainingAmount = Number(invoice.remaining_amount || 0);

    if (Number(paidAmount) > remainingAmount) {
      alert(
        `Payment cannot exceed the remaining amount of ₹${remainingAmount.toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}`,
      );
      return;
    }

    try {
      setPaymentLoading(true);

      const response = await updatePaymentStatus(id, Number(paidAmount));

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

  // Delete handler

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteInvoice(invoice.id);

      setShowDeleteModal(false);

      navigate("/invoices");
    } catch (error) {
      console.error("Delete invoice error:", error);

      alert(error.message || "Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector(".invoice-preview");

    if (!element) {
      alert("Invoice preview not found");
      return;
    }

    let pdfElement = null;

    try {
      /*
       * Create temporary PDF-only copy.
       * The actual screen invoice remains untouched.
       */
      pdfElement = element.cloneNode(true);

      pdfElement.classList.add("invoice-pdf-mode");

      pdfElement.style.position = "absolute";
      pdfElement.style.left = "-10000px";
      pdfElement.style.top = "0";
      pdfElement.style.width = `${element.offsetWidth}px`;
      pdfElement.style.height = "auto";
      pdfElement.style.minHeight = "0";
      pdfElement.style.margin = "0";

      document.body.appendChild(pdfElement);

      /*
       * Convert invoice to canvas.
       */
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,

        windowWidth: pdfElement.scrollWidth,
        windowHeight: pdfElement.scrollHeight,
      });

      /*
       * Remove temporary element.
       */
      document.body.removeChild(pdfElement);
      pdfElement = null;

      const imageData = canvas.toDataURL("image/png");

      /*
       * Create A4 PDF.
       */
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth = pageWidth - margin * 2;

      /*
       * Keep the invoice width large and readable.
       */
      const imageWidth = availableWidth;

      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      /*
       * Height represented by one PDF page.
       */
      const availableHeight = pageHeight - margin * 2;

      /*
       * Calculate number of pages required.
       */
      const totalPages = Math.ceil(imageHeight / availableHeight);

      /*
       * Add invoice across multiple A4 pages.
       */
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const positionY = margin - page * availableHeight;

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          positionY,
          imageWidth,
          imageHeight,
        );
      }

      /*
       * Download PDF.
       */
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);

      /*
       * Make sure temporary element
       * is removed if an error occurs.
       */
      if (pdfElement && pdfElement.parentNode) {
        pdfElement.parentNode.removeChild(pdfElement);
      }

      alert("Failed to generate PDF. Please try again.");
    }
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
      <div className="invoice-details-page-header">
        <h1>Invoice Preview</h1>

        <div className="invoice-details-page-header-actions">
          <Button
            className="invoice-details-download-btn"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

          <button
            type="button"
            className="invoice-print-btn"
            onClick={() => window.print()}
          >
            Print
          </button>

          <Button
            className="invoice-details-edit-btn"
            variant="secondary"
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            Edit
          </Button>

          <Button
            className="invoice-details-delete-btn"
            variant="secondary"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>

          <Button
            className="invoice-details-back-btn"
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
              <strong>Issue Date:</strong> {formatDate(invoice.issue_date)}
            </p>

            <p>
              <strong>Due Date:</strong> {formatDate(invoice.due_date)}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`invoice-status ${invoice.status}`}>
                {invoice.status
                  ?.replaceAll("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </span>
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

                      {item.description && <div>{item.description}</div>}
                    </td>

                    <td>{item.quantity}</td>

                    <td>₹{Number(item.unit_price).toFixed(2)}</td>

                    <td>₹{Number(item.discount_amount).toFixed(2)}</td>

                    <td>₹{Number(item.tax_amount).toFixed(2)}</td>

                    <td>₹{Number(item.line_total).toFixed(2)}</td>
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
            <strong>₹{Number(invoice.subtotal).toFixed(2)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>₹{Number(invoice.discount_amount).toFixed(2)}</strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>₹{Number(invoice.tax_amount).toFixed(2)}</strong>
          </div>

          <div className="invoice-total">
            <span>Total</span>
            <strong>₹{Number(invoice.total_amount).toFixed(2)}</strong>
          </div>

          <div>
            <span>Paid</span>
            <strong>₹{Number(invoice.paid_amount).toFixed(2)}</strong>
          </div>

          <div>
            <span>Remaining</span>
            <strong>₹{Number(invoice.remaining_amount).toFixed(2)}</strong>
          </div>

          {/* payment progress */}

          <div className="payment-progress">
            <div className="payment-progress-header">
              <span>Payment Progress</span>

              <strong>
                {invoice.total_amount > 0
                  ? Math.round(
                      (Number(invoice.paid_amount || 0) /
                        Number(invoice.total_amount)) *
                        100,
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="payment-progress-bar">
              <div
                className="payment-progress-fill"
                style={{
                  width: `${
                    invoice.total_amount > 0
                      ? Math.min(
                          100,
                          (Number(invoice.paid_amount || 0) /
                            Number(invoice.total_amount)) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
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

            <Button onClick={handlePaymentUpdate} disabled={paymentLoading}>
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

      {/* =========================================================
    DELETE CONFIRMATION MODAL
========================================================= */}

      {showDeleteModal && (
        <div
          className="invoice-details-delete-overlay"
          onClick={() => {
            if (!deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className="invoice-details-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="invoice-details-delete-icon">!</div>

            <div className="invoice-details-delete-content">
              <h3>Delete Invoice?</h3>

              <p>
                Are you sure you want to delete{" "}
                <strong>{invoice.invoice_number}</strong>?
              </p>

              <span>This action cannot be undone.</span>
            </div>

            <div className="invoice-details-delete-actions">
              <button
                type="button"
                className="invoice-details-delete-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="invoice-details-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceDetails;
