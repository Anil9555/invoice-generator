const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const app = express();

db.query("SELECT 1")
    .then(() => {
        console.log("MySQL connected successfully!");
    })
    .catch((error) => {
        console.error("MySQL connection failed:", error.message);
    });

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Invoice Generator API is running",
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Hello from Express backend!",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});