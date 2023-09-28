const db = require('../config/db');

/**
 * Gets all current games. 
 * @param {*} req unused
 * @param {*} res response for games
 */
function getGames(req, res) {
    db.query("SELECT * FROM current_games", (err, result) => {
        if (err) console.log(err)
        else res.send(result);
    });
}

/**
 * Used for socket to player matching server-side. 
 * @param {int} code game code
 * @param {int} id player id 
 * @param {*} callback handle result of query
 */
function getPlayersSocket(code, id, callback) {
    db.query(`SELECT * FROM current_players WHERE game_code=?`, [code], (err, res) => {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            const players = res.map(row => ({
                name: row.name,
                id: row.id,
                socket_id: row.socket_id
            }));
            callback(null, players);
        }
    });
}

/**
 * Get general information of players in a game (non-initialization requests)
 * @param {*} req contains identification data
 * @param {*} res sends general information of players to client
 */
function getPlayers(req, res) {
    const code = req.query.code;
    db.query(`SELECT * FROM current_players WHERE game_code=?`, [code], (err, result) => {
        if (err) {
            console.error(err);
        } else {
            const players = result.map(row => ({
                name: row.name,
                id: row.id,
                socket_id: row.socket_id,
            }));
            res.send(players);
        }
    });
}

/**
 * Get specific players game data
 * @param {*} req contains identification data
 * @param {*} res reference to response
 */
function getPlayersInGame(req, res) {
    const game = "gd" + req.query.code;
    db.query(`SELECT * FROM ??`, [game], (err, result) => {
        if (err) {
            console.error(err);
        } else {
            const players = result.map(row => ({
                name: row.username,
                id: row.id,
                coins: row.coins,
                c1: row.card_1,
                c2: row.card_2,
                turnOrder: row.turnOrder,
            }));
            // console.log("g1");
            res.send(players);
        }
    });
}

/**
 * gets the cards in a game instance
 * @param {*} req identification data
 * @param {*} res sends cards to client
 */
function getCards(req, res) {
    const cardinfo = "cd" + req.query.code;
    db.query(`SELECT * FROM ??`, [cardinfo], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            // console.log(result);
            res.send(result);
        }
    })
}

/**
 * gets the card rules in a game instance
 * @param {*} req identification data
 * @param {*} res sends card rules to client
 */
function getCardRules(req, res) {
    const cardinfo = "cd" + req.query.code;
    db.query(`SELECT * FROM ??`, [cardinfo], (err, res_) => {
        if (err) console.log(err);
        else {
            db.query(`SELECT * FROM ??`, ["_card_rules_TEMPLATE"], (err, res__) => {
                if (err) console.log(err);
                else {
                    let cardRules = res__;
                    // console.log(cardinfo);
                    // console.log(res_);
                    res_.forEach((card, i) => {
                        if (!card.r1) cardRules[i].desc_r1 == "";
                        if (!card.r2) cardRules[i].desc_r2 == "";
                        // if card r1 is false, set the equivalent in cardRules to null
                    });
                    // console.log(cardRules);
                    res.send(cardRules);
                }
            })
        }
    })

}

/**
 * Gets a specific player's cards
 * @param {*} game game identifier
 * @param {*} id player id
 * @returns player's cards
 */
function getPlayerCards(game, id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT card_1, card_2 FROM ?? WHERE id=?`, [game, id], (err, res) => {
            if (err) console.log(err);
            else {
                resolve(res[0]);
            }
        });
    })
}

/**
 * Used to initialize player data
 * @param {*} req identification data
 * @param {*} res sends card rules to client
 */
function getInitialPlayerData(req, res) {
    let socket_id = req.query.socket_id;
    db.query(`SELECT game_code, id FROM current_players WHERE socket_id=?`, [socket_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred');
        } else {
            // console.log(socket_id);
            // console.log(result);
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

/**
 * gets the card rules in a game instance
 * @param {*} req identification data
 * @param {*} res sends card rules to client
 */
function getPlayerData(req, res) {
    const playerID = req.body.playerID;

    db.query(`SELECT game_code FROM current_players where id=?`, [playerID], (err, result) => {
        err ? console.log(err) : res.send(result);
    })

}

/**
 * gets the card rules in a game instance
 * @param {*} req identification data
 * @param {*} res sends card rules to client
 */
function addPlayers(app, req, res) {
    let username = req.body.username;
    let socket_id = req.body.socket_id;
    let code = req.body.code;
    let id = Math.floor(100000 + Math.random() * 900000);

    let count = 0;
    db.query(`INSERT INTO current_players (name, id, socket_id, game_code) 
    VALUES (?, ?, ?, ?)`, [username, id, socket_id, code], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(result);
        }
    })

    db.query(`SELECT player_count FROM current_games WHERE code=?`, [code], (err, res) => {
        if (err) {
            console.log(err);
        }
        else {
            count = res[0].player_count;
            count = count + 1;

            db.query(`UPDATE current_games SET player_count=?, playing=? WHERE code=?`, [count, count, code], (err, res) => {
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
}

/**
 * updates the card rules in a game instance
 * @param {*} req identification data
 * @param {*} res informs client of completion
 */
function updateCardData(app, req, res) { // needed if you want to change card mechanics in game
    let curr_game = "cd" + req.body.curr_game;
    let id = req.body.id;
    const num = req.body.num;
    const r1 = req.body.r1;
    const r2 = req.body.r2;
    const r3 = req.body.r3;

    db.query(`UPDATE ?? SET num=?, r1=?, r2=?, r3=? WHERE id=?`, [curr_game, num, r1, r2, r3, id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send("updated");
        }
    })
}

/**
 * handles players leaving a game before it starts
 * @param {*} req identification data
 * @param {*} res1 informs client of completion
 */
function leaveGame(req, res1) {
    let code = req.body.code;
    let id = req.body.id;
    let count = 0;

    db.query(`DELETE FROM current_players WHERE id=?`, [id], (err, result) => {
        if (err) {
            console.log(err);
        }
        if (code !== "") {
            db.query(`SELECT player_count FROM current_games WHERE code=?`, [code], (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    count = res[0].player_count;
                    count = count - 1;
                    db.query(`UPDATE current_games SET player_count=? WHERE code=?`, [count, code], (err, result) => {
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
                            db.query(`DROP TABLE ??`, [cd_current], (err, result) => {
                                if (err) console.log(err);
                                else {
                                    let game_data = "gd" + code;
                                    db.query(`DROP TABLE ??`, [game_data], (err, result) => {
                                        if (err) console.log(err);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        res1.send("completed");
    });
}

/**
 * handles players leaving a game during the game (testing purposes)
 * @param {*} req identification data
 * @param {*} res1 informs client of completed task
 */
function leaveInGame(req, res1) {
    let code = req.body.code;
    let id = req.body.id;
    let game_data = "gd" + code;

    db.query(`DELETE FROM ?? WHERE id=?`, [game_data, id], (err, result) => {
        if (err) {
            console.log(err);
        }
        if (code !== "") {
            db.query(`SELECT player_count, playing FROM current_games WHERE code=?`, [code], (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    count = res[0].player_count - 1;
                    playing = res[0].playing - 1;

                    db.query(`UPDATE current_games SET player_count=?, playing=? WHERE code=?`, [count, playing, code], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            if (count === 0) {
                                db.query(`DELETE FROM current_games WHERE code=?`, [code], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                let card_data = "cd" + code;
                                db.query(`DROP TABLE ??`, [card_data], (err, result) => {
                                    if (err) console.log(err);
                                    else {
                                        db.query(`DROP TABLE ??`, [game_data], (err, result) => {
                                            if (err) console.log(err);
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
    res1.send("completed");
}

/**
 * handles player joining game
 * @param {*} game_code game identification
 * @returns null 
 */
function joinGame(game_code) {
    return new Promise((resolve, reject) => {
        let game_data = "gd" + game_code;

        // get players from current_players and delete them once added to game instance
        db.query(`SELECT * FROM current_players WHERE game_code=?`, [game_code], (err, res) => {
            if (err) {
                console.log(err);
            }
            else {
                const players = res.map(row => ({
                    name: row.name,
                    id: row.id,
                }));
                for (let i = 0; i < players.length; i++) {
                    db.query(`INSERT INTO ${game_data} (id, username, coins, turnOrder, countering) 
                    VALUES (?, ?, ?, ?, ?)`, [players[i].id, players[i].name, 2, i, 0], (err, res_) => {
                        if (err) console.log(err);
                        else {
                            db.query(`DELETE FROM current_players WHERE id=?`, [players[i].id], (err, res__) => {
                                if (err) console.log(err);
                                else resolve();
                            })
                        }
                    })
                }
            }
        })
    })
}

/** exports */
module.exports = {
    getGames,
    getPlayersSocket,
    getPlayers,
    getInitialPlayerData,
    getPlayerData,
    getPlayersInGame,
    getCards,
    getCardRules,
    getPlayerCards,
    addPlayers,
    updateCardData,
    leaveGame,
    leaveInGame,
    joinGame
}