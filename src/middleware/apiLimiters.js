// API rate limits
// kept in the server's memory, like the login limits: restarting the server resets the counts

const { rateLimit } = require('express-rate-limit');

const one_hour = 60 * 60 * 1000;   // windowMs is in milliseconds
const one_minute = 60 * 1000;

// register (POST /api/auth/register): stops a script from creating many accounts
// counted per IP address (the default), every try counts, even failed ones
const registerLimiter = rateLimit({
    windowMs: one_hour,
    limit: 10, // 10 tries an hour
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many sign-up attempts. Please wait an hour and try again.' }, // same { error: ... } shape as errorHandler.js
});

// Kit Advisor (POST /api/advisor): every message is an AI run
// counted per USER, not per IP: authenticate runs first and sets req.user
const advisorLimiter = rateLimit({
    windowMs: one_minute,
    limit: 5, // 5 messages a minute per user/customer
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => 'user-' + req.user.id,  // whose count this request adds to
    message: { error: 'You are sending messages too quickly. Please wait a minute and try again.' },
});

module.exports = { registerLimiter, advisorLimiter };
