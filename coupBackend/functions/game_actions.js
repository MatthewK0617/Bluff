const db = require('../config/db');

// giver and receiver are objects: {id: __, coins: __}
function coin_transactions(code, giverId, receiverId, trans_amount, callback) {
    let game = "gd" + code;
    db.query(`SELECT coins FROM ?? WHERE id=?`, [game, receiverId], (err, res) => {
        if (err) console.log(err);
        else {
            let receiverCoins = res[0].coins;
            db.query(`SELECT coins FROM ?? WHERE id=?`, [game, giverId], (err, res) => {
                let giverCoins = res[0].coins;
                console.log(trans_amount, giverCoins, receiverCoins);

                if (giverCoins - trans_amount < 0) {
                    receiverCoins += giverCoins;
                    giverCoins = 0;
                }
                else {
                    receiverCoins += trans_amount;
                    giverCoins -= trans_amount;
                }
                console.log(trans_amount, giverCoins, receiverCoins);

                db.query(`UPDATE ?? SET coins=? WHERE id=?`, [game, receiverCoins, receiverId], (err) => {
                    if (err) console.log(err);
                });
                db.query(`UPDATE ?? SET coins=? WHERE id=?`, [game, giverCoins, giverId], (err) => {
                    if (err) console.log(err);
                });
                let coins = [receiverCoins, giverCoins];
                callback(null, coins);

                // let giverCoins = res[0];
            })
        }
    })

    // access the game at the given code
    // get {giverIds} coins -- remember to avoid sql injections
    // add trans_amount to the receiverCoins
    // subtract trans_amount from the giverCoins
    // update both in the db
    // return the receiverCoins and giverCoins in an array
}

/**
 * let there be player 1 and player 2
 * if player 1 performs an action on player 2
 * have socket of player 1 emit action named ${player2}
 * when server receives the socket.emit, have if statements (or switch case) to handle different actions. 
 */

/**
 * ambassador: 
 * r1: get 2 cards, and return any 2 cards
 */

/**
 * assassin
 * r1: 3 coins to kill someone
 */

/**
 * captain
 * r1: take at most 2 coins from another player
 * r2: block steal
 */

/**
 * contessa
 * r1: block an assassins kill
 */

/**
 * duke
 * r1: take 3 coins 
 * r2: block 2 coin gain
 */

/** implement this later
 * judge
 * r1: see 1 of other players card
 * r2: swap 1 card out of the pile
 */

/**
 * general actions
 * take 1 coin
 * take 2 coins
 * kill with 7 coins (coup)
 * challenge - lose 1 card if opponent does have card, otherwise opponent loses card
 * when player is eliminated, coins go to bank
 */

module.exports = {
    coin_transactions,
}