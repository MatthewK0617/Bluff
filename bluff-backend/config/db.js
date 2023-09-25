require('dotenv').config();

const mysql = require('mysql');
const db = process.env.NODE_ENV === 'production' ? mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
}) : mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "191090465",
    database: "card_game",
    port: 7999,
})

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to", db.config.database);
});

module.exports = db;