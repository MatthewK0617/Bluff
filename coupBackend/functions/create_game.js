const db = require('../config/db');

let createGame = (app, games, game_data, card_data, socket_id, req) => {
    console.log("id in createGame: " + socket_id);

    // check if it exists and if not let it be a valid code
    // let code = Math.floor(100000 + Math.random() * 900000) 
    let username = req.body.username;
    let new_cards = [
        req.body.amb, req.body.ass, req.body.cap, req.body.con, req.body.duk
    ]

    gd_current = game_data;
    cd_current = card_data;

    
    games.push(game_data.substring(2));
    console.log(games)

    console.log(game_data);
    db.query(`CREATE TABLE ${game_data} ( name varchar(20), id int NOT NULL UNIQUE, socket_id varchar(40))`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
    db.query(`INSERT INTO ${game_data} (name, id, socket_id) VALUES ('${username}', 1, '${socket_id}')`, (err, result) => {
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