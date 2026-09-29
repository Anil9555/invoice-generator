import { useEffect, useState } from "react";
import { getInvoices, deleteInvoice } from "../services/invoiceService";

import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // =========================
  // DELETE INVOICE
  // =========================

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      await deleteInvoice(id);

      setInvoices((currentInvoices) =>
        currentInvoices.filter((invoice) => invoice.id !== id),
      );

      setInvoiceToDelete(null);
    } catch (error) {
      console.error("Delete invoice error:", error);

      alert(error.message || "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // FETCH INVOICES
  // =========================

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

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================
  // FORMAT STATUS
  // =========================

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================
  // FILTER INVOICES
  // =========================

  const filteredInvoices = invoices.filter((invoice) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      invoice.invoice_number?.toLowerCase().includes(searchValue) ||
      invoice.customer_name?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="invoices-page">
      {/* =========================================
            PAGE HEADER
        ========================================= */}
      <div className="invoices-page-header">
        <div>
          <span className="invoices-eyebrow">WORKSPACE</span>

          <h1>Invoices</h1>

          <p>Manage, track and organize all your invoices.</p>
        </div>

        <button
          type="button"
          className="invoices-create-btn"
          onClick={() => navigate("/invoices/new")}
        >
          + Create Invoice
        </button>
      </div>

      {/* =========================================
            INVOICE CONTENT CARD
        ========================================= */}
      <div className="invoices-card">
        <div className="invoices-card-header">
          <div>
            <h2>All Invoices</h2>

            <p>
              {filteredInvoices.length}{" "}
              {filteredInvoices.length === 1 ? "invoice" : "invoices"}
              found
            </p>
          </div>

          {/* Invoice Filters */}

          <div className="invoices-filters">
            <div className="invoice-search-wrapper">
              <span className="invoice-search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="invoice-status-filter"
            >
              <option value="all">All Status</option>

              <option value="pending">Pending</option>

              <option value="partially_paid">Partially Paid</option>

              <option value="paid">Paid</option>

              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* =========================================
                EMPTY STATE
            ========================================= */}
        {invoices.length === 0 ? (
          <div className="invoices-empty-state">
            <div className="invoices-empty-icon">₹</div>

            <h3>No invoices found</h3>

            <p>
              Create your first invoice to start tracking your business
              payments.
            </p>

            <button
              type="button"
              className="invoices-create-btn"
              onClick={() => navigate("/invoices/new")}
            >
              + Create Invoice
            </button>
          </div>
        ) : (
          /* =========================================
                   INVOICE TABLE
                ========================================= */
          <div className="invoices-table-wrapper">
            <table className="invoices-table">
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
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong className="invoice-number">
                        {invoice.invoice_number}
                      </strong>
                    </td>

                    <td>
                      <span className="invoice-customer">
                        {invoice.customer_name}
                      </span>
                    </td>

                    <td>{formatDate(invoice.issue_date)}</td>

                    <td>{formatDate(invoice.due_date)}</td>

                    <td>
                      <span
                        className={`invoice-status-badge ${invoice.status}`}
                      >
                        {invoice.status
                          ?.replaceAll("_", " ")
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </span>
                    </td>

                    <td>
                      <strong className="invoice-total">
                        ₹
                        {Number(invoice.total_amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </td>

                    <td>
                      <div className="invoice-actions">
                        <button
                          type="button"
                          className="invoice-action-btn view"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="invoice-action-btn edit"
                          onClick={() =>
                            navigate(`/invoices/${invoice.id}/edit`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="invoice-action-btn delete"
                          onClick={() => setInvoiceToDelete(invoice)}
                          disabled={deletingId === invoice.id}
                        >
                          {deletingId === invoice.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================
    DELETE CONFIRMATION MODAL
========================================= */}

      {invoiceToDelete && (
        <div
          className="invoice-delete-overlay"
          onClick={() => {
            if (!deletingId) {
              setInvoiceToDelete(null);
            }
          }}
        >
          <div
            className="invoice-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-delete-icon">!</div>

            <div className="invoice-delete-content">
              <h3>Delete Invoice?</h3>

              <p>
                Are you sure you want to delete invoice{" "}
                <strong>{invoiceToDelete.invoice_number}</strong>?
              </p>

              <span>This action cannot be undone.</span>
            </div>

            <div className="invoice-delete-actions">
              <button
                type="button"
                className="invoice-delete-cancel"
                onClick={() => setInvoiceToDelete(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="invoice-delete-confirm"
                onClick={() => handleDelete(invoiceToDelete.id)}
                disabled={deletingId === invoiceToDelete.id}
              >
                {deletingId === invoiceToDelete.id
                  ? "Deleting..."
                  : "Delete Invoice"}
              </button>
            </div>
          </div>
        </div>
      )};
    </div>
  );
}

export default Invoices;
