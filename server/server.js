
const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");

const customerRoutes = require("./routes/customerRoutes");

const productRoutes = require("./routes/productRoutes");

const authRoutes = require("./routes/authRoutes");

const invoiceRoutes = require("./routes/invoiceRoutes");

const quotationRoutes = require("./routes/quotationRoutes");

const settingsRoutes = require("./routes/settingsRoutes");

const accountRoutes = require("./routes/accountRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/account", accountRoutes);

app.get("/api/test", (req, res) => {
    res.json({
        message: "Hello from Express backend!",
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "Invoice Generator API is running",
    });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});