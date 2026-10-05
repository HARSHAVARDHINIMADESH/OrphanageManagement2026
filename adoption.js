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

    const authHeader = req.headers.authorization;

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

    const token = authHeader.substring(7);

    try {

        const decoded = jwt.verify(
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
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again."
        });
    }
}


/* ==========================================
   CREATE ADOPTION APPLICATION
   POST /api/adoptions
========================================== */

router.post("/", requireAuth, async (req, res) => {

    try {

        const childId = Number(
            req.body.child_id ??
            req.body.childId
        );

        const applicationDate =
            req.body.application_date ||
            req.body.applicationDate ||
            new Date().toISOString().split("T")[0];

        const remarks =
            req.body.remarks?.trim() || null;


        /* VALIDATE CHILD */

        if (!childId || childId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Child ID is required."
            });
        }


        /* VALIDATE USER */

        const userId = Number(req.user.id);

        if (!userId || userId <= 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid logged-in user."
            });
        }


        /* CHECK USER */

        const [users] = await db.execute(
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
                message: "Logged-in user was not found."
            });
        }


        /* CHECK CHILD */

        const [children] = await db.execute(
            `
            SELECT
                id,
                name,
                status
            FROM children
            WHERE id = ?
            LIMIT 1
            `,
            [childId]
        );

        if (children.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Child not found."
            });
        }


        if (children[0].status !== "active") {

            return res.status(400).json({
                success: false,
                message:
                    "This child is currently not available for adoption."
            });
        }


        /* CHECK DUPLICATE */

        const [existing] = await db.execute(
            `
            SELECT id
            FROM adoption_applications
            WHERE child_id = ?
              AND user_id = ?
              AND status IN ('pending', 'approved', 'completed')
            LIMIT 1
            `,
            [
                childId,
                userId
            ]
        );

        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "You already have an application for this child."
            });
        }


        /* INSERT */

        const [result] = await db.execute(
            `
            INSERT INTO adoption_applications
            (
                child_id,
                user_id,
                application_date,
                status,
                remarks
            )
            VALUES (?, ?, ?, 'pending', ?)
            `,
            [
                childId,
                userId,
                applicationDate,
                remarks
            ]
        );


        /* SUCCESS */

        return res.status(201).json({

            success: true,

            message:
                "Adoption application submitted successfully!",

            applicationId:
                result.insertId
        });


    } catch (error) {

        console.error(
            "ADOPTION DATABASE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
});


/* ==========================================
   GET MY APPLICATIONS
========================================== */

router.get("/my", requireAuth, async (req, res) => {

    try {

        const [applications] =
            await db.execute(
                `
                SELECT
                    a.id,
                    a.child_id,
                    c.name AS child_name,
                    c.gender,
                    c.education,
                    a.application_date,
                    a.status,
                    a.remarks,
                    a.created_at
                FROM adoption_applications a
                INNER JOIN children c
                    ON a.child_id = c.id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC
                `,
                [req.user.id]
            );

        return res.json({
            success: true,
            applications
        });

    } catch (error) {

        console.error(
            "Get adoption applications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


/* ==========================================
   GET ALL APPLICATIONS
========================================== */

router.get("/", requireAuth, async (req, res) => {

    try {

        if (
            req.user.role !== "admin" &&
            req.user.role !== "staff"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You don't have permission to view all applications."
            });
        }


        const [applications] =
            await db.execute(
                `
                SELECT
                    a.id,
                    a.child_id,
                    c.name AS child_name,
                    a.user_id,
                    u.name AS applicant_name,
                    u.email AS applicant_email,
                    a.application_date,
                    a.status,
                    a.remarks,
                    a.created_at
                FROM adoption_applications a
                INNER JOIN children c
                    ON a.child_id = c.id
                INNER JOIN users u
                    ON a.user_id = u.id
                ORDER BY a.created_at DESC
                `
            );


        return res.json({
            success: true,
            applications
        });

    } catch (error) {

        console.error(
            "Get all adoption applications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


/* ==========================================
   UPDATE APPLICATION
========================================== */

router.put("/:id", requireAuth, async (req, res) => {

    try {

        if (
            req.user.role !== "admin" &&
            req.user.role !== "staff"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You don't have permission to update applications."
            });
        }


        const applicationId =
            Number(req.params.id);

        const {
            status,
            remarks
        } = req.body;


        const allowedStatus = [
            "pending",
            "approved",
            "rejected",
            "completed"
        ];


        if (!allowedStatus.includes(status)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid adoption application status."
            });
        }


        const [result] =
            await db.execute(
                `
                UPDATE adoption_applications
                SET
                    status = ?,
                    remarks = ?
                WHERE id = ?
                `,
                [
                    status,
                    remarks || null,
                    applicationId
                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Adoption application not found."
            });
        }


        return res.json({
            success: true,
            message:
                "Adoption application updated successfully."
        });

    } catch (error) {

        console.error(
            "Update adoption application error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;