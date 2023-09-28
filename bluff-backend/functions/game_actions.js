const db = require('../config/db');
const sql_db = require('./sql_db.js');

/**
 * Notifies the game to update the turns
 * @param {*} code game identification
 * @param {*} player_count number of players in the game (unused)
 * @returns the next turn
 */
function update_game_turn(code, player_count) {
    return new Promise((resolve, reject) => {
        let game = "gd" + code;
        db.query(`SELECT playing FROM ?? WHERE code=?`, ["current_games", code], (err, res) => {
            if (err) console.log(err);
            else {
                let playing = res[0].playing;
                db.query(`SELECT turnOrder FROM ?? WHERE id=?`, [game, -1], (err, res_) => {
                    if (err) console.log(err);
                    else {
                        let current_turn = res_[0].turnOrder;
                        let next_turn = current_turn;
                        // player elimination case
                        if (next_turn < playing) {
                            next_turn = current_turn + 1;
                        };
                        if (playing === next_turn) next_turn = 0;

                        db.query(`UPDATE ?? SET turnOrder=? WHERE id=?`, [game, next_turn, -1], (err, res__) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                resolve(next_turn);
                            }
                        })
                    }
                })
            }
        })

    })
}

/**
 * Distributes the player cards and updates the db 
 * @param {*} code 
 * @returns null
 */
function distribute_cards(code) {
    return new Promise((resolve, reject) => {
        let game = "gd" + code;
        let cards = "cd" + code;
        let player_count = 0;
        let players = [];
        db.query(`SELECT * FROM ??`, [game], (err, res) => {
            if (err) console.log(err);
            else {
                players = res[0];
                player_count = res.length - 1;
                const ids = res.map(item => item.id).filter(id => id !== -1);

                db.query(`SELECT id, num FROM ??`, [cards], (err, res_) => {
                    if (err) console.log(err);
                    else {
                        let deck_count = 0;
                        let deck = [];
                        for (let i = 0; i < res_.length; i++) {
                            deck_count += res_[i].num;
                            let card = { id: res_[i].id, count: parseInt(res_[i].num) };
                            deck.push(card);
                        }
                        // console.log("deck", deck);
                        // fill with strings containing card identifiers
                        let initial_cards_in_play = player_count * 2; // make this scalable
                        let selected_cards = [];
                        let card_sums = [deck[0].count]; // len = len(deck) + 1
                        for (let i = 1; i < deck.length; i++) {
                            card_sums.push(deck[i].count + card_sums[i - 1]);
                        }
                        // console.log(card_sums);

                        for (let i = 0; i < player_count; i++) {
                            let v = -1;
                            for (let j = 0; j < 2; j++) {
                                let randomValue = Math.random();
                                // iterating through to find what card
                                for (let k = 0; k < deck.length; k++) {
                                    // console.log(randomValue, card_sums[k] / deck_count, deck[k]);
                                    if (randomValue <= (card_sums[k] / deck_count)) {
                                        if (k !== 0) {
                                            if (card_sums[k] === card_sums[k - 1]) continue;
                                            else {
                                                v = k;
                                                break;
                                            }
                                        }
                                        else {
                                            if (card_sums[k] === 0) continue;
                                            else {
                                                v = k;
                                                break;
                                            }
                                        }
                                    }
                                }
                                for (let k = v; k < card_sums.length; k++) { // v + 1
                                    card_sums[k]--;
                                }
                                deck[v].count--;
                                deck_count--;
                                selected_cards.push(deck[v].id);
                                // console.log(selected_cards);
                            }
                            // console.log(cards);
                            db.query(`UPDATE ?? SET card_1=?, card_2=? WHERE id=?`, [game, selected_cards[i * 2], selected_cards[i * 2 + 1], ids[i]], (err, res__) => { // UPDATE PLAYER CARDS
                                if (err) reject();
                                else {
                                    console.log(res__);
                                }
                            })
                        }
                        for (let i = 0; i < deck.length; i++) {
                            db.query(`UPDATE ?? SET num=? WHERE id=?`, [cards, deck[i].count, deck[i].id], (err, res) => {
                                if (err) console.log(err);
                                else {
                                    // console.log(res);
                                    resolve();
                                }
                            })
                        }
                    }
                })
            }
        })
    })
}

/**
 * Handles coin transactions
 * @param {*} code game identifier
 * @param {*} giverId person losing coins (attacked/defender)
 * @param {*} receiverId person receiving coins (attacker)
 * @param {*} trans_amount transaction amount
 * @param {*} callback 
 */
function coin_transactions(code, giverId, receiverId, trans_amount, callback) {
    let game = "gd" + code;
    db.query(`SELECT coins FROM ?? WHERE id=?`, [game, receiverId], (err, res) => {
        if (err) console.log(err);
        else {
            let receiverCoins = res[0].coins;
            db.query(`SELECT coins FROM ?? WHERE id=?`, [game, giverId], (err, res) => {
                let giverCoins = res[0].coins;
                // console.log(trans_amount, receiverCoins, giverCoins);
                if (giverCoins - trans_amount < 0) {
                    receiverCoins += giverCoins;
                    giverCoins = 0;
                }
                else {
                    receiverCoins += trans_amount;
                    giverCoins -= trans_amount;
                }
                // console.log(trans_amount, giverCoins, receiverCoins);
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
}

/**
 * Updates the turn order and marks player as eliminated. 
 * @param {*} code game identifier
 * @param {*} elim_id eliminated player's id
 * @param {*} elim_turn eliminated player's turn
 * @returns winner or null (returned from end_game function call)
 */
async function eliminated(code, elim_id, elim_turn) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT turnOrder, id FROM ??`, [`gd${code}`], (err, res) => {
            if (err) console.log(err);
            else {
                let turns_and_ids = res;
                for (let i = 0; i < turns_and_ids.length; i++) {
                    if (turns_and_ids[i].id !== -1 && turns_and_ids[i].turnOrder > elim_turn) {
                        db.query(`UPDATE ?? SET turnOrder=? WHERE id=?`,
                            [`gd${code}`, turns_and_ids[i].turnOrder - 1, turns_and_ids[i].id], (err, res_) => {
                                if (err) console.log(err);
                            });
                    }
                    else if (turns_and_ids[i].id === elim_id) {
                        db.query(`UPDATE ?? SET turnOrder=? WHERE id=?`,
                            [`gd${code}`, -2, turns_and_ids[i].id], (err, res_) => {
                                if (err) console.log(err);
                            });
                        db.query(`SELECT playing FROM ?? WHERE code=?`, ['current_games', code], (err, res_) => {
                            if (err) console.log(err);
                            else {
                                let count = res_[0].playing - 1;
                                console.log("count", count);
                                db.query(`UPDATE ?? SET playing=? WHERE code=?`, ['current_games', count, code], (err, res__) => {
                                    if (err) console.log(err);
                                    else {
                                        if (count === 1) {
                                            const winner = end_game(code, elim_id);
                                            resolve(winner);
                                        }
                                        else resolve(null);
                                    }
                                })
                            }
                        })
                    }
                }
            }
        })
    })

}

/**
 * Check's if game is over. Called when player is eliminated. 
 * @param {*} code game code
 * @param {*} elim_id eliminated player's id
 * @returns winner
 */
function end_game(code, elim_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM gd${code} WHERE turnOrder!=-2 AND id NOT IN (?)`, [[-1, elim_id]], (err, res) => {
            if (err) {
                console.log(err);
                resolve(null);
            }
            else {
                console.log(res);
                const winner = { 'id': res[0].id, 'username': res[0].username };
                console.log(winner);
                resolve(winner);
            }
        })
    })
}

/**
 * Performs card deletion. 
 * @param {*} code game code
 * @param {*} id player who is losing id
 * @param {*} card card to be deleted
 * @param {*} callback informs process completion
 */
async function delete_card(code, id, card, callback) {
    let game = "gd" + code;
    let card_game = "cd" + code;
    let cards = await sql_db.getPlayerCards(game, id);
    let card_index = cards.card_1 === card ? 1 : 2;

    db.query(`UPDATE ?? SET card_${card_index}=? WHERE id=?`, [game, null, id], (err, res) => {
        if (err) console.log(err);
        else {
            // add card back to pile
            db.query(`SELECT num FROM ?? WHERE id=?`, [card_game, card], (err, res_) => {
                if (err) console.log(err);
                else {
                    let num_in_deck = res_[0].num;
                    db.query(`UPDATE ?? SET num=? WHERE id=?`, [card_game, num_in_deck + 1, card], (err, res__) => {
                        if (err) console.log(err);
                        else {
                            callback("completed");
                        }
                    })
                }
            })
        }
    });
}

/**
 * let there be player 1 and player 2
 * if player 1 performs an action on player 2
 * have socket of player 1 emit action named ${player2}
 * when server receives the socket.emit, have if statements (or switch case) to handle different actions. 
 */

/**
 * change attributes
 * r1: get 2 cards, and return any 2 cards
 * r2: block steal
 */

/**
 * poison
 * r1: 3 coins to kill someone
 */

/**
 * mask
 * r1: take at most 2 coins from another player
 * r2: block steal
 */

/**
 * antidote
 * r1: block an assassins kill
 */

/**
 * purse
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


/** exports */
module.exports = {
    update_game_turn,
    distribute_cards,
    coin_transactions,
    eliminated,
    delete_card,
}