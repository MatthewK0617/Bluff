const db = require('../config/db');
const sql_db = require('./sql_db.js');


function createGame(io, req, res) {
    // console.log("id in createGame: " + socket_id);

    // check if it exists and if not let it be a valid code
    // let code = Math.floor(100000 + Math.random() * 900000) 
    let code = Math.floor(100 + Math.random() * 999); // should be above
    let id = Math.floor(100000 + Math.random() * 900000);
    let card_data = "cd" + code;
    let game_data = "gd" + code;

    let socket_id = req.body.socket_id;
    let username = req.body.username;
    let new_cards = [
        req.body.amb, req.body.ass, req.body.cap, req.body.con, req.body.duk
    ]

    db.query(`INSERT INTO current_players (name, id, socket_id, game_code) VALUES ('${username + code}', ${id}, '${socket_id}', '${code}')`, (err, result) => {
        if (err) {
            console.log(err);
        }
    })

    db.query(`INSERT INTO current_games (code, player_count, playing) VALUES ('${code}', 1, 1)`, (err, result) => {
        if (err) {
            console.log(err);
        }
    })

    db.query(`CREATE TABLE ${game_data} (id int, username text, coins int, card_1 text, card_2 text, turnOrder int, countering tinyint)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            db.query(`INSERT INTO ${game_data} (id, username, coins, turnOrder, countering) VALUES 
                (-1, 'game', 50, 0, 0)`,
                (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                })
        }
    })

    db.query(`CREATE TABLE ${card_data} (id text, num int, r1 tinyint, r2 tinyint, r3 tinyint)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            for (let i = 0; i < new_cards.length; i++) {
                db.query(`INSERT INTO ${card_data} (id, num, r1, r2, r3) VALUES 
                ('${new_cards[i].id}', ${new_cards[i].num}, ${new_cards[i].r1}, ${new_cards[i].r2}, ${new_cards[i].r3})`,
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    })
            }
            res.send(result);
        }
    })


}

module.exports = {
    createGame,
}