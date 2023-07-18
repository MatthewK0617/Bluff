// maybe make error handler function
const db = require('../config/db');


// function handleDisconnect(socket_id) {
//     let length = 0;

//     // find table associated with socket_id
//     // -> this is the same thing as searching for the socket
//     // if there's no table, it doesn't exist
//     // otherwise, continue and delete

//     /**
//      * SOLUTIONS FOR LINE 1
//      * 1) 
//      * a. O((N+M)/N)
//      * process: create a hash table with key value and store so search is easy (look at B-Tree indexing)
//      * problem: collisions; chaining is impossible? how to create efficient linked-list
//      * 
//      * b. O(N) -- recommended by openAI (modifications to decrease costs are probably acceptable)
//      * process: do not hash and just keep a table full of participants and add a new column 
//      * that includes game
//      * problem: expensive 
//      * solution: add sorted based on gameid to allow for binary search
//      * 
//      * 2) O(N)
//      * process: search through all the tables (1 per game)
//      * problem: expensive; more tables is not good either
//      */

//     let count = 0;
//     let code = "";
//     console.log("id " + socket_id);

//     // make sure that there is a game; if disconnecting socket isn't in current players don't do anything
//     db.query(`SELECT game_code FROM current_players WHERE socket_id='${socket_id}'`, (err, res) => {
//         if (err) {
//             console.log(err);
//         }
//         else if (typeof res[0] === 'undefined') { // res[0] is the gamecode
//             return;
//         }
//         else {
//             console.log("hi");
//             code = res[0].game_code;
//             console.log("code " + code);

//             db.query(`DELETE FROM current_players WHERE socket_id='${socket_id}'`, (err, res) => {
//                 if (err) {
//                     console.log(err);
//                 }
//             })

//             if (code !== "") {
//                 db.query(`SELECT player_count FROM current_games WHERE code=${code}`, (err, res) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                     else {
//                         count = res[0].player_count;
//                         count = count - 1;
//                     }
//                 })
//             }

//             db.query(`UPDATE current_games SET player_count = ${count} WHERE code=${code}`, (err, res) => {
//                 if (err) {
//                     console.log(err);
//                 }
//             })

//             if (count == 0) {
//                 db.query(`DELETE FROM current_games WHERE player_count=0`, (err, res) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                 });

//                 let cd_current = "cd" + code;
//                 db.query(`DROP TABLE ${cd_current}`, (err, res) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                 });
//             }
//         }
//     })
// }

function getGames(req, res) {
    db.query("SELECT * FROM current_games", (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred.");
        }
        else {
            res.send(result);
        }
    });
    console.log('finished');
}

function getPlayersSocket(code, id, callback) {
    db.query(`SELECT * FROM current_players WHERE game_code='${code}'`, (err, res) => {
        if (err) {
            console.error(err);
            callback(err, null);
        } else {
            const players = res.map(row => ({
                name: row.name,
                id: row.id,
                socket_id: row.socket_id
            }));
            console.log(players);
            callback(null, players);
        }
    });
}

function getPlayers(req, res) {
    const code = req.query.code;
    db.query(`SELECT * FROM current_players WHERE game_code='${code}'`, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            const players = result.map(row => ({
                name: row.name,
                id: row.id,
                socket_id: row.socket_id
            }));
            res.send(players);
        }
    });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function getInitialPlayerData(req, res) {
    console.log(11);
    console.log(req.query);
    let socket_id = req.query.socket_id;
    db.query(`SELECT game_code, id FROM current_players WHERE socket_id='${socket_id}'`, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred');
        } else {
            console.log(socket_id);
            console.log(result);
            if (result.length > 0) {
                const playerData = {
                    game_code: result[0].game_code,
                    id: result[0].id
                };
                res.send(playerData);
            } else {
                res.status(404).send('Player data not found');
            }
        }
    });
}

function getPlayerData(req, res) {
    const playerID = req.body.playerID;

    db.query(`SELECT game_code FROM current_players where id=${playerID}`, (err, result) => {
        err ? console.log(err) : res.send(result);
    })

}

function addPlayers(app, req, res) {
    let username = req.body.username;
    let socket_id = req.body.socket_id;
    let code = req.body.code;
    let id = Math.floor(100000 + Math.random() * 900000);

    let count = 0;
    db.query(`INSERT INTO current_players (name, id, socket_id, game_code) VALUES ('${username}', ${id}, '${socket_id}', ${code})`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(result);
        }
    })

    db.query(`SELECT player_count FROM current_games WHERE code=${code}`, (err, res) => {
        if (err) {
            console.log(err);
        }
        else {
            count = res[0].player_count;
            count = count + 1;

            db.query(`UPDATE current_games SET player_count=${count} WHERE code='${code}'`, (err, res) => {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(res);
                }
            });
            // console.log(res);
        }
    })

    // find the best place to put this
    db.query(`SELECT * FROM current_players ORDER BY socket_id`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            // console.log(result);
        }
    })
}

function updateCardData(app, req) { // needed if you want to change card mechanics in game
    let curr_game = "cd" + req.body.curr_game;
    let id = req.body.id;
    const num = req.body.num;
    const r1 = req.body.r1;
    const r2 = req.body.r2;
    const r3 = req.body.r3;

    db.query(`UPDATE ${curr_game} SET num=${num}, r1=${r1}, r2=${r2}, r3=${r3} WHERE id='${id}'`, (err, result) => {
        if (err) {
            console.log(err);
        }
        // console.log(result);
    })
}

function leaveGame(req, res) {
    let code = req.body.code;
    let id = req.body.id;
    let count = 0;
    console.log(id);

    db.query(`DELETE FROM current_players WHERE id=${id}`, (err, result) => {
        if (err) {
            console.log(err);
        }

        if (code !== "") {
            db.query(`SELECT player_count FROM current_games WHERE code='${code}'`, (err, res) => {
                console.log("code: " + code);
                console.log(res);
                if (err) {
                    console.log(err);
                } else {
                    count = res[0].player_count;
                    count = count - 1;

                    db.query(`UPDATE current_games SET player_count=${count} WHERE code='${code}'`, (err, result) => {
                        if (err) {
                            console.log(err);
                        }

                        if (count === 0) {
                            db.query(`DELETE FROM current_games WHERE player_count=0`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                            });

                            let cd_current = "cd" + code;
                            db.query(`DROP TABLE ${cd_current}`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    res.send("Completed");
}


module.exports = {
    // handleDisconnect, 
    getGames,
    getPlayersSocket,
    getPlayers,
    getInitialPlayerData,
    getPlayerData,
    addPlayers,
    updateCardData,
    leaveGame,
}