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
    console.log((Object.keys(io.sockets.sockets)).length);

    socket.on("joinGameWaiting", (arg1, arg2, callback) => {
        socket.join(arg1);
        console.log(io.sockets.adapter.rooms.get(arg1));

        console.log(arg2 + " joined " + arg1);
        socket.emit("getplayers"); // should be when someone joins room, not in general
        sql_db.getPlayersSocket(arg1, arg2, (error, players) => {
            if (error) {
                console.error(error);
                callback(error, null);
            } else {
                // console.log(players);
                callback({ players: players }, null);
            }
        });
        // socket.join(arg2);
    });

    socket.on('startgame', (arg1, arg2, callback) => {
        console.log("emitting gamestarting " + arg1);
        console.log(io.sockets.adapter.rooms.get(arg1));
        io.of('/').to(arg1).emit('gamestarting', arg1);
        callback(arg1);
    })

    socket.on('ingame', (arg1, arg2) => {
        // socket.join(arg1);
        // console.log(arg2 + " joined " + arg1);
    })

    socket.on("reconnected", (arg1) => {
        socket.join(arg1);
    })

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });
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

app.post('/getPlayerData', (req, res) => {
    sql_db.getPlayerData(req, res);
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

app.post("/leaveGame", (req, res) => {
    sql_db.leaveGame(req, res);
})

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

/* listener check */
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});