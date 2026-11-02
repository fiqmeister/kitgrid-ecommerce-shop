// admin dashboard pages (EJS). Renders pages and sets/clears the admin cookie; no SQL here.

const adminAuthService = require('../services/adminAuthService');
const adminOrderService = require('../services/adminOrderService');

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
// GET /admin/orders   (filters in the query string, already checked by the validator)
async function showOrders(req, res) {
    const query = req.cleanQuery;
    const result = await adminOrderService.listOrders(query);

    // the current filters as text, so the page buttons keep them: "search=ravi&status=&from=&to="
    const filterQuery = 'search=' + encodeURIComponent(query.search || '') +
        '&status=' + (query.status || '') +
        '&from=' + (query.from || '') +
        '&to=' + (query.to || '');

    res.render('admin/orders', {
        active: 'orders',
        result,
        filters: query, // to fill the form back in with what was searched
        filterQuery,
        statusLabels: adminOrderService.statusLabels, // for the status dropdown
    });
}


module.exports = { showLogin, loggingIn, loggingOut, showDashboard, showOrders };
