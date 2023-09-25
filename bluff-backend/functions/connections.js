/**
 * Check if server is online
 */
function checkConnection(app, res) {
    res.json({ message: "Hello from server!" });
}

module.exports = {
    checkConnection,
}