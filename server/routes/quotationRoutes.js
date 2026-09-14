const express = require("express");
const router = express.Router();

const {
    getQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
} = require("../controllers/quotationController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getQuotations);
router.get("/:id", authMiddleware, getQuotationById);
router.post("/", authMiddleware, createQuotation);
router.put("/:id", authMiddleware, updateQuotation);
router.delete("/:id", authMiddleware, deleteQuotation);
router.post(
    "/:id/convert-to-invoice",
    authMiddleware,
    convertQuotationToInvoice
);

module.exports = router;