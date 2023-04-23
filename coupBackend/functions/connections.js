/**
 * Check if server is online
 */

let checkConnection = (app) => {
    app.get("/", (req, res) => {
        res.json({ message: "Hello from server!" });
    });
}

module.exports = {
    checkConnection,
}