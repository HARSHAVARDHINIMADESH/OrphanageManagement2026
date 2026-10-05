const express = require("express");
const db = require("./db");

const router = express.Router();


/*
 * Get upcoming events
 */
router.get("/", async (req, res) => {

    try {

        const [events] = await db.execute(
            `
            SELECT
                id,
                title,
                description,
                event_date,
                event_time,
                location,
                status,
                created_at
            FROM events
            WHERE status = 'upcoming'
            ORDER BY event_date ASC, event_time ASC
            `
        );


        res.status(200).json({

            success: true,

            events: events

        });


    } catch (error) {

        console.error(
            "Get events error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to load events."

        });

    }

});


/*
 * Get all events
 */
router.get("/all", async (req, res) => {

    try {

        const [events] = await db.execute(
            `
            SELECT
                id,
                title,
                description,
                event_date,
                event_time,
                location,
                status,
                created_at
            FROM events
            ORDER BY event_date ASC
            `
        );


        res.status(200).json({

            success: true,

            events: events

        });


    } catch (error) {

        console.error(
            "Get all events error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to load events."

        });

    }

});


/*
 * Add event
 */
router.post("/", async (req, res) => {

    try {

        const {
            title,
            description,
            eventDate,
            eventTime,
            location
        } = req.body;


        if (!title || !eventDate) {

            return res.status(400).json({

                message:
                    "Event title and date are required."

            });

        }


        const [result] = await db.execute(
            `
            INSERT INTO events
            (
                title,
                description,
                event_date,
                event_time,
                location,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'upcoming')
            `,
            [
                title.trim(),
                description || null,
                eventDate,
                eventTime || null,
                location || null
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Event created successfully!",

            eventId:
                result.insertId

        });


    } catch (error) {

        console.error(
            "Create event error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to create event."

        });

    }

});


/*
 * Update event status
 */
router.put("/:id", async (req, res) => {

    try {

        const eventId =
            req.params.id;

        const {
            status
        } = req.body;


        const allowedStatus = [
            "upcoming",
            "completed",
            "cancelled"
        ];


        if (!allowedStatus.includes(status)) {

            return res.status(400).json({

                message:
                    "Invalid event status."

            });

        }


        const [result] = await db.execute(
            `
            UPDATE events
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                eventId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Event status updated successfully."

        });


    } catch (error) {

        console.error(
            "Update event error:",
            error.message
        );

        res.status(500).json({

            message:
                "Unable to update event."

        });

    }

});


module.exports = router;