require('dotenv').config();

const mysql = require('mysql')
const db = mysql.createConnection({
    host: process.env.PASSWORD || "localhost",
    user: process.env.PASSWORD || "root",
    password: process.env.PASSWORD || "191090465",
    database: process.env.DB_NAME || "card_game",
    port: process.env.PORT_DB || 7999,
})

db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db;

/**
 * to start up:
 * start up MySQL server
 * nodemon index.js
 * npm start
 */