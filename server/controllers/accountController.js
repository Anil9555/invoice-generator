const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        id,
        name,
        email,
        phone
      FROM users
      WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get account error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch account",
    });
  }
};

// updateAccount

const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await db.query(
      `UPDATE users
       SET
         name = ?,
         email = ?
       WHERE id = ?`,
      [name.trim(), email.trim(), userId],
    );

    res.json({
      success: true,
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Update account error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update account",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const [rows] = await db.query(
      `SELECT password
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      rows[0].password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password = ?
       WHERE id = ?`,
      [hashedPassword, userId],
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  getAccount,
  updateAccount,
  changePassword,
};
