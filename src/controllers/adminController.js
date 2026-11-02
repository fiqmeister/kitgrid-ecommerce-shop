// admin dashboard pages (EJS). Renders pages and sets/clears the admin cookie; no SQL here.

const adminAuthService = require('../services/adminAuthService');

// GET /admin/login
function showLogin(req, res) {
    res.render('admin/login', { error: null, email: '' });
}
// POST /admin/login   (form fields: email, password)
async function loggingIn(req, res) {
    const token = await adminAuthService.loginAdmin(req.body.email, req.body.password);
    if (!token) {
        // show the form again with the message
        return res.status(401).render('admin/login', {
            error: 'Invalid email or password.',
        });
    }
    res.cookie('adminToken', token, {
        httpOnly: true,     // JavaScript in the page cannot read it
        sameSite: 'strict', // the browser only sends it on requests from this site (CSRF protection)
    });
    res.redirect('/admin');
}
// POST /admin/logout
function loggingOut(req, res) {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
}
// GET /admin   (placeholder until the dashboard is built)
function showDashboard(req, res) {
    res.render('admin/dashboard', { active: 'dashboard' });
}

module.exports = { showLogin, loggingIn, loggingOut, showDashboard };
