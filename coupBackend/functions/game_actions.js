const db = require('../config/db');

function update_game_turn(code, turn) {
    let game = "gd" + code;
    db.query(`UPDATE ?? SET turnOrder=? WHERE id=?`, [game, turn, -1], (err, res) => {
        if (err) console.log(err);
        else console.log(res);
    })
}

function distribute_cards(code) {
    return new Promise((resolve, reject) => {
        // need code, thats it?
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
                // const ids = res.map(item => item.id);
                // console.log(ids);

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
                                    console.log(randomValue, card_sums[k] / deck_count, deck[k]);
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
                                deck_count--;
                                selected_cards.push(deck[v].id);
                                console.log(selected_cards);
                            }
                            console.log(cards);
                            db.query(`UPDATE ?? SET card_1=?, card_2=? WHERE id=?`, [game, selected_cards[i * 2], selected_cards[i * 2 + 1], ids[i]], (err, res__) => { // UPDATE PLAYER CARDS
                                if (err) reject();
                                else {
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

function coin_transactions(code, giverId, receiverId, trans_amount, callback) {
    let game = "gd" + code;
    db.query(`SELECT coins FROM ?? WHERE id=?`, [game, receiverId], (err, res) => {
        if (err) console.log(err);
        else {
            // console.log()
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

function delete_card(receiverId) {
    // implement
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
    update_game_turn,
    distribute_cards,
    coin_transactions,
    delete_card,
}