require('dotenv').config();

const mysql = require('mysql')
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.PASSWORD,
    database: "card_game",
    port: 7999,
    // socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
})

// db.connect();

db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

// db.end(); // wait for db to connect; takes around 1 min

module.exports = db;


// could create an init_data which is used to always update the settings data upon loading


// OR, since im going to have to create a new table for each game, could create each time create new game is selected



/**
 * to start up:
 * 
 * start up MySQL server
 * nodemon index.js
 * npm start
 */