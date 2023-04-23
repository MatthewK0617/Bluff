const express = require("express");
const app = express();

const db = require('./config/db')

const PORT = process.env.PORT || 8000;
const cors = require("cors"); //
app.use(cors()); //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require('http').Server(app);

const default_cards = [
    { id: 'amb', num: 4, r1: 1, r2: 1, r3: 1 },
    { id: 'ass', num: 4, r1: 1, r2: 1, r3: 1 },
    { id: 'cap', num: 4, r1: 1, r2: 1, r3: 1 },
    { id: 'con', num: 4, r1: 1, r2: 1, r3: 1 },
    { id: 'duk', num: 4, r1: 1, r2: 1, r3: 1 },
];

let gd_current = ""; // for deleting purposes
let cd_current = ""; // for deleting purposes


const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});



/**
 * Check if server is online
 */
app.get("/", (req, res) => {
    res.json({ message: "Hello from server!" });
});

/**
 * Get available games codes from db
 * TODO: think about differentiating between open and closed games
 */
app.get("/getGames", (req, res) => {
    db.query("SHOW TABLES", (err, result) => {
        if (err) {
            console.log(error);
        }
        res.send(result);
    })
});

/**
 * Get players in a specific game instance
 */
app.get(`/getPlayers`, (req, res) => {
    console.log(req.query.code);
    db.query(`SELECT * FROM ${req.query.code}`, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
});

/**
 * handles adding players to a game
 */
app.post("/addPlayers", (req, res) => {
    console.log("adding");
    let username = req.body.username;
    let code = "gd" + req.body.code;
    db.query(`INSERT INTO ${code} (name) VALUES ('${username}')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
        // res.send(result);
    })
});


/**
 * update card info
 */
app.post(`/updateCardData`, (req, res) => {
    let id = req.body.id;
    const num = req.body.num;
    const r1 = req.body.r1;
    const r2 = req.body.r2;
    const r3 = req.body.r3;
    console.log(num, r1, r2, r3)

    db.query(`UPDATE card_info SET num=${num}, r1=${r1}, r2=${r2}, r3=${r3} WHERE id='${id}'`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
})

app.post('/createGame', (req, res) => {
    // check if it exists and if not let it be a valid code
    // let code = Math.floor(100000 + Math.random() * 900000) 
    let code = Math.floor(100 + Math.random() * 999); // should be above
    let username = req.body.username;
    let new_cards = [
        req.body.amb, req.body.ass, req.body.cap, req.body.con, req.body.duk
    ]

    let game_data = "gd" + code;
    let card_data = "cd" + code;

    gd_current = game_data;
    cd_current = card_data;


    console.log(game_data);
    db.query(`CREATE TABLE ${game_data} ( name varchar(20), id int NOT NULL UNIQUE)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
    db.query(`INSERT INTO ${game_data} (name, id) VALUES ('${username}', 1)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })

    db.query(`CREATE TABLE ${card_data} ( id text, num int, r1 tinyint, r2 tinyint, r3 tinyint)`, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })

    for (let i = 0; i < new_cards.length; i++) {
        db.query(`INSERT INTO ${card_data} (id, num, r1, r2, r3) VALUES 
        ('${new_cards[i].id}', ${new_cards[i].num}, ${new_cards[i].r1}, ${new_cards[i].r2}, ${new_cards[i].r3})`,
            (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
            })
    }
})

/**
 * creates connection between server and client using socket.io
 */
let interval;
io.on("connection", (socket) => {
    console.log("New client connected to 3000");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log(cd_current)
        if (cd_current != "" && gd_current != "") {
            db.query(`SELECT * from ${gd_current}`, (err, res) => {
                size = res.length;
                console.log(size);
                console.log(res[0]);
                // if last client, then delete using the queries below
            })

            db.query(`DROP TABLE ${cd_current}`, (err, res) => {
                if (err) {
                    console.log(err);
                }
            });
            db.query(`DROP TABLE ${gd_current}`, (err, res) => {
                if (err) {
                    console.log(err);
                }
            });
        }

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

