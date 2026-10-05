const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

require("dotenv").config();


/* ==========================================
   ROUTES
========================================== */

const auth =
    require("./auth");

const children =
    require("./children");

const volunteer =
    require("./volunteer");

const contact =
    require("./contact");

const adoption =
    require("./adoption");

const donation =
    require("./donation");

const events =
    require("./events");

const admin =
    require("./admin");


/* ==========================================
   APP
========================================== */

const app =
    express();


const PORT =
    process.env.PORT || 5000;


const JWT_SECRET =
    process.env.JWT_SECRET ||
    "hands2hands_secret_key";


/* ==========================================
   MIDDLEWARE
========================================== */

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


/*
 * Serve all frontend files
 * from the same root folder.
 */

app.use(
    express.static(__dirname)
);


/* ==========================================
   AUTH MIDDLEWARE
========================================== */

function requireAuth(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (!authHeader) {

        return res.status(401).json({

            success: false,

            message:
                "Please login first."

        });

    }


    if (
        !authHeader.startsWith(
            "Bearer "
        )
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid token."

        });

    }


    const token =
        authHeader.substring(7);


    if (!token) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid token."

        });

    }


    try {

        req.user =
            jwt.verify(
                token,
                JWT_SECRET
            );


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Session expired. Please login again."

        });

    }

}


/* ==========================================
   ROLE MIDDLEWARE
========================================== */

function requireRole(
    ...roles
) {

    return function (
        req,
        res,
        next
    ) {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Please login first."

            });

        }


        if (
            !roles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You don't have permission."

            });

        }


        next();

    };

}


/* ==========================================
   API ROUTES
========================================== */


/*
 * Authentication
 */

app.use(
    "/api/auth",
    auth
);


/*
 * Children
 */

app.use(
    "/api/children",
    children
);


/*
 * Volunteers
 */

app.use(
    "/api/volunteers",
    volunteer
);


/*
 * Contact
 */

app.use(
    "/api/contact",
    contact
);


/*
 * Adoption
 *
 * Login is handled inside adoption.js
 */

app.use(
    "/api/adoptions",
    adoption
);


/*
 * Donations
 *
 * Login is handled inside donation.js
 */

app.use(
    "/api/donations",
    donation
);


/*
 * Events
 */

app.use(
    "/api/events",
    events
);


/*
 * Admin
 *
 * Admin role is handled inside admin.js
 */

app.use(
    "/api/admin",
    admin
);


/* ==========================================
   HEALTH CHECK
========================================== */

app.get(
    "/api/health",
    function (req, res) {

        res.json({

            success: true,

            message:
                "Hands2Hands server is running!"

        });

    }
);


/* ==========================================
   HOME PAGE
========================================== */

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* ==========================================
   ADMIN PAGE
========================================== */

app.get(
    "/admin",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "admin.html"
            )
        );

    }
);


/* ==========================================
   LOGIN PAGE
========================================== */

app.get(
    "/login",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "login.html"
            )
        );

    }
);


/* ==========================================
   SIGNUP PAGE
========================================== */

app.get(
    "/signup",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "signup.html"
            )
        );

    }
);


/* ==========================================
   FORGOT PASSWORD PAGE
========================================== */

app.get(
    "/forgot-password",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "forgotpass.html"
            )
        );

    }
);


/* ==========================================
   404 HANDLER
========================================== */

app.use(
    function (req, res) {

        /*
         * API request
         */

        if (
            req.originalUrl.startsWith(
                "/api/"
            )
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API endpoint not found."

            });

        }


        /*
         * Frontend page not found
         */

        return res.status(404).send(
            `
            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    Hands2Hands - Page Not Found
                </title>

                <style>

                    body {

                        font-family:
                            Arial, sans-serif;

                        text-align: center;

                        padding: 80px;

                        background:
                            #f5f9fc;

                    }

                    h1 {

                        color:
                            #1769aa;

                    }

                    a {

                        color:
                            #1769aa;

                        text-decoration:
                            none;

                        font-weight:
                            bold;

                    }

                </style>

            </head>

            <body>

                <h1>
                    Page Not Found
                </h1>

                <p>
                    The page you are looking for
                    does not exist.
                </p>

                <a href="/">
                    ← Back to Home
                </a>

            </body>

            </html>
            `
        );

    }
);


/* ==========================================
   ERROR HANDLER
========================================== */

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error(
            "Server error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


/* ==========================================
   START SERVER
========================================== */

app.listen(
    PORT,
    function () {

        console.log(
            `Server running at: http://localhost:${PORT}`
        );

    }
);