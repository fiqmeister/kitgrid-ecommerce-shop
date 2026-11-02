// admin pages only: needs a valid admin cookie, otherwise back to the login page
// (pages redirect instead of answering 401 JSON, because a person is looking at them)

const tokens = require('../utils/tokens');

function requireAdmin(req, res, next) {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.redirect('/admin/login'); // not logged in
    }

    let payload;
    try {
        payload = tokens.verifyAdminToken(token);
    } catch (err) {
        res.clearCookie('adminToken'); // fake, edited or expired: throw the bad cookie away
        return res.redirect('/admin/login');
    }

    if (payload.role !== 'admin') {
        return res.redirect('/admin/login'); // extra safety: only admin tokens are ever made
    }

    req.admin = payload;        // for controllers: req.admin.id
    res.locals.admin = payload; // for EJS pages: every page can use "admin"
    next();
}

module.exports = requireAdmin;
