const express = require("express");
const mysql = require("mysql2");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authRoutes = express.Router();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const loginPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_ADMIN_DATABASE,
});

// ADMIN LOGIN SECTION

authRoutes.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
    const insertValues = [email, hashedPassword];

    await loginPool.promise().query(insertQuery, insertValues);

    res.json({ success: true, message: "Registration successful." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve the user from the database based on the email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const [rows] = await loginPool.promise().query(selectQuery, [email]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate a JWT token
      const token = jwt.sign({ user: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ success: true, message: "Login successful", token });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials: Incorrect password",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
authRoutes.post("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Retrieve the user from the database based on the email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const [rows] = await loginPool.promise().query(selectQuery, [email]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // Compare old password
    const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!oldPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect old password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
    const updateValues = [hashedNewPassword, user.id];

    await loginPool.promise().query(updateQuery, updateValues);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error during password change:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
authRoutes.delete("/delete-account", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve the user from the database based on the email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const [rows] = await loginPool.promise().query(selectQuery, [email]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // Delete the user from the database
    const deleteQuery = "DELETE FROM users WHERE id = ?";
    const deleteValues = [user.id];

    await loginPool.promise().query(deleteQuery, deleteValues);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error during account deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = authRoutes;
