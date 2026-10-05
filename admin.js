const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "hands2hands_secret_key";


/*
 * Check admin
 */
function requireAdmin(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

    if (!token) {
        return res.status(401).json({
            message: "Invalid token."
        });
    }

    try {

        const decoded =
            jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message:
                    "Admin access required."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message:
                "Session expired. Please login again."
        });
    }
}


/*
 * Dashboard summary
 */
router.get(
    "/dashboard",
    requireAdmin,
    async (req, res) => {

        try {

            const [
                [users]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM users"
            );

            const [
                [children]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM children"
            );

            const [
                [volunteers]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM volunteers"
            );

            const [
                [contacts]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM contact_messages"
            );

            const [
                [adoptions]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM adoption_applications"
            );

            const [
                [donations]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM donations"
            );

            const [
                [events]
            ] = await db.execute(
                "SELECT COUNT(*) AS count FROM events"
            );


            res.json({

                success: true,

                counts: {
                    users: users.count,
                    children: children.count,
                    volunteers: volunteers.count,
                    contacts: contacts.count,
                    adoptions: adoptions.count,
                    donations: donations.count,
                    events: events.count
                }

            });

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to load dashboard."
            });
        }
    }
);


/*
 * Get recent volunteers
 */
router.get(
    "/volunteers",
    requireAdmin,
    async (req, res) => {

        try {

            const [volunteers] =
                await db.execute(`
                    SELECT
                        id,
                        name,
                        email,
                        phone,
                        availability,
                        activities,
                        status,
                        created_at
                    FROM volunteers
                    ORDER BY created_at DESC
                    LIMIT 20
                `);

            res.json({
                success: true,
                volunteers
            });

        } catch (error) {

            console.error(
                "Admin volunteers error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to load volunteers."
            });
        }
    }
);


/*
 * Update volunteer status
 */
router.put(
    "/volunteers/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            const allowed = [
                "pending",
                "approved",
                "rejected"
            ];

            if (!allowed.includes(status)) {

                return res.status(400).json({
                    message:
                        "Invalid volunteer status."
                });
            }

            const [result] =
                await db.execute(
                    `
                    UPDATE volunteers
                    SET status = ?
                    WHERE id = ?
                    `,
                    [
                        status,
                        req.params.id
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Volunteer not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Volunteer status updated."
            });

        } catch (error) {

            console.error(
                "Volunteer update error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to update volunteer."
            });
        }
    }
);


/*
 * Get contact messages
 */
router.get(
    "/contacts",
    requireAdmin,
    async (req, res) => {

        try {

            const [messages] =
                await db.execute(`
                    SELECT
                        id,
                        name,
                        email,
                        message,
                        status,
                        created_at
                    FROM contact_messages
                    ORDER BY created_at DESC
                    LIMIT 20
                `);

            res.json({
                success: true,
                messages
            });

        } catch (error) {

            console.error(
                "Admin contacts error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to load messages."
            });
        }
    }
);


/*
 * Update contact message
 */
router.put(
    "/contacts/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            const allowed = [
                "new",
                "read",
                "replied",
                "closed"
            ];

            if (!allowed.includes(status)) {

                return res.status(400).json({
                    message:
                        "Invalid message status."
                });
            }

            const [result] =
                await db.execute(
                    `
                    UPDATE contact_messages
                    SET status = ?
                    WHERE id = ?
                    `,
                    [
                        status,
                        req.params.id
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Message not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Message status updated."
            });

        } catch (error) {

            console.error(
                "Contact update error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to update message."
            });
        }
    }
);


/*
 * Get donations
 */
router.get(
    "/donations",
    requireAdmin,
    async (req, res) => {

        try {

            const [donations] =
                await db.execute(`
                    SELECT
                        d.id,
                        d.amount,
                        d.purpose,
                        d.payment_status,
                        d.created_at,
                        u.name AS donor_name,
                        u.email AS donor_email
                    FROM donations d
                    INNER JOIN users u
                        ON d.user_id = u.id
                    ORDER BY d.created_at DESC
                    LIMIT 20
                `);

            res.json({
                success: true,
                donations
            });

        } catch (error) {

            console.error(
                "Admin donations error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to load donations."
            });
        }
    }
);


/*
 * Get adoption applications
 */
router.get(
    "/adoptions",
    requireAdmin,
    async (req, res) => {

        try {

            const [applications] =
                await db.execute(`
                    SELECT
                        a.id,
                        a.application_date,
                        a.status,
                        a.remarks,
                        a.created_at,
                        c.name AS child_name,
                        u.name AS applicant_name,
                        u.email AS applicant_email
                    FROM adoption_applications a
                    INNER JOIN children c
                        ON a.child_id = c.id
                    INNER JOIN users u
                        ON a.user_id = u.id
                    ORDER BY a.created_at DESC
                    LIMIT 20
                `);

            res.json({
                success: true,
                applications
            });

        } catch (error) {

            console.error(
                "Admin adoption error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to load adoption applications."
            });
        }
    }
);


/*
 * Update adoption status
 */
router.put(
    "/adoptions/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            const allowed = [
                "pending",
                "approved",
                "rejected",
                "completed"
            ];

            if (!allowed.includes(status)) {

                return res.status(400).json({
                    message:
                        "Invalid adoption status."
                });
            }

            const [result] =
                await db.execute(
                    `
                    UPDATE adoption_applications
                    SET status = ?
                    WHERE id = ?
                    `,
                    [
                        status,
                        req.params.id
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Application not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Adoption status updated."
            });

        } catch (error) {

            console.error(
                "Adoption update error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to update adoption status."
            });
        }
    }
);


module.exports = router; 