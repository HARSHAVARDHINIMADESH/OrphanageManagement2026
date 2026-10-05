const express = require("express");
const db = require("./db");

const router = express.Router();


/*
 * Submit contact message
 */
router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            message
        } = req.body;


        if (!name || !email || !message) {

            return res.status(400).json({
                message:
                    "Name, email and message are required."
            });

        }


        const [result] =
            await db.execute(
                `
                INSERT INTO contact_messages
                (
                    name,
                    email,
                    message,
                    status
                )
                VALUES (?, ?, ?, 'new')
                `,
                [
                    name.trim(),
                    email.trim(),
                    message.trim()
                ]
            );


        res.status(201).json({

            success: true,

            message:
                "Your message has been sent successfully!",

            messageId:
                result.insertId

        });


    } catch (error) {

        console.error(
            "Contact error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to send your message."

        });

    }

});


/*
 * Get all contact messages
 */
router.get("/", async (req, res) => {

    try {

        const [messages] =
            await db.execute(
                `
                SELECT
                    id,
                    name,
                    email,
                    message,
                    status,
                    created_at
                FROM contact_messages
                ORDER BY created_at DESC
                `
            );


        res.status(200).json({

            success: true,

            messages:
                messages

        });


    } catch (error) {

        console.error(
            "Get contact messages error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to load contact messages."

        });

    }

});


/*
 * Update message status
 */
router.put("/:id", async (req, res) => {

    try {

        const messageId =
            req.params.id;

        const {
            status
        } = req.body;


        const allowedStatus = [
            "new",
            "read",
            "replied",
            "closed"
        ];


        if (!allowedStatus.includes(status)) {

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
                    messageId
                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message:
                    "Message not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Message status updated successfully."

        });


    } catch (error) {

        console.error(
            "Update contact message error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to update message status."

        });

    }

});


module.exports = router;