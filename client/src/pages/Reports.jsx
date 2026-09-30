import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/dashboardService";
import "./Reports.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchReports = async (start_date = "", end_date = "") => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();

      if (start_date && end_date) {
        query.append("start_date", start_date);
        query.append("end_date", end_date);
      }

      const response = await getDashboardSummary(query.toString());

      if (response?.success) {
        setReportData(response.data);
      } else {
        setError(response?.message || "Failed to load reports");
      }
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-header">
          <div>
            <h1>Reports</h1>
            <p>Track your sales, invoices and business performance.</p>
          </div>
        </div>

        <div className="reports-content">
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="reports-header">
          <div>
            <h1>Reports</h1>
            <p>Track your sales, invoices and business performance.</p>
          </div>
        </div>

        <div className="reports-content">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>Track your sales, invoices and business performance.</p>
        </div>

        <div className="reports-filter">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateFilter === "custom" && (
            <div className="reports-custom-dates">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <button
            type="button"
            className="reports-filter-btn"
            onClick={() => {
              if (dateFilter === "custom") {
                if (!startDate || !endDate) {
                  setError("Please select both start and end dates.");
                  return;
                }

                if (startDate > endDate) {
                  setError("Start date cannot be after end date.");
                  return;
                }

                fetchReports(startDate, endDate);
                return;
              }

              const today = new Date();

              if (dateFilter === "all") {
                fetchReports();
                return;
              }

              if (dateFilter === "this_month") {
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");

                const lastDay = new Date(
                  year,
                  today.getMonth() + 1,
                  0,
                ).getDate();

                fetchReports(
                  `${year}-${month}-01`,
                  `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
                );

                return;
              }

              if (dateFilter === "last_month") {
                const firstDay = new Date(
                  today.getFullYear(),
                  today.getMonth() - 1,
                  1,
                );

                const lastDay = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  0,
                );

                fetchReports(
                  `${firstDay.getFullYear()}-${String(
                    firstDay.getMonth() + 1,
                  ).padStart(2, "0")}-01`,
                  `${lastDay.getFullYear()}-${String(
                    lastDay.getMonth() + 1,
                  ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(
                    2,
                    "0",
                  )}`,
                );

                return;
              }

              if (dateFilter === "last_3_months") {
                const firstDay = new Date(
                  today.getFullYear(),
                  today.getMonth() - 2,
                  1,
                );

                fetchReports(
                  `${firstDay.getFullYear()}-${String(
                    firstDay.getMonth() + 1,
                  ).padStart(2, "0")}-01`,
                  `${today.getFullYear()}-${String(
                    today.getMonth() + 1,
                  ).padStart(2, "0")}-${String(today.getDate()).padStart(
                    2,
                    "0",
                  )}`,
                );
              }
            }}
          >
            Apply Filter
          </button>

          <button
            type="button"
            className="reports-reset-btn"
            onClick={() => {
              setDateFilter("all");
              setStartDate("");
              setEndDate("");
              fetchReports();
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="reports-summary-grid">
        <div className="reports-summary-card">
          <span className="reports-summary-label">Total Revenue</span>
          <strong className="reports-summary-value">
            ₹{Number(reportData?.total_sales || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span className="reports-summary-label">Total Invoices</span>
          <strong className="reports-summary-value">
            {reportData?.total_invoices || 0}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span className="reports-summary-label">Paid Amount</span>
          <strong className="reports-summary-value">
            ₹{Number(reportData?.paid_amount || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span className="reports-summary-label">Pending Amount</span>
          <strong className="reports-summary-value">
            ₹{Number(reportData?.remaining_amount || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span className="reports-summary-label">Total Quotations</span>
          <strong className="reports-summary-value">
            {reportData?.total_quotations || 0}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span className="reports-summary-label">Total Customers</span>
          <strong className="reports-summary-value">
            {reportData?.total_customers || 0}
          </strong>
        </div>
      </div>
      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Revenue Trend</h2>
            <p>Track your revenue performance over time.</p>
          </div>
        </div>

        {/* revenue_trend */}

        <div className="reports-revenue-chart">
          {reportData?.revenue_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={reportData.revenue_trend}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eef0f3"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickFormatter={(value) => {
                    const amount = Number(value);

                    if (amount >= 10000000) {
                      return `₹${(amount / 10000000).toFixed(1)}Cr`;
                    }

                    if (amount >= 100000) {
                      return `₹${(amount / 100000).toFixed(1)}L`;
                    }

                    if (amount >= 1000) {
                      return `₹${(amount / 1000).toFixed(1)}K`;
                    }

                    return `₹${amount}`;
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#6366f1",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="reports-empty">
              No revenue data available for this period.
            </p>
          )}
        </div>
      </div>
      {/* Top Customers */}
      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Top Customers</h2>
            <p>Customers contributing the most to your revenue.</p>
          </div>
        </div>

        <div className="reports-customers-list">
          {reportData?.top_customers?.length > 0 ? (
            reportData.top_customers.map((customer, index) => (
              <div className="reports-customer-row" key={customer.customer_id}>
                <div className="reports-customer-rank">{index + 1}</div>

                <div className="reports-customer-info">
                  <strong>{customer.customer_name}</strong>
                  <span>Customer #{customer.customer_id}</span>
                </div>

                <strong className="reports-customer-amount">
                  ₹{Number(customer.total_amount || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            ))
          ) : (
            <p className="reports-empty">
              No customer revenue data available for this period.
            </p>
          )}
        </div>
      </div>

      {/* Payment Follow-up */}

      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Payment Follow-up</h2>
            <p>Track overdue and upcoming invoice payments.</p>
          </div>
        </div>

        <div className="reports-payment-grid">
          {/* Overdue Invoices */}
          <div className="reports-payment-column">
            <div className="reports-payment-column-header">
              <div>
                <h3>Overdue</h3>
                <span>Payment is past the due date</span>
              </div>

              <span className="reports-payment-count reports-payment-count-danger">
                {reportData?.overdue_invoices?.length || 0}
              </span>
            </div>

            <div className="reports-payment-list">
              {reportData?.overdue_invoices?.length > 0 ? (
                reportData.overdue_invoices.map((invoice) => (
                  <div
                    className="reports-payment-row reports-payment-overdue"
                    key={invoice.id}
                  >
                    <div className="reports-payment-info">
                      <strong>{invoice.invoice_number}</strong>

                      <span>
                        Due:{" "}
                        {new Date(invoice.due_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div className="reports-payment-amount">
                      <strong>
                        ₹
                        {Number(invoice.remaining_amount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </strong>

                      <span>Remaining</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="reports-empty">No overdue invoices.</p>
              )}
            </div>
          </div>

          {/* Due Soon Invoices */}
          <div className="reports-payment-column">
            <div className="reports-payment-column-header">
              <div>
                <h3>Due Soon</h3>
                <span>Due within the next 7 days</span>
              </div>

              <span className="reports-payment-count reports-payment-count-warning">
                {reportData?.due_soon_invoices?.length || 0}
              </span>
            </div>

            <div className="reports-payment-list">
              {reportData?.due_soon_invoices?.length > 0 ? (
                reportData.due_soon_invoices.map((invoice) => (
                  <div
                    className="reports-payment-row reports-payment-due-soon"
                    key={invoice.id}
                  >
                    <div className="reports-payment-info">
                      <strong>{invoice.invoice_number}</strong>

                      <span>
                        Due:{" "}
                        {new Date(invoice.due_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div className="reports-payment-amount">
                      <strong>
                        ₹
                        {Number(invoice.remaining_amount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </strong>

                      <span>Remaining</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="reports-empty">No upcoming payments.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Status */}
      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Invoice Status</h2>
            <p>Overview of your invoice payment status.</p>
          </div>
        </div>

        <div className="reports-status-grid">
          <div className="reports-status-card reports-status-pending">
            <span className="reports-status-dot"></span>

            <div>
              <span className="reports-status-label">Pending</span>

              <strong>{reportData?.invoice_status?.pending || 0}</strong>
            </div>
          </div>

          <div className="reports-status-card reports-status-partial">
            <span className="reports-status-dot"></span>

            <div>
              <span className="reports-status-label">Partially Paid</span>

              <strong>{reportData?.invoice_status?.partially_paid || 0}</strong>
            </div>
          </div>

          <div className="reports-status-card reports-status-paid">
            <span className="reports-status-dot"></span>

            <div>
              <span className="reports-status-label">Paid</span>

              <strong>{reportData?.invoice_status?.paid || 0}</strong>
            </div>
          </div>

          <div className="reports-status-card reports-status-overdue">
            <span className="reports-status-dot"></span>

            <div>
              <span className="reports-status-label">Overdue</span>

              <strong>{reportData?.invoice_status?.overdue || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
