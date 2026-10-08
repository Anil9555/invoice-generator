import Card from "../components/Card";
import Button from "../components/Button";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [revenuePeriod, setRevenuePeriod] = useState("6");

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardSummary();

      setSummary(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  // =========================
  // HELPERS
  // =========================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const difference = today - due;

    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
  };

  // =========================
  // PAYMENT DATA
  // =========================

  const totalSales = Number(summary?.total_sales || 0);
  const paidAmount = Number(summary?.paid_amount || 0);
  const remainingAmount = Number(summary?.remaining_amount || 0);

  const paymentPercentage =
    totalSales > 0
      ? Math.min(100, Math.round((paidAmount / totalSales) * 100))
      : 0;

  // =========================
  // INVOICE FILTER
  // =========================

  const filteredInvoices = useMemo(() => {
    const invoices = summary?.recent_invoices || [];

    return invoices.filter((invoice) => {
      const matchesStatus =
        invoiceFilter === "all" || invoice.status === invoiceFilter;

      const search = invoiceSearch.toLowerCase().trim();

      const matchesSearch =
        !search || invoice.invoice_number?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [summary, invoiceFilter, invoiceSearch]);

  // =========================
  // REVENUE TREND
  // =========================

  const revenueData = useMemo(() => {
    const data = summary?.revenue_trend || [];

    const months = Number(revenuePeriod);

    return data.slice(-months);
  }, [summary, revenuePeriod]);

  const maxRevenue = Math.max(
    ...revenueData.map((item) => Number(item.revenue || 0)),
    1,
  );

  // =========================
  // QUICK ACTION
  // =========================

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Create a new customer invoice",
      action: () => navigate("/invoices/new"),
      primary: true,
    },
    {
      title: "Create Quotation",
      description: "Prepare a new quotation",
      action: () => navigate("/quotations"),
    },
    {
      title: "Add Customer",
      description: "Add a new customer",
      action: () => navigate("/customers"),
    },
    {
      title: "Add Product",
      description: "Add product or service",
      action: () => navigate("/products"),
    },
  ];

  return (
    <div className="dashboard-page">
      {/* =========================================
                HEADER
            ========================================= */}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">BUSINESS OVERVIEW</span>

          <h1>Dashboard</h1>

          <p>
            Monitor your invoices, payments and business activity from one
            place.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Button onClick={() => navigate("/invoices/new")}>
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* =========================================
                ERROR
            ========================================= */}

      {error && (
        <Card className="dashboard-error">
          <div>
            <strong>Unable to load dashboard</strong>

            <p>{error}</p>
          </div>

          <Button variant="secondary" onClick={fetchDashboardSummary}>
            Retry
          </Button>
        </Card>
      )}

      {/* =========================================
                SUMMARY CARDS
            ========================================= */}

      <div className="dashboard-stats-grid">
        {/* Total Revenue */}
        <Card className="dashboard-stat-card revenue-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">₹</div>

            <span className="dashboard-stat-label">Total Revenue</span>
          </div>

          <div className="dashboard-stat-content">
            <h2>{formatCurrency(totalSales)}</h2>

            <small>Total invoiced amount</small>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card className="dashboard-stat-card invoice-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">#</div>

            <span className="dashboard-stat-label">Total Invoices</span>
          </div>

          <div className="dashboard-stat-content">
            <h2>{summary?.total_invoices || 0}</h2>

            <small>All created invoices</small>
          </div>
        </Card>

        {/* Outstanding */}
        <Card className="dashboard-stat-card outstanding-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">!</div>

            <span className="dashboard-stat-label">Outstanding</span>
          </div>

          <div className="dashboard-stat-content">
            <h2>{formatCurrency(remainingAmount)}</h2>

            <small>Awaiting payment</small>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="dashboard-stat-card customer-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">👥</div>

            <span className="dashboard-stat-label">Total Customers</span>
          </div>

          <div className="dashboard-stat-content">
            <h2>{summary?.total_customers || 0}</h2>

            <small>Customers in your account</small>
          </div>
        </Card>
      </div>

      {/* =========================================
                PAYMENT OVERVIEW
            ========================================= */}

      <Card className="dashboard-payment-card">
        <div className="dashboard-section-header">
          <div>
            <h3>Payment Overview</h3>

            <p>Track how much of your invoiced amount has been collected.</p>
          </div>

          <span className="dashboard-period-label">Overall</span>
        </div>

        <div className="dashboard-payment-content">
          <div className="dashboard-payment-circle-wrapper">
            <div
              className="dashboard-payment-circle"
              style={{
                "--payment-progress": `${paymentPercentage}%`,
              }}
            >
              <div className="dashboard-payment-circle-inner">
                <strong>{paymentPercentage}%</strong>

                <span>Collected</span>
              </div>
            </div>
          </div>

          <div className="dashboard-payment-details">
            <div className="payment-detail-item">
              <span>Total Invoiced</span>
              <strong>{formatCurrency(totalSales)}</strong>
            </div>

            <div className="payment-detail-item">
              <span>Paid</span>
              <strong>{formatCurrency(paidAmount)}</strong>
            </div>

            <div className="payment-detail-item">
              <span>Outstanding</span>
              <strong>{formatCurrency(remainingAmount)}</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* =========================================
                ACTION REQUIRED + INVOICE STATUS
            ========================================= */}

      <div className="dashboard-two-column">
        {/* ACTION REQUIRED */}

        <Card className="dashboard-action-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Action Required</h3>

              <p>Things that may need your attention.</p>
            </div>
          </div>

          <div className="action-required-list">
            <div
              className="action-required-item danger"
              onClick={() => navigate("/invoices")}
            >
              <div className="action-icon">!</div>

              <div className="action-content">
                <strong>
                  {summary?.overdue_invoices?.length || 0} overdue invoices
                </strong>

                <span>Follow up on outstanding payments</span>
              </div>

              <span className="action-arrow">→</span>
            </div>

            <div
              className="action-required-item warning"
              onClick={() => navigate("/invoices")}
            >
              <div className="action-icon">!</div>

              <div className="action-content">
                <strong>
                  {summary?.due_soon_invoices?.length || 0} invoices due soon
                </strong>

                <span>Due within the next 7 days</span>
              </div>

              <span className="action-arrow">→</span>
            </div>

            <div
              className="action-required-item info"
              onClick={() => navigate("/quotations")}
            >
              <div className="action-icon">Q</div>

              <div className="action-content">
                <strong>{summary?.total_quotations || 0} quotations</strong>

                <span>Manage your quotations</span>
              </div>

              <span className="action-arrow">→</span>
            </div>
          </div>
        </Card>

        {/* INVOICE STATUS */}

        <Card className="dashboard-status-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Invoice Status</h3>

              <p>Current invoice breakdown.</p>
            </div>
          </div>

          <div className="invoice-status-list">
            <div className="invoice-status-row">
              <span>
                <i className="status-dot pending"></i>
                Pending
              </span>

              <strong>{summary?.invoice_status?.pending || 0}</strong>
            </div>

            <div className="invoice-status-row">
              <span>
                <i className="status-dot partially-paid"></i>
                Partially Paid
              </span>

              <strong>{summary?.invoice_status?.partially_paid || 0}</strong>
            </div>

            <div className="invoice-status-row">
              <span>
                <i className="status-dot paid"></i>
                Paid
              </span>

              <strong>{summary?.invoice_status?.paid || 0}</strong>
            </div>

            <div className="invoice-status-row">
              <span>
                <i className="status-dot overdue"></i>
                Overdue
              </span>

              <strong>{summary?.invoice_status?.overdue || 0}</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================
                REVENUE TREND
            ========================================= */}

      <Card className="dashboard-revenue-card">
        <div className="dashboard-section-header">
          <div>
            <h3>Revenue Trend</h3>

            <p>Your invoice revenue over time.</p>
          </div>

          <select
            value={revenuePeriod}
            onChange={(e) => setRevenuePeriod(e.target.value)}
            className="dashboard-filter-select"
          >
            <option value="3">Last 3 months</option>

            <option value="6">Last 6 months</option>

            <option value="12">Last 12 months</option>
          </select>
        </div>

        {revenueData.length > 0 ? (
          <div className="revenue-chart">
            {revenueData.map((item) => {
              const revenue = Number(item.revenue || 0);

              const height = Math.max(5, (revenue / maxRevenue) * 100);

              const monthLabel = new Date(
                `${item.month}-01`,
              ).toLocaleDateString("en-IN", {
                month: "short",
              });

              return (
                <div className="revenue-bar-wrapper" key={item.month}>
                  <div className="revenue-bar-value">
                    {formatCurrency(revenue)}
                  </div>

                  <div className="revenue-bar-container">
                    <div
                      className="revenue-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    ></div>
                  </div>

                  <span>{monthLabel}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <h3>No revenue data yet</h3>

            <p>Create invoices to start tracking your revenue trend.</p>
          </div>
        )}
      </Card>

      {/* =========================================
                OVERDUE + DUE SOON
            ========================================= */}

      <div className="dashboard-two-column">
        {/* OVERDUE */}

        <Card className="dashboard-list-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Overdue Payments</h3>

              <p>Payments that need follow-up.</p>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                navigate("/invoices");
              }}
            >
              View All
            </Button>
          </div>

          {summary?.overdue_invoices?.length > 0 ? (
            <div className="dashboard-payment-list">
              {summary.overdue_invoices.map((invoice) => (
                <div
                  className="dashboard-payment-item"
                  key={invoice.id}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div>
                    <strong>{invoice.invoice_number}</strong>

                    <span>{getDaysOverdue(invoice.due_date)} days overdue</span>
                  </div>

                  <strong className="amount-danger">
                    {formatCurrency(invoice.remaining_amount)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-small-empty">
              <strong>No overdue payments</strong>
              <span>You're all caught up.</span>
            </div>
          )}
        </Card>

        {/* DUE SOON */}

        <Card className="dashboard-list-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Due Soon</h3>

              <p>Payments due within 7 days.</p>
            </div>
          </div>

          {summary?.due_soon_invoices?.length > 0 ? (
            <div className="dashboard-payment-list">
              {summary.due_soon_invoices.map((invoice) => (
                <div
                  className="dashboard-payment-item"
                  key={invoice.id}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div>
                    <strong>{invoice.invoice_number}</strong>

                    <span>Due {formatDate(invoice.due_date)}</span>
                  </div>

                  <strong className="amount-warning">
                    {formatCurrency(invoice.remaining_amount)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-small-empty">
              <strong>No payments due soon</strong>

              <span>Nothing due in the next 7 days.</span>
            </div>
          )}
        </Card>
      </div>

      {/* =========================================
                RECENT INVOICES
            ========================================= */}

      <Card className="dashboard-recent-card">
        <div className="dashboard-section-header">
          <div>
            <h3>Recent Invoices</h3>

            <p>Quickly find and open your latest invoices.</p>
          </div>

          <Button variant="secondary" onClick={() => navigate("/invoices")}>
            View All
          </Button>
        </div>

        <div className="invoice-toolbar">
          <input
            type="text"
            placeholder="Search invoice number..."
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
          />

          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            <option value="pending">Pending</option>

            <option value="partially_paid">Partially Paid</option>

            <option value="paid">Paid</option>

            <option value="overdue">Overdue</option>
          </select>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <div className="dashboard-invoice-table">
            <div className="invoice-table-header">
              <span>Invoice</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {filteredInvoices.map((invoice) => (
              <div
                className="invoice-table-row"
                key={invoice.id}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <strong>{invoice.invoice_number}</strong>

                <span>{formatDate(invoice.issue_date)}</span>

                <strong>{formatCurrency(invoice.total_amount)}</strong>

                <span className={`invoice-status ${invoice.status}`}>
                  {formatStatus(invoice.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <h3>No invoices found</h3>

            <p>Try changing your search or status filter.</p>
          </div>
        )}
      </Card>

      {/* ========================================= QUICK ACTIONS */}

      <div className="dashboard-two-column">
        {/* TOP CUSTOMERS */}

        <Card className="dashboard-list-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Top Customers</h3>

              <p>Customers by invoice value.</p>
            </div>

            <Button variant="secondary" onClick={() => navigate("/customers")}>
              Customers
            </Button>
          </div>

          {summary?.top_customers?.length > 0 ? (
            <div className="top-customer-list">
              {summary.top_customers.map((customer, index) => (
                <div className="top-customer-item" key={customer.customer_id}>
                  <div className="customer-rank">{index + 1}</div>

                  <div className="customer-info">
                    <strong>{customer.customer_name}</strong>

                    <span>Customer</span>
                  </div>

                  <strong>{formatCurrency(customer.total_amount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-small-empty">
              <strong>No customer data yet</strong>

              <span>Create invoices to see your top customers.</span>
            </div>
          )}
        </Card>

        {/* QUICK ACTIONS */}

        <Card className="dashboard-quick-actions">
          <div className="dashboard-section-header">
            <div>
              <h3>Quick Actions</h3>

              <p>Common tasks, right at your fingertips.</p>
            </div>
          </div>

          <div className="quick-action-grid">
            {quickActions.map((action) => (
              <button
                type="button"
                key={action.title}
                className={`quick-action-item ${
                  action.primary ? "primary" : ""
                }`}
                onClick={action.action}
              >
                <strong>{action.title}</strong>

                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
