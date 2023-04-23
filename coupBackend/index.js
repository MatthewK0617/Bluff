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
let cd_current = "";
// THESE ARE UPDATING FOR THE ENTIRE SERVER, NOT EACH INDIVIDUAL CLIENT. 
// CLIENTS SHOULD ONLY JOIN A SPECIFIC GAME, AND BEFORE JOINING GAMES
// NOT HAVE ANY CODES STORED IN HERE. 

// error is happening because these have values from previous clients and 
// are staying filled. 

// best practice would be to have one per client and send that info from 
// the client to the server each time a client disconnects 
// the value would only update CLIENT-SIDE


const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let interval;
let socket_id;
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
        // too many connecting in terminal logs
    })
    socket.on("disconnect", () => {
        if (cd_current != "" && gd_current != "") {
            sql_db.handleDisconnect(cd_current, gd_current, socket_id);
        }
        console.log(cd_current);
        console.log(`Client ${socket_id} disconnected`);
        clearInterval(interval);
    });
});

/**
 * check connection
 */
connections_.checkConnection(app);

/**
 * get available games codes from db
 * TODO: think about differentiating between open and closed games
 */
sql_db.getGames(app);

/**
 * get players in a specific game instance
 */
sql_db.getPlayers(app);

/**
 * handles adding players to a game
 */
sql_db.addPlayers(app);


/**
 * update card info
 */
sql_db.updateCardData(app);

/**
 * creates game
 */
create_game.createGame(app, socket_id);

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

/* final operation */
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
