const db = require('../config/db');
const sql_db = require('./sql_db.js');


function createGame(app, req) {
    // console.log("id in createGame: " + socket_id);

    // check if it exists and if not let it be a valid code
    // let code = Math.floor(100000 + Math.random() * 900000) 
    let code = Math.floor(100 + Math.random() * 999); // should be above

    let socket_id = req.body.id;
    let username = req.body.username;
    let new_cards = [
        req.body.amb, req.body.ass, req.body.cap, req.body.con, req.body.duk
    ]

    // let game_data = "gd" + code;
    let card_data = "cd" + code;
    let id =  Math.floor(100000 + Math.random() * 900000);

    db.query(`INSERT INTO current_players (name, id, socket_id, game_code) VALUES ('${username + code}', ${id}, '${socket_id}', '${code}')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })

    db.query(`INSERT INTO current_games (code, player_count) VALUES ('${code}', 1)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })

    db.query(`CREATE TABLE ${card_data} ( id text, num int, r1 tinyint, r2 tinyint, r3 tinyint)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })

    for (let i = 0; i < new_cards.length; i++) {
        console.log(new_cards[i].id);
        db.query(`INSERT INTO ${card_data} (id, num, r1, r2, r3) VALUES 
        ('${new_cards[i].id}', ${new_cards[i].num}, ${new_cards[i].r1}, ${new_cards[i].r2}, ${new_cards[i].r3})`,
            (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
            })
    }
}

module.exports = {
    createGame,
}