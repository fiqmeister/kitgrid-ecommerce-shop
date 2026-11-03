// admin dashboard pages (EJS). Renders pages and sets/clears the admin cookie; no SQL here.

const adminAuthService = require('../services/adminAuthService');
const adminOrderService = require('../services/adminOrderService');
const adminUserService = require('../services/adminUserService');

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
// GET /admin/orders/:id
async function showOrder(req, res) {
    const order = await adminOrderService.getOrder(req.cleanParams.id);
    res.render('admin/order-detail', {
        active: 'orders',
        order,
        statusLabels: adminOrderService.statusLabels, // labels for the "Change to" dropdown
        error: null,
    });
}

// when a status change is refused (400 not allowed, 409 changed by someone else), show the detail page again with the message
// anything else (404, database error) goes on to the error handler as usual
async function showOrderWithError(res, orderId, err) {
    if (err.statusCode !== 400 && err.statusCode !== 409) {
        throw err;
    }
    const order = await adminOrderService.getOrder(orderId);
    res.status(err.statusCode).render('admin/order-detail', {
        active: 'orders',
        order,
        statusLabels: adminOrderService.statusLabels,
        error: err.message,
    });
}

// POST /admin/orders/:id/status   (form field: status)
async function updatingStatus(req, res) {
    const orderId = req.cleanParams.id;
    try {
        await adminOrderService.changeStatus(orderId, req.body.status, req.admin.id);
    } catch (err) {
        return showOrderWithError(res, orderId, err);
    }
    res.redirect('/admin/orders/' + orderId);
}

// POST /admin/orders/:id/paid
async function markingPaid(req, res) {
    const orderId = req.cleanParams.id;
    try {
        await adminOrderService.markAsPaid(orderId, req.admin.id);
    } catch (err) {
        return showOrderWithError(res, orderId, err);
    }
    res.redirect('/admin/orders/' + orderId);
}
// GET /admin/users   (filters in the query string, already checked by the validator)
async function showUsers(req, res) {
    const query = req.cleanQuery;
    const result = await adminUserService.listUsers(query);

    // the current filters as text, so the page buttons keep them: "search=ravi&role=customer"
    const filterQuery = 'search=' + encodeURIComponent(query.search || '') +
        '&role=' + (query.role || '');

    res.render('admin/users', {
        active: 'users',
        result,
        filters: query, // to fill the form back in with what was searched
        filterQuery,
        roleLabels: adminUserService.roleLabels, // for the role dropdown
    });
}



module.exports = { showLogin, loggingIn, loggingOut, showDashboard, showOrders, showOrder, 
    updatingStatus, markingPaid, showUsers };
