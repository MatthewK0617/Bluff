const db = require('../config/db').default;

function handleClear() {
    db.query(`delete from current_players`, (err, res) => {
        if (err) {
            console.log(err)
        }
    });

    db.query(`delete from current_games`, (err, res) => {
        if (err) {
            console.log(err)
        }
    })
};

module.exports = {
    handleClear,
}