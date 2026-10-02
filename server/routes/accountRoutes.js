const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAccount,
  updateAccount,
  changePassword,
} = require("../controllers/accountController");

router.get("/", authMiddleware, getAccount);
router.put("/", authMiddleware, updateAccount);
router.put("/password", authMiddleware, changePassword);

module.exports = router;
