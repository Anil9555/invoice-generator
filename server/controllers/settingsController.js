const db = require("../config/db");

// Get business settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        id,
        business_name,
        business_email,
        phone,
        address,
        gstin,
        logo,
        invoice_prefix,
        currency,
        default_tax_rate,
        payment_terms,
        quotation_prefix,
        quotation_validity,
        quotation_terms,
        theme
      FROM business_settings
      WHERE user_id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// Save / update business settings
const saveSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      business_name,
      business_email,
      phone,
      address,
      gstin,
      logo,
      invoice_prefix,
      currency,
      default_tax_rate,
      payment_terms,
      quotation_prefix,
      quotation_validity,
      quotation_terms,
      theme,
    } = req.body;

    const [existing] = await db.query(
      `SELECT id
       FROM business_settings
       WHERE user_id = ?`,
      [userId],
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE business_settings
         SET
          business_name = ?,
          business_email = ?,
          phone = ?,
          address = ?,
          gstin = ?,
          logo = ?,
          invoice_prefix = ?,
          currency = ?,
          default_tax_rate = ?,
          payment_terms = ?,
          quotation_prefix = ?,
          quotation_validity = ?,
          quotation_terms = ?,
          theme = ?
         WHERE user_id = ?`,
        [
          business_name || null,
          business_email || null,
          phone || null,
          address || null,
          gstin || null,
          logo || null,
          invoice_prefix || "INV-",
          currency || "INR",
          default_tax_rate ?? 18,
          payment_terms || "Due within 30 days",
          quotation_prefix || "QUO-",
          quotation_validity ?? 30,
          quotation_terms || null,
          theme || "light",
          userId,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO business_settings (
          user_id,
          business_name,
          business_email,
          phone,
          address,
          gstin,
          logo,
          invoice_prefix,
          currency,
          default_tax_rate,
          payment_terms,
          quotation_prefix,
          quotation_validity,
          quotation_terms,
          theme
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          business_name || null,
          business_email || null,
          phone || null,
          address || null,
          gstin || null,
          logo || null,
          invoice_prefix || "INV-",
          currency || "INR",
          default_tax_rate ?? 18,
          payment_terms || "Due within 30 days",
          quotation_prefix || "QUO-",
          quotation_validity ?? 30,
          quotation_terms || null,
          theme || "light",
        ],
      );
    }

    res.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Save settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save settings",
    });
  }
};

module.exports = {
  getSettings,
  saveSettings,
};
