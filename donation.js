const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "hands2hands_secret_key";


/* ==========================================
   AUTHENTICATION
========================================== */

function requireAuth(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }

    const token =
        authHeader.substring(7);

    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid user information."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "Donation authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired login session."
        });
    }
}


/* ==========================================
   CREATE DONATION
   POST /api/donations
========================================== */

router.post("/", requireAuth, async (req, res) => {

    try {

        const userId =
            Number(req.user.id);

        if (!userId || userId <= 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid logged-in user."
            });
        }


        const amount =
            Number(req.body.amount);

        const purpose =
            req.body.purpose ||
            "General";


        /* VALIDATE AMOUNT */

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid donation amount."
            });
        }


        if (amount > 99999999.99) {

            return res.status(400).json({
                success: false,
                message:
                    "Donation amount is too large."
            });
        }


        /* CHECK USER */

        const [users] =
            await db.execute(
                `
                SELECT id
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [userId]
            );


        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    "Logged-in user was not found."
            });
        }


        /* INSERT DONATION */

        const [result] =
            await db.execute(
                `
                INSERT INTO donations
                (
                    user_id,
                    amount,
                    purpose,
                    payment_status
                )
                VALUES
                (?, ?, ?, 'pending')
                `,
                [
                    userId,
                    amount,
                    purpose
                ]
            );


        /* SUCCESS */

        return res.status(201).json({

            success: true,

            message:
                "Donation submitted successfully.",

            donation: {

                id:
                    result.insertId,

                user_id:
                    userId,

                amount:
                    amount,

                purpose:
                    purpose,

                payment_status:
                    "pending"
            }
        });


    } catch (error) {

        console.error(
            "DONATION DATABASE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
});


/* ==========================================
   GET MY DONATIONS
========================================== */

router.get("/my", requireAuth, async (req, res) => {

    try {

        const [donations] =
            await db.execute(
                `
                SELECT
                    id,
                    amount,
                    purpose,
                    payment_status,
                    transaction_id,
                    created_at
                FROM donations
                WHERE user_id = ?
                ORDER BY created_at DESC
                `,
                [req.user.id]
            );


        return res.json({
            success: true,
            donations
        });

    } catch (error) {

        console.error(
            "Get my donations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;