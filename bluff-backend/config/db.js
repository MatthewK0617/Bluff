require('dotenv').config();

const mysql = require('mysql')
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "191090465",
    database: process.env.DB_NAME || "card_game",
    port: process.env.DB_PORT || 7999,
})

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to", db.config.database);
});

module.exports = db;

/**
 * to start up:
 * start up MySQL server
 * nodemon index.js
 * npm start
 */