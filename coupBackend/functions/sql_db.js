// maybe make error handler function
const db = require('../config/db');

let handleDisconnect = (cd_current, gd_current, socket_id) => {
    return () => {
        let length = 0;
        db.query(`DELETE FROM ${cd_current} WHERE socket_id=${socket_id}`, (err, res) => {
            if (err) {
                console.log(err);
            }
        })
        db.query(`SELECT COUNT(*) FROM ${cd_current}`, (err, res) => {
            // length = res.count;
        })
        if (length == 0) {
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
    }
}

let getGames = (app) => {
    app.get("/getGames", (req, res) => {
        db.query("SHOW TABLES", (err, result) => {
            if (err) {
                console.log(error);
            }
            res.send(result);
        })
    });
}

let getPlayers = (app) => {
    app.get(`/getPlayers`, (req, res) => {
        console.log(req.query.code);
        db.query(`SELECT * FROM ${req.query.code}`, (err, result) => {
            if (err) {
                console.log(err);
            }
            res.send(result);
        })
    });
}

let addPlayers = (app) => {
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
}

let updateCardData = (app) => {
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
}


module.exports = {
    handleDisconnect, // delete games
    getGames,
    getPlayers,
    addPlayers,
    updateCardData,
}

// make this file for handling connecting and disconnecting using socket

// make another file for updating sql database