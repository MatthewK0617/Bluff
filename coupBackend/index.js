const express = require("express"); // mobile application screen display using xcode
const app = express();
// const bodyParser = require('body-parser');

const db = require('./config/db')

const PORT = process.env.PORT || 8000; // https://stackoverflow.com/questions/37694551/do-client-and-server-need-to-use-same-port-to-connect
const cors = require("cors"); //
app.use(cors()); //
app.use(express.json());
app.use(express.urlencoded());
// app.use(bodyParser);

const http = require('http').Server(app);

const cards = {};


const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "Hello from server!" });
});

// route to get gamedata info
app.get("/api/get", (req, res) => {
    console.log("getting");
    db.query("SELECT * FROM GAMEDATA", (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})
// eventually create categories in MySQL and parse into
// app.post(`/fetchGameData?category=${here}`, (req, res) => {

// update game data
app.post("/api/post", (req, res) => {
    let id = req.body.id;
    const num = req.body.num;
    const r1 = req.body.r1;
    const r2 = req.body.r2;
    const r3 = req.body.r3;
    console.log(num, r1, r2, r3)


    // sending a request each time card is updated? or do it on submit? 
    // if I do it on submit, will need to loop through and update each row separately
    // turn the cards into objects

    db.query(`UPDATE card_info SET num=${num}, r1=${r1}, r2=${r2}, r3=${r3} WHERE id='${id}'`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
})

let interval;

io.on("connection", (socket) => { // struggling to create connection
    console.log("New client connected to 3000");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};


/* final operation */

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

