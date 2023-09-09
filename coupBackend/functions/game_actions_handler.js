const game_actions = require('./game_actions.js');


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
        else if (action.card === "cap") {
            if (action.rule === 1) {
                game_actions.coin_transactions(code, action.defenderId, action.id, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                        io.emit('give_coins', coins[0], action.id, coins[1], action.defenderId);
                    }
                })
            }
            else {
                game_actions.coin_transactions(code, action.defenderId, action.id, 2, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                        io.emit('give_coins', coins[0], action.id, coins[1], action.defenderId);
                    }
                })
            }
        }
        else if (action.card === "duk") {
            if (action.rule === 1) {
                game_actions.coin_transactions(code, action.defenderId, action.id, 3, (err, res) => {
                    if (err) console.log(err);
                    else {
                        coins = res;
                        io.emit('give_coins', coins[0], action.id, coins[1], action.defenderId);
                    }
                });
            }
            else {

            }
        }
        resolve("resolved");
    });
}

async function bs(io, code, action) {
    game = "gd" + code;
    let cards = await game_actions.get_player_cards(game, action.id);
    let action2 = { ...action };
    action2.id = action.defenderId;
    action2.defenderId = action.id;
    console.log(cards);
    return new Promise((resolve, reject) => {
        // bs is right
        // undo the last action
        // * call the handler and reverse ids
        if (cards.card_1 === action.card || cards.card_2 === action.card) {
            io.emit('challenge_results', action2.id);
        } else {
            // bs is wrong
            io.emit('challenge_results', action2.defenderId);
        }
        resolve(action);
    });
}

module.exports = {
    handler,
    bs,
}