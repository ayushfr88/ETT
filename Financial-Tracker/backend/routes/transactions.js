const express = require("express");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

// Middleware to verify JWT and attach user to req
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};

/**
 * GET /api/transactions
 * Fetch all transactions of the logged-in user
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
      [req.user.userId]
    );
    res.json({ success: true, transactions: result.rows });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Server error fetching transactions" });
  }
});

/**
 * POST /api/transactions
 * Add a transaction
 * Body: { amount, category, type, date }
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { amount, category, type, date } = req.body;

    if (!amount || !category || !type || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ success: false, message: "Type must be 'income' or 'expense'" });
    }

    const result = await pool.query(
      "INSERT INTO transactions (user_id, amount, category, type, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.userId, amount, category, type, date]
    );

    res.status(201).json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ success: false, message: "Server error adding transaction" });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const transactionId = req.params.id;

    // Verify the transaction belongs to the user
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [transactionId, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found or unauthorized" });
    }

    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ success: false, message: "Server error deleting transaction" });
  }
});

module.exports = router;
