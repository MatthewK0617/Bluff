/* imports */
const sql_db = require('./functions/sql_db.js');
const create_game = require('./functions/create_game.js');
const connections_ = require('./functions/connections.js');
const clear = require('./functions/clear_games.js');
const game_actions = require('./functions/game_actions.js');
const game_actions_handler = require('./functions/game_actions_handler.js');

const express = require("express");
const app = express();

const db = require('./config/db');

const PORT = process.env.PORT || 8000;

const http = require('http').Server(app);
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log(socket.id, "connected");
    socket.on("joinGameWaiting", (arg1, arg2, callback) => {
        socket.join(arg1);
        console.log(arg2 + " joined " + arg1);
        socket.emit("getplayers"); // should be when someone joins room, not in general
        sql_db.getPlayersSocket(arg1, arg2, (error, players) => {
            if (error) {
                console.error(error);
                callback(error, null);
            } else {
                callback({ players: players }, null);
            }
        });
    });

    socket.on('startgame', async (game_code, arg2, callback) => {
        io.of('/').to(game_code).emit('gamestarting', game_code);
        await sql_db.joinGame(game_code);
        await game_actions.distribute_cards(game_code);
        callback(game_code); // this callback is for the socket.on(startgame) return function
    });


    socket.on("reconnected", (arg1) => {
        socket.join(arg1);
    });

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });

    // socket.on("end_turn", () => {
    //     // io.emit('start_counters');
    // });

    socket.on("end_turn", async (code, action, player_count) => {
        console.log(action);
        if (action.card === "def" && action.rule === 1) {
            await game_actions_handler.handler(io, code, action);
            io.of('/').to(code).emit("end_counters");
            let next_turn = await game_actions.update_game_turn(code, player_count);
            io.of('/').to(code).emit("next_turn", next_turn);
        }
        else {
            io.of('/').to(code).emit("counters", action); // will become defender
            // keep the original action
        }
    })

    socket.on("counter", async (code, action, player_count, v, original_action) => {
        io.emit("set-countering-players", action.id, action.defenderId);
        if (v === "allow") {
            // if original_action p1 and p2 are in the same order, then do the action
            // else, don't do the action

            // for some reason above is backwards
            if (original_action.id !== action.id || action.rule === 1) await game_actions_handler.handler(io, code, action);
            
            if (action.card !== "ass") {
                io.of('/').to(code).emit("end_counters");
                console.log('end_counters emitted');
                let next_turn = await game_actions.update_game_turn(code, player_count);
                io.of('/').to(code).emit("next_turn", next_turn);
            }
            else {
                // should emit a new message (i.e. coup that does the exact same thing)
                socket.emit("challenge_results", action.defenderId);
            }
        }
        else if (v === "bs") {
            await game_actions_handler.bs(io, code, action);
        }
    })

    socket.on("continue", async (code, player_count) => {
        io.of('/').to(code).emit("end_counters");
        let next_turn = await game_actions.update_game_turn(code, player_count);
        io.of('/').to(code).emit("next_turn", next_turn);
    })

    socket.on("delete_card", (code, id, card, callback) => {
        game_actions.delete_card(code, id, card, callback);
    })

    socket.on("eliminated", async (code, id, eliminated_turn, player_count) => {
        // can also say if player_count is 1, there is a winner
        const winner = await game_actions.eliminated(code, id, eliminated_turn);
        console.log("winner", winner);
        console.log("turn", eliminated_turn);
        if (winner) io.of('/').to(code).emit("game_over", winner);
        else {
            let next_turn = await game_actions.update_game_turn(code, player_count);
            io.of('/').to(code).emit("next_turn", next_turn);
        }
    })

    socket.on("coup", (code, agentId, receiverId, card) => {
        // ADD CARD TO TAKE_COINS
        let cost = 7;
        if (card === "ass") cost = 3;
        let coins = [];
        // stop coin from being updated if not enough coins to be taken/not enough coins used
        // limit this in front-end
        game_actions.coin_transactions(code, agentId, -1, cost, (err, res) => {
            if (err) console.log(err);
            else {
                coins = res;
                console.log(coins);
                // emit pick_card to delete
                game_actions.delete_card(receiverId, (err) => {
                    if (err) console.log(err);
                })
            }
        })

        // if 7, then contessa can't block
        // should I pass in what card was used? 
        // I should because receiver needs to know
        // emit
    })

    socket.on("swap", (code, agentId, card) => {
        // ambassador and judge
    })
    socket.on("view", (code, agentId, receiverId, card) => {
        // judge r1
        // emit
    })
});

/**
 * check connection
 */
app.get("/", (req, res) => {
    connections_.checkConnection(app, res);
});

app.get("/clear", (req, res) => {
    clear.handleClear();
});

/**
 * get available games codes from db
 * TODO: think about differentiating between open and closed games
 */
app.get("/getGames", (req, res) => {
    sql_db.getGames(req, res);
});

/**
 * get players in a specific game instance
 */
app.get(`/getPlayers`, (req, res) => {
    sql_db.getPlayers(req, res);
});

app.get(`/getCards`, (req, res) => {
    sql_db.getCards(req, res);
})

app.get('/getCardRules', (req, res) => {
    sql_db.getCardRules(req, res);
})

/**
 * gets the game and id of a player
 */
app.get(`/getInitialPlayerData`, (req, res) => {
    sql_db.getInitialPlayerData(req, res);
})

// app.post('/getPlayerData', (req, res) => {
//     sql_db.getPlayerData(req, res);
// })

app.get('/getPlayersInGame', (req, res) => {
    sql_db.getPlayersInGame(req, res);
})

/**
 * handles adding players to a game
 */
app.post("/addPlayers", (req, res) => {
    sql_db.addPlayers(app, req, res);
});

/**
 * update card info
 */
app.post(`/updateCardData`, (req, res) => {
    sql_db.updateCardData(app, req);
});

/**
 * creates game
 */
app.post('/createGame', (req, res) => {
    create_game.createGame(io, req, res);
});

app.post('/joinGame', (req, res) => {
    sql_db.joinGame(req, res);
})

/**
 * leave game
 */
app.post("/leaveGame", (req, res) => {
    sql_db.leaveGame(req, res);
})

app.post("/leaveInGame", (req, res) => {
    sql_db.leaveInGame(req, res);
})

/* listener check */
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

/** 
 * Database clean-up
 */
setInterval(() => {
    // access the current_games db
    // if players is 0 or less than 0 clear it
    // drop the corresponding tables
    db.query(`SELECT * FROM current_games WHERE playing<=0`, (err, res) => {
        if (err) console.log(0, err);
        else {
            db.query(`DELETE FROM current_games WHERE playing <=0`, (err, res_) => {
                // if (err) console.log(err);
                // else console.log(res_);
            })
            let empty_games = res;
            for (let games of empty_games) {
                // console.log(games);
                db.query(`DROP table ??, ??`, [`cd${games.code}`, `gd${games.code}`], (err, res_) => {
                    // if (err) console.log(err);
                    // else console.log(res_);
                })
            }
        }
    })
}, 30000);