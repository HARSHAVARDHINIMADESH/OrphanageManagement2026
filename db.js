const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({

    host: process.env.DB_HOST || "localhost",

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "hands2hands",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// Test database connection

async function testDatabase() {

    try {

        const connection = await db.getConnection();

        console.log("MySQL database connected successfully!");

        connection.release();

    } catch (error) {

        console.error(
            "MySQL connection failed:",
            error.message
        );

    }

}


testDatabase();


module.exports = db;