const game_actions = require('./game_actions.js');
const sql_db = require('./sql_db.js');

/**
 * Primary function for handling game actions
 * @param {*} io 
 * @param {int} code game identifier
 * @param {Object} action action taken 
 * @returns 
 */
function handler(io, code, action) {
    return new Promise((resolve, reject) => {
        if (action.card === "def") {
            if (action.rule === 1) {
                game_actions.coin_transactions(code, action.defenderId, action.id, 1, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                        io.emit('give_coins', coins[0], action.id, coins[1], action.defenderId);
                    }
                });
            }
            else {
                game_actions.coin_transactions(code, action.defenderId, action.id, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                        io.emit('give_coins', coins[0], action.id, coins[1], action.defenderId);
                    }
                });
            }
        }
        else if (action.card === "cha") { }
        else if (action.card === "poi") {
            // attacker loses coins for this
            game_actions.coin_transactions(code, action.id, -1, 3, (err, res) => {
                if (err) console.log(err);
                else {
                    coins = res;
                }
            });
            // if defender allows, they lose a card
        }
        else if (action.card === "mas") {
            if (action.rule === 1) {
                game_actions.coin_transactions(code, action.defenderId, action.id, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                    }
                })
            }
            else {
                game_actions.coin_transactions(code, action.defenderId, action.id, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                    }
                })
            }
        }
        else if (action.card === "ant") {
            console.log(action);
        }
        else if (action.card === "pur") {
            if (action.rule === 1) {
                console.log(action.defenderId);
                game_actions.coin_transactions(code, action.defenderId, action.id, 3, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                    }
                });
            }
            else {
                game_actions.coin_transactions(code, action.defenderId, -1, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                    }
                })
            }
        }

        resolve("resolved");
    });
}

async function bs(io, code, action) {
    game = "gd" + code;
    let cards = await sql_db.getPlayerCards(game, action.id);
    let action2 = { ...action };
    action2.id = action.defenderId;
    action2.defenderId = action.id;
    // console.log(cards);
    return new Promise((resolve, reject) => {
        // bs is called wrong
        if (cards.card_1 === action.card || cards.card_2 === action.card) {
            console.log("right");
            io.emit('challenge_results', action2.id);
        } else {
            // bs is called right
            // undo the last action (implement)
            // * call the handler and reverse ids
            if (action.card === "con") {
                io.emit("con_bluff_called", action2.defenderId);
            }
            else {
                io.emit('challenge_results', action2.defenderId);
            }

        }
        resolve(action);
    });
}

module.exports = {
    handler,
    bs,
}