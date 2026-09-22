const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updatePaymentStatus,
} = require("../controllers/invoiceController");

router.get("/", authMiddleware, getInvoices);

router.get("/:id", authMiddleware, getInvoiceById);

router.post("/", authMiddleware, createInvoice);

router.put("/:id", authMiddleware, updateInvoice);

router.put("/:id/payment", authMiddleware, updatePaymentStatus);

router.delete("/:id", authMiddleware, deleteInvoice);

module.exports = router;