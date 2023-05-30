/* imports */
const sql_db = require('./functions/sql_db.js');
const create_game = require('./functions/create_game.js')
const connections_ = require('./functions/connections.js')

const express = require("express");
const app = express();

const db = require('./config/db')

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

let interval;
let socket_id;

let games = [];

io.on("connection", (socket) => {
    socket_id = socket.id;
    console.log(socket.id, "connected");
    console.log((Object.keys(io.sockets.sockets)).length);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("joingame", (data) => {
        console.log("connected to game");
    })
    socket.on("disconnect", () => {
        sql_db.handleDisconnect(games, socket_id);
        // console.log(cd_current);
        console.log(`Client ${socket_id} disconnected`);
        clearInterval(interval);
    });
});

/**
 * check connection
 */
app.get("/", (req, res) => {
    connections_.checkConnection(app, res);
});

/**
 * get available games codes from db
 * TODO: think about differentiating between open and closed games
 */
app.get("/getGames", (req, res) => {
    sql_db.getGames(app, res);
});

/**
 * get players in a specific game instance
 */
app.get(`/getPlayers`, (req, res) => {
    sql_db.getPlayers(app, req, res);
});

/**
 * handles adding players to a game
 */
app.post("/addPlayers", (req, res) => {
    sql_db.addPlayers(app, req);
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
    create_game.createGame(app, games, socket_id, req);
    // update server instance of game_data every create_game and leave_game. 
});

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

/* listener check */
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
