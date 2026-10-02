import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import EditInvoice from "./pages/EditInvoice";

import Quotations from "./pages/Quotations";
import QuotationDetails from "./pages/QuotationDetails";
import EditQuotation from "./pages/EditQuotation";

import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./context/ThemeContext";

import "./App.css";
import "./DarkTheme.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ========================================
              PUBLIC ROUTES
          ======================================== */}

          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ========================================
              PROTECTED ROUTES
          ======================================== */}

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />

              {/* Products & Services */}
              <Route path="/products" element={<Products />} />

              {/* ========================================
                  INVOICES
              ======================================== */}

              <Route path="/invoices" element={<Invoices />} />

              <Route path="/invoices/new" element={<CreateInvoice />} />

              <Route path="/invoices/:id" element={<InvoiceDetails />} />

              <Route path="/invoices/:id/edit" element={<EditInvoice />} />

              {/* ========================================
                  QUOTATIONS
              ======================================== */}

              <Route path="/quotations" element={<Quotations />} />

              <Route path="/quotations/:id" element={<QuotationDetails />} />

              <Route path="/quotations/:id/edit" element={<EditQuotation />} />

              {/* Reports */}
              <Route path="/reports" element={<Reports />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* ========================================
              FALLBACK ROUTE
          ======================================== */}

          {/* Unknown URL → Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
