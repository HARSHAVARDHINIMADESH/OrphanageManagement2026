const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "hands2hands_secret_key";


// ===============================
// AUTHENTICATION
// ===============================

function requireAuth(req, res, next) {

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

        req.user = jwt.verify(
            token,
            JWT_SECRET
        );

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Session expired. Please login again."
        });
    }
}


// ===============================
// GET ALL CHILDREN
// ===============================

router.get("/", async (req, res) => {

    try {

        const [children] = await db.execute(`
            SELECT
                id,
                name,
                date_of_birth,
                gender,
                education,
                status,
                created_at
            FROM children
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            children: children
        });

    } catch (error) {

        console.error(
            "Get children error:",
            error.message
        );

        res.status(500).json({
            message: "Unable to load children."
        });
    }
});


// ===============================
// GET SINGLE CHILD
// ===============================

router.get("/:id", async (req, res) => {

    try {

        const childId =
            req.params.id;

        const [children] = await db.execute(
            `
            SELECT
                id,
                name,
                date_of_birth,
                gender,
                education,
                medical_info,
                status,
                created_at
            FROM children
            WHERE id = ?
            LIMIT 1
            `,
            [childId]
        );

        if (children.length === 0) {

            return res.status(404).json({
                message: "Child not found."
            });
        }

        res.status(200).json({
            success: true,
            child: children[0]
        });

    } catch (error) {

        console.error(
            "Get child error:",
            error.message
        );

        res.status(500).json({
            message: "Unable to load child details."
        });
    }
});


// ===============================
// ADD CHILD
// ===============================

router.post(
    "/",
    requireAuth,
    async (req, res) => {

        try {

            const {
                name,
                dateOfBirth,
                gender,
                medicalInfo,
                education,
                status
            } = req.body;


            if (!name) {

                return res.status(400).json({
                    message:
                        "Child name is required."
                });
            }


            // Only admin/staff can add children
            if (
                req.user.role !== "admin" &&
                req.user.role !== "staff"
            ) {

                return res.status(403).json({
                    message:
                        "You don't have permission to add children."
                });
            }


            const [result] =
                await db.execute(
                    `
                    INSERT INTO children
                    (
                        name,
                        date_of_birth,
                        gender,
                        medical_info,
                        education,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        name,
                        dateOfBirth || null,
                        gender || null,
                        medicalInfo || null,
                        education || null,
                        status || "active"
                    ]
                );


            res.status(201).json({

                success: true,

                message:
                    "Child added successfully.",

                childId:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "Add child error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to add child."
            });
        }
    }
);


// ===============================
// UPDATE CHILD
// ===============================

router.put(
    "/:id",
    requireAuth,
    async (req, res) => {

        try {

            if (
                req.user.role !== "admin" &&
                req.user.role !== "staff"
            ) {

                return res.status(403).json({
                    message:
                        "You don't have permission to update children."
                });
            }


            const childId =
                req.params.id;

            const {
                name,
                dateOfBirth,
                gender,
                medicalInfo,
                education,
                status
            } = req.body;


            const [result] =
                await db.execute(
                    `
                    UPDATE children
                    SET
                        name = ?,
                        date_of_birth = ?,
                        gender = ?,
                        medical_info = ?,
                        education = ?,
                        status = ?
                    WHERE id = ?
                    `,
                    [
                        name,
                        dateOfBirth || null,
                        gender || null,
                        medicalInfo || null,
                        education || null,
                        status || "active",
                        childId
                    ]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Child not found."
                });
            }


            res.status(200).json({

                success: true,

                message:
                    "Child updated successfully."

            });

        } catch (error) {

            console.error(
                "Update child error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to update child."
            });
        }
    }
);


// ===============================
// DELETE CHILD
// ===============================

router.delete(
    "/:id",
    requireAuth,
    async (req, res) => {

        try {

            if (req.user.role !== "admin") {

                return res.status(403).json({
                    message:
                        "Only admin can delete child records."
                });
            }


            const childId =
                req.params.id;


            const [result] =
                await db.execute(
                    "DELETE FROM children WHERE id = ?",
                    [childId]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Child not found."
                });
            }


            res.status(200).json({

                success: true,

                message:
                    "Child deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete child error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Unable to delete child."
            });
        }
    }
);


module.exports = router;