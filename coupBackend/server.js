// NOT USING

const path = require("path")
const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");


console.log(__dirname);

app.get('/', (req, res) => {
    res.render('/Users/matthewkim/Documents/dev-web2/coup/src/App.js');
});

const server = http.Server(app);
server.listen(8080);

const io = socketIO(server);

io.on('connection', (socket) => {
    socket.emit("connected", () => {
        connected: "Hello Client"
    });
    socket.on("connected", (message) => {
        console.log(message);
    })
})

// move the server into react project - look into client vs server side rendering
// continue with the tic-tac-toe; maybe start with testing their source code to see if it works