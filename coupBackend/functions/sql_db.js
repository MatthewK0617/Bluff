// maybe make error handler function
const db = require('../config/db');

let handleDisconnect = (games, gd_current, cd_current, socket_id) => { 
    let length = 0;

    // find table associated with socket_id
    // -> this is the same thing as searching for the socket
    // if theres no table, it doesn't exist
    // otherwise, continue and delete

    /**
     * SOLUTIONS FOR LINE 1
     * 1) 
     * a. O((N+M)/N)
     * process: create a hash table with key value and store so search is easy (look at B-Tree indexing)
     * problem: collisions; chaining is impossible? how to create efficient linked-list
     * 
     * b. O(N)
     * process: do not hash and just keep a table full of participants and add a new column 
     * that includes game
     * problem: expensive
     * 
     * 2) O(N)
     * process: search through all the tables (1 per game)
     * problem: expensive; more tables is not good either
     */

    console.log(`deleting ${cd_current}`);
    db.query(`DELETE FROM ${gd_current} WHERE socket_id=${socket_id}`, (err, res) => {
        if (err) {
            console.log(err);
        }
    })
    db.query(`SELECT COUNT(*) FROM ${gd_current}`, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            const count = res[0].count; // Access the count from the result
            console.log(count); // Print the count
        }
    })
    if (length == 0) {
        db.query(`DROP TABLE ${gd_current}`, (err, res) => {
            if (err) {
                console.log(err);
            }
        });
        db.query(`DROP TABLE ${cd_current}`, (err, res) => {
            if (err) {
                console.log(err);
            }
        });
        let index = games.indexOf(gd_current.substring(2)); // store this in a separate db
        if (index > -1) {
            games.splice(index, 1);
        }
        console.log(games);
    }
}

let getGames = (app, res) => {
    db.query("SHOW TABLES", (err, result) => {
        if (err) {
            console.log(error);
        }
        res.send(result);
    })
}

let getPlayers = (app, req, res) => {
    console.log(req.query.code);
    db.query(`SELECT * FROM ${req.query.code}`, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
}

let addPlayers = (app, req) => {
    console.log("adding");
    let username = req.body.username;
    let code = "gd" + req.body.code;
    db.query(`INSERT INTO ${code} (name) VALUES ('${username}')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
        // res.send(result);
    })
}

let updateCardData = (app, req) => {
    let id = req.body.id;
    const num = req.body.num;
    const r1 = req.body.r1;
    const r2 = req.body.r2;
    const r3 = req.body.r3;
    console.log(num, r1, r2, r3)

    db.query(`UPDATE card_info SET num=${num}, r1=${r1}, r2=${r2}, r3=${r3} WHERE id='${id}'`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
}


module.exports = {
    handleDisconnect, // delete games
    getGames,
    getPlayers,
    addPlayers,
    updateCardData,
}

// make this file for handling connecting and disconnecting using socket

// make another file for updating sql database