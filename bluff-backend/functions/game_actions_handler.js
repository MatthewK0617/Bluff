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
        else if (action.card === "amb") { }
        else if (action.card === "ass") {
            // attacker loses coins for this
            game_actions.coin_transactions(code, action.id, -1, 3, (err, res) => {
                if (err) console.log(err);
                else {
                    coins = res;
                }
            });
            // if defender allows, they lose a card
        }
        else if (action.card === "cap") {
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
        else if (action.card === "con") {
            console.log(action);
        }
        else if (action.card === "duk") {
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
    let cards = await game_actions.get_player_cards(game, action.id);
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