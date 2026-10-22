// Takes in request and sends the response out. No business rules/logic, No SQL here.

const authService = require('../services/authService');

async function register(req, res) {
    const user = await authService.register(req.body); // take in as object
    res.status(201).json({ user });
}

async function login (req, res) {
    const result = await authService.login(req.body);
    res.json(result); // once gotten result, display it
}

module.exports = { register, login };