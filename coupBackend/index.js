/* imports */
const sql_db = require('./functions/sql_db.js');
const create_game = require('./functions/create_game.js');
const connections_ = require('./functions/connections.js');
const clear = require('./functions/clear_games.js');
const game_actions = require('./functions/game_actions.js');

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

io.on("connection", (socket) => { // maybe add a lobby to avoid annoying error messages
    let socket_id = socket.id;
    console.log(socket.id, "connected");
    // console.log((Object.keys(io.sockets.sockets)).length);

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

        // Wait for distribute_cards function to complete

        // Continue with the rest of your code
    });


    socket.on("reconnected", (arg1) => {
        socket.join(arg1);
    })

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });

    socket.on("take_coins", (code, giverId, receiverId, trans_amount) => { // id represents the one who the action is taken upon
        let coins = [];
        game_actions.coin_transactions(code, giverId, receiverId, trans_amount, (err, res) => {
            if (err) console.log(err);
            else {
                coins = res;
                console.log(coins);
                io.emit('give_coins', coins[0], receiverId, coins[1], giverId);
            }
        });
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
                game_actions.delete_card(receiverId, (err, res) => {
                    if (err) console.log(err);
                    else {

                    }
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

    socket.on("block_steal", (code, agentId, receiverId, card) => {
        // receiver is now the person whos attempt is blocked
        // agent is the person whos blocking
        // emit
    })

    socket.on("block_coup", (code, agentId, receiverId, card) => {
        // contessa 
        // emit
    })

    socket.on("challenge", (code, agentId, card) => {
        // lose card if opponent has card
        // otherwise, opponent loses card
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