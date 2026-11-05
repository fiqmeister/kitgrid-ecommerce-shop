// admin forms only: every POST must send back the CSRF token from the admin's own login
// (a bad website can make the browser post a form here, but it cannot know this value)
// use it right AFTER requireAdmin (which sets req.admin) and BEFORE validate(...) (which strips unknown fields like _csrf)

const createError = require('../utils/createError');

function checkCsrf(req, res, next) {
    const adminCsrfToken = req.admin.csrfToken; // the value inside the admin's signed cookie
    const form = req.body || {};
    const sent = form._csrf;              // the value from the hidden field in the form

    // also refuse an old cookie from before CSRF was added has no token
    // (otherwise undefined === undefined would let a form WITHOUT the field through)
    if (!adminCsrfToken || sent !== adminCsrfToken) {
        return next(createError('This form has expired. Reload the page and try again.', 403));
    }
    next();
}

module.exports = checkCsrf;
