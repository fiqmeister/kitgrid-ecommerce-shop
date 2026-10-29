// checks the secret key that N8N sends, used for the /api/tools routes only
// N8N is not a logged-in user, so it has no JWT. It sends this key instead.

const createError = require('../utils/createError');

function requireApiKey(req, res, next) {
    const key = req.headers['x-api-key'];

    // !key: no header was sent
    // key !== ...: a header was sent, but it's the wrong key
    if (!key || key !== process.env.N8N_TOOLS_API_KEY) {
        throw createError('Invalid or missing API key', 401);
    }
    next();
}

module.exports = requireApiKey;
