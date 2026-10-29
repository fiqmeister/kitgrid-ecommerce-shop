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

async function refresh (req, res) {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
}

async function logout (req, res) {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
}

async function currentUser (req, res) {
    const user = await authService.getCurrentUser(req.user.id); // user.id gotten from authenticate which is from access token payload
    res.json({ user });
}

module.exports = { register, login, refresh, logout, currentUser };