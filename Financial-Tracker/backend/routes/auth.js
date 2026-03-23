/**
 * Auth routes: register and login.
 * - POST /auth/register: create user (email + hashed password)
 * - POST /auth/login: verify credentials, return JWT
 */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

// Rounds for bcrypt hashing (higher = more secure, slower)
const SALT_ROUNDS = 10;

/**
 * POST /auth/register
 * Body: { email, password }
 * - Validates email and password present
 * - Hashes password with bcrypt
 * - Inserts user (email must be unique)
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Normalize email: trim and lowercase
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required.",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [normalizedEmail, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully. You can log in now.",
    });
  } catch (err) {
    // Unique constraint violation = email already exists
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * - Finds user by email, compares password with bcrypt
 * - Returns JWT on success (we don't store it in frontend per requirements)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT (frontend will not store it per requirements)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

module.exports = router;
