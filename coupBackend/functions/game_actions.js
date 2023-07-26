function take_game_coins(req, res) {
    const { code, n, player_coins } = req.body;

    // Check if required properties exist and are valid
    if (code === undefined || n === undefined || player_coins === undefined) {
        return res.status(400).json({ error: 'Invalid request. Missing required properties.' });
    }

    if (!Number.isInteger(n) || n <= 0) {
        return res.status(400).json({ error: 'Invalid value for "n". It should be a positive integer.' });
    }

    if (!Number.isInteger(player_coins) || player_coins < 0) {
        return res.status(400).json({ error: 'Invalid value for "player_coins". It should be a non-negative integer.' });
    }

    // Perform calculations
    let gameCoins = 50 - n;
    let updatedPlayerCoins = player_coins + n;

    let data = { game_coins: gameCoins, player_coins: updatedPlayerCoins };
    res.send(data);
}


function take_player_coins(req, res) {
    const code = req.body.code;
    const n = req.body.n;
    let player1_coins = 0;
    let player2_coins = 0;
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
    take_game_coins,
    take_player_coins,
}