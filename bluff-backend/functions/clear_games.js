const db = require('../config/db');
/**
 * Clears the database of all user-generated data
 * @param {*} res1 listener for clear completion
 */
function handleClear(res1) {
    db.query(`SELECT * FROM current_games`, (err, res) => {
        let games = res;
        for (let i = 0; i < games.length; i++) {
            db.query(`DROP TABLE ??, ??`, [`cd${games[i].code}`, `gd${games[i].code}`], (err) => {
                if (err) console.log(err);
            });
        }
    })
    db.query(`delete from current_players`, (err, res) => {
        if (err) console.log(err);
    });

    db.query(`delete from current_games`, (err, res) => {
        if (err) console.log(err);
        else res1.send("deleted");
    })
};

module.exports = {
    handleClear,
}