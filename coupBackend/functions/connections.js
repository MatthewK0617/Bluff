/**
 * Check if server is online
 */

let checkConnection = (app, res) => {
    res.json({ message: "Hello from server!" });
}

module.exports = {
    checkConnection,
}