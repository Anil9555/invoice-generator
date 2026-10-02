const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getSettings,
  saveSettings,
} = require("../controllers/settingsController");

// Get settings
router.get("/", authMiddleware, getSettings);

// Save / update settings
router.put("/", authMiddleware, saveSettings);

module.exports = router;
