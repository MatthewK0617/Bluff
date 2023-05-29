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

let gd_current = "";
let cd_current = ""; // fixing this is priority #1
// THESE ARE UPDATING FOR THE ENTIRE SERVER, NOT EACH INDIVIDUAL CLIENT. 

// error is happening because these have values from previous clients and 
// are staying filled. 

// best practice would be to have one per client and send that info from 
// the client to the server each time a client disconnects 
// the value would only update CLIENT-SIDE
// solution: info is table name

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let interval;
let socket_id;

let code = Math.floor(100 + Math.random() * 999); // should be above

let game_data = "gd" + code;
let card_data = "cd" + code;

gd_current = game_data; // same thing as above, just use one
cd_current = card_data;

let games = []

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
        sql_db.handleDisconnect(games, cd_current, gd_current, socket_id);
        console.log(cd_current);
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
    create_game.createGame(app, games, game_data, card_data, socket_id, req); // getting called instantly? not waiting for call from front-end
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
