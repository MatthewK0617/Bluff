const db = require('../config/db');

function handleClear() {
    db.query(`delete from current_players`, (err, res) => {
        if (err) {
            console.log(err)
        }
        // res.send(result);
    });

    db.query(`delete from current_games`, (err, res) => {
        if (err) {
            console.log(err)
        }
        // res.send(result);

    })
};

module.exports = {
    handleClear,
}