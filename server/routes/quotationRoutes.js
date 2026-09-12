const express = require("express");
const router = express.Router();

const {
    getQuotations,
    createQuotation,
} = require("../controllers/quotationController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getQuotations);
router.post("/", authMiddleware, createQuotation);

module.exports = router;