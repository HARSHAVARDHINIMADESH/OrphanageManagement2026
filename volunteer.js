const express = require("express");
const db = require("./db");

const router = express.Router();


/*
 * Submit volunteer application
 */
router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            availability,
            activities,
            message
        } = req.body;


        if (!name || !email || !phone) {

            return res.status(400).json({
                message:
                    "Name, email and phone are required."
            });

        }


        const [result] =
            await db.execute(
                `
                INSERT INTO volunteers
                (
                    name,
                    email,
                    phone,
                    availability,
                    activities,
                    message,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
                `,
                [
                    name.trim(),
                    email.trim(),
                    phone.trim(),
                    availability || null,
                    activities || null,
                    message || null
                ]
            );


        res.status(201).json({

            success: true,

            message:
                "Volunteer application submitted successfully!",

            volunteerId:
                result.insertId

        });


    } catch (error) {

        console.error(
            "Volunteer application error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to submit volunteer application."

        });

    }

});


/*
 * Get all volunteer applications
 */
router.get("/", async (req, res) => {

    try {

        const [volunteers] =
            await db.execute(
                `
                SELECT
                    id,
                    name,
                    email,
                    phone,
                    availability,
                    activities,
                    message,
                    status,
                    created_at
                FROM volunteers
                ORDER BY created_at DESC
                `
            );


        res.status(200).json({

            success: true,

            volunteers:
                volunteers

        });


    } catch (error) {

        console.error(
            "Get volunteers error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to load volunteer applications."

        });

    }

});


/*
 * Update volunteer status
 */
router.put("/:id", async (req, res) => {

    try {

        const volunteerId =
            req.params.id;

        const {
            status
        } = req.body;


        const allowedStatus = [
            "pending",
            "approved",
            "rejected"
        ];


        if (!allowedStatus.includes(status)) {

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
                    volunteerId
                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message:
                    "Volunteer application not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Volunteer status updated successfully."

        });


    } catch (error) {

        console.error(
            "Update volunteer error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to update volunteer status."

        });

    }

});


module.exports = router;