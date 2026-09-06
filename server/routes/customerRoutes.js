const express = require("express");

const {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCustomers);
router.post("/", authMiddleware, createCustomer);
router.put("/:id", authMiddleware, updateCustomer);
router.delete("/:id", authMiddleware, deleteCustomer);

module.exports = router;