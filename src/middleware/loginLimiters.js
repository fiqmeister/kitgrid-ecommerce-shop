// login rate limits: stop scripts from guessing passwords
// only FAILED logins count (wrong password = 401), so a real user who types it right is never blocked
// counted per IP address, kept in the server's memory (restarting the server resets the counts)

const { rateLimit } = require('express-rate-limit');

const fifteen_minutes = 15 * 60 * 1000; // windowMs is in milliseconds
const failed_tries_allowed = 5;
const too_many_message = 'Too many failed logins. Please wait 15 minutes and try again.';

// customer API login (POST /api/auth/login): answers in JSON, like every other API error
const apiLoginLimiter = rateLimit({
    windowMs: fifteen_minutes,
    limit: failed_tries_allowed,
    skipSuccessfulRequests: true,     // a correct login (status 200) is not counted
    standardHeaders: 'draft-8',       // sends a RateLimit header so the app can see how many tries are left
    legacyHeaders: false,             // no old-style X-RateLimit-* headers
    message: { error: too_many_message }, // same { error: ... } shape as errorHandler.js
    // status code is 429 Too Many Requests by default
});

// admin login (POST /admin/login): a person is looking at a page, so show the login form again with the message
const adminLoginLimiter = rateLimit({
    windowMs: fifteen_minutes,
    limit: failed_tries_allowed,
    skipSuccessfulRequests: true,     // a correct login redirects (status 302), so it is not counted
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    // runs instead of the login controller once the limit is reached
    handler: (req, res) => {
        const form = req.body || {};
        res.status(429).render('admin/login', {
            error: too_many_message,
            email: form.email || '', // keep the email they typed
        });
    },
});

module.exports = { apiLoginLimiter, adminLoginLimiter };
