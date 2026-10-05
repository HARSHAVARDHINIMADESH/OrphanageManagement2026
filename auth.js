
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "hands2hands_secret_key";


// ===============================
// SIGNUP
// ===============================

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const [existingUser] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        await db.execute(
            `INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, 'user')`,
            [name, email, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        return res.status(500).json({
            message: "Signup failed. Please try again."
        });
    }
});


// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const [users] = await db.execute(
            `SELECT id, name, email, password_hash, role
            FROM users
            WHERE email = ?
            LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            userData,
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});


// ===============================
// FORGOT PASSWORD
// ===============================

router.post("/forgot-password", async (req, res) => {
    return res.status(501).json({
        message:
            "Password reset is not configured yet. Please contact the administrator."
    });
});

module.exports = router;
