/* imports */
const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');

const sql_db = require('./functions/sql_db.js');
const create_game = require('./functions/create_game.js');
const connections_ = require('./functions/connections.js');
const clear = require('./functions/clear_games.js');
const game_actions = require('./functions/game_actions.js');
const game_actions_handler = require('./functions/game_actions_handler.js');
const db = require('./config/db');

const app = express();

// broken
const faviconPath = path.join(__dirname, 'public', 'favicon.ico')
// console.log(faviconPath);
app.use(favicon(faviconPath));

const PORT = process.env.PORT || 8000;
const http = require('http').Server(app);
const cors = require("cors");
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? "https://bluff.netlify.app" : "*",
    methods: ["GET", "POST"]
};
// console.log(corsOptions.origin);

app.use(express.json()); // enable json parsing
app.use(express.urlencoded({ extended: true })); // enable URL-encoded data parsing
app.use(cors(corsOptions));
app.use(express.static('/public'));

const io = require('socket.io')(http, {
    cors: corsOptions,
});

/** handle socket.io connection */
io.on("connection", (socket) => {
    console.log(socket.id, "connected");
    socket.on("joinGameWaiting", (arg1, arg2, callback) => {
        socket.join(arg1);
        console.log(arg2 + " joined " + arg1);
        io.of('/').to(arg1).emit("getplayers"); // should be when someone joins room, not in general
        sql_db.getPlayersSocket(arg1, arg2, (error, players) => {
            if (error) {
                console.error(error);
                callback(error, null);
            } else {
                callback({ players: players }, null);
            }
        });
    });

    /** handles game-starting behavior */
    socket.on('startgame', async (game_code, arg2, callback) => {
        io.of('/').to(game_code).emit('gamestarting', game_code);
        await sql_db.joinGame(game_code);
        await game_actions.distribute_cards(game_code);
        callback(game_code); // this callback is for the socket.on(startgame) return function
    });

    /** handles turn ending */
    socket.on("end_turn", async (code, action, player_count) => {
        if (action.card === "def" && action.rule === 1) { // un-counterable action
            // handle action 
            await game_actions_handler.handler(io, code, action);
            // end the counter stage
            io.of('/').to(code).emit("end_counters");
            // start the next turn
            let next_turn = await game_actions.update_game_turn(code, player_count);
            io.of('/').to(code).emit("next_turn", next_turn);
        } else { // counterable action
            // does not handle action yet because of potential counters
            // emit the original action for comparison purposes
            io.of('/').to(code).emit("counters", action);
        }
    })

    /** handles counters */
    socket.on("counter", async (code, action, player_count, v, original_action) => {
        io.emit("set-countering-players", action.id, action.defenderId);
        if (v === "allow") { // counter is allowed
            // if original_action p1 and p2 are in the same order, then do the action 
            // order is reversed because of handling
            if ((original_action.id !== action.id || action.card === "def" && action.rule === 2)
                || action.rule === 1) await game_actions_handler.handler(io, code, action);

            if (action.card !== "poi") { // action is not assassinate
                io.of('/').to(code).emit("end_counters");
                console.log('end_counters emitted');
                let next_turn = await game_actions.update_game_turn(code, player_count);
                io.of('/').to(code).emit("next_turn", next_turn);
            } else { // action is assassinate
                // should probably emit a 'different' message (i.e. coup that does the exact same thing)
                socket.emit("challenge_results", action.defenderId);
            }
        }
        else if (v === "bs") { // counter is challenged
            await game_actions_handler.bs(io, code, action);
        }
    })

    /** handles whose turn it is */
    socket.on("continue", async (code, player_count) => {
        io.of('/').to(code).emit("end_counters");
        let next_turn = await game_actions.update_game_turn(code, player_count);
        io.of('/').to(code).emit("next_turn", next_turn);
    })

    /** handles card deletion */
    socket.on("delete_card", (code, id, card, callback) => {
        game_actions.delete_card(code, id, card, callback);
    })

    /** handles elimination */
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

    /** handles poison */
    socket.on("coup", (code, agentId, receiverId, card) => {
        // add this to take_coins
        let cost = 7;
        if (card === "ass") cost = 3;
        let coins = [];
        game_actions.coin_transactions(code, agentId, -1, cost, (err, res) => {
            if (err) console.log(err);
            else {
                coins = res;
                console.log(coins);
                // deletes a card
                game_actions.delete_card(receiverId, (err) => {
                    if (err) console.log(err);
                })
            }
        })
    })

    /** handles reconnection */
    socket.on("reconnected", (arg1) => {
        socket.join(arg1);
    });

    /** handles disconnect */
    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });
});

/** check connection */
app.get("/", (req, res) => {
    connections_.checkConnection(app, res);
});

/** clear databases */
app.get("/clear", (req, res) => {
    clear.handleClear(res);
});

/** get available games codes from db */
app.get("/getGames", (req, res) => {
    sql_db.getGames(req, res);
});

/** get players in a specific game instance */
app.get(`/getPlayers`, (req, res) => {
    sql_db.getPlayers(req, res);
});

/** get cards */
app.get(`/getCards`, (req, res) => {
    sql_db.getCards(req, res);
})

/** get card rules */
app.get('/getCardRules', (req, res) => {
    sql_db.getCardRules(req, res);
})

/** gets the game and id of a player */
app.get(`/getInitialPlayerData`, (req, res) => {
    sql_db.getInitialPlayerData(req, res);
})

/** get players in a given game */
app.get('/getPlayersInGame', (req, res) => {
    sql_db.getPlayersInGame(req, res);
})

/** handles adding players to a game */
app.post("/addPlayers", (req, res) => {
    sql_db.addPlayers(app, req, res);
});

/** update card info */
app.post(`/updateCardData`, (req, res) => {
    sql_db.updateCardData(app, req, res);
});

/** creates game */
app.post('/createGame', (req, res) => {
    create_game.createGame(io, req, res);
});

/** join game */
app.post('/joinGame', (req, res) => {
    sql_db.joinGame(req, res);
})

/** leave game */
app.post("/leaveGame", (req, res) => {
    sql_db.leaveGame(req, res);
})

/** handles leave in game */
app.post("/leaveInGame", (req, res) => {
    sql_db.leaveInGame(req, res);
})

/* listener check */
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

app.use((req, res, next) => {
    // Set the Content-Type header to indicate CSS
    res.setHeader('Content-Type', 'text/css');

    // Send the blank CSS content
    res.send(__dirname + "/blank.html");
});

/** Database clean-up */
setInterval(() => {
    // select games that are completed 
    db.query(`SELECT * FROM current_games WHERE playing<=0`, (err, res) => {
        if (err) console.log(0, err);
        else {
            // delete the completed games
            db.query(`DELETE FROM current_games WHERE playing<=0`, (err) => {
                if (err) console.log(err);
            })
            let empty_games = res;
            // delete the corresponding tables
            for (let games of empty_games) {
                db.query(`DROP table ??, ??`, [`cd${games.code}`, `gd${games.code}`], (err) => {
                    if (err) console.log(err);
                })
            }
        }
    })
}, 30000);