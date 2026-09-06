const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const customerRoutes = require("./routes/customerRoutes");

const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});