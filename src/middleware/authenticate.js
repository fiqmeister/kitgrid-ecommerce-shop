// check the access token if user is logged in

const tokens = require('../utils/tokens');
const createError = require('../utils/createError');

function authenticate (req, res, next) {
    // client sends the access token in a header
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw createError('Please log in', 401);
    }
    // if valid, saves the id, role on req.user for later functions to use
    try {
        const payload = tokens.verifyAccessToken(token);
        req.user = {
            id: payload.id,
            role: payload.role
        };
    } catch (err) {
        throw createError('Session expired or invalid. Please login again', 401);
    }
    next();
}

module.exports = authenticate;