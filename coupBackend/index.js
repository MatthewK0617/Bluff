/* imports */
const sql_db = require('./functions/sql_db.js');
const create_game = require('./functions/create_game.js');
const connections_ = require('./functions/connections.js');
const clear = require('./functions/clear_games.js');

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
const games = io.of('/games');


let interval;
let socket_id;

io.on("connection", (socket) => { // maybe add a lobby to avoid annoying error messages
    socket_id = socket.id;
    console.log(socket.id, "connected");
    console.log((Object.keys(io.sockets.sockets)).length);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("joingame", (arg1, arg2, callback) => {
        console.log("connected to game. fetching other players");
        socket.join(arg1);
        socket.emit("getplayers");
        sql_db.getPlayersSocket(arg1, arg2, (error, players) => {
            if (error) {
                console.error(error);
                callback(error, null);
            } else {
                console.log(players);
                callback({ players: players }, null);
            }
        });
        socket.join(arg2);
    });

    socket.on('roomEvent', (message, callback) => {
        console.log(message);
        callback("res");
    })

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        clearInterval(interval);
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