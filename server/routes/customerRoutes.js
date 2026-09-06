const express = require("express");

const {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();


// GET /api/customers
router.get("/", getCustomers);


// POST /api/customers
router.post("/", createCustomer);

// PUT /api/customers/:id
router.put("/:id", updateCustomer);

// DELETE /api/customers/:id
router.delete("/:id", deleteCustomer);


module.exports = router;
