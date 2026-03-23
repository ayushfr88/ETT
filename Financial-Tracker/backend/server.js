/**
 * Finance Tracker - Backend Server
 * Entry point. Sets up Express, DB, and routes.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: parse JSON bodies and allow frontend origin
app.use(cors({ origin: true }));
app.use(express.json());

// Mount auth routes at /auth
app.use("/auth", authRoutes);

// Mount transaction routes at /api/transactions
app.use("/api/transactions", transactionRoutes);

// Health check (optional, useful for Docker)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Initialize database then start server
initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
