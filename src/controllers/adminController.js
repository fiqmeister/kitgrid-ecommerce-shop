// admin dashboard pages (EJS). Renders pages and sets/clears the admin cookie; no SQL here.

const adminAuthService = require('../services/adminAuthService');
const adminOrderService = require('../services/adminOrderService');
const adminUserService = require('../services/adminUserService');
const adminProductService = require('../services/adminProductService');
const { productFormSchema } = require('../validators/adminProductValidators');


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
// GET /admin/products   (filters in the query string, already checked by the validator)
async function showProducts(req, res) {
    const query = req.cleanQuery;
    const result = await adminProductService.listProducts(query);
    const categories = await adminProductService.listCategories();

    // the current filters as text, so the page buttons keep them: "search=ball&category=3&stock=low"
    const filterQuery = 'search=' + encodeURIComponent(query.search || '') +
        '&category=' + (query.category || '') +
        '&stock=' + (query.stock || '');

    res.render('admin/products', {
        active: 'products',
        result,
        filters: query, // to fill the form back in with what was searched
        filterQuery,
        categories, // for the Category dropdown
    });
}

// POST /admin/products/:id/deactivate   (hides it from the shop; nothing is deleted)
async function deactivatingProduct(req, res) {
    await adminProductService.setActive(req.cleanParams.id, false);
    res.redirect('/admin/products');
}

// POST /admin/products/:id/activate   (shows it in the shop again)
async function activatingProduct(req, res) {
    await adminProductService.setActive(req.cleanParams.id, true);
    res.redirect('/admin/products');
}
// shows the Add / Edit product form. Used for the first visit AND after a save went wrong
// productId: null for Add, a number for Edit
// form: the values to fill in (from the database, or what the admin just typed)
// errors: { 'name': 'Name is required', 'variants[2].sku': 'SKU already exists.' } (empty when fine)
async function renderProductForm(res, statusCode, productId, form, errors, message, saved) {
    const options = await adminProductService.getFormOptions();
    res.status(statusCode).render('admin/product-form', {
        active: 'products',
        productId,
        form,
        categories: options.categories,
        tags: options.tags,
        errors,
        message, // the red box at the top, or null
        saved, // true right after a successful save: the green "Product saved." box
    });
}

// GET /admin/products/new
async function showNewProduct(req, res) {
    await renderProductForm(res, 200, null, adminProductService.emptyForm(), {}, null, false);
}

// GET /admin/products/:id/edit   (?saved=1 after a successful save)
async function showEditProduct(req, res) {
    const productId = req.cleanParams.id;
    const form = await adminProductService.getProductForm(productId);
    await renderProductForm(res, 200, productId, form, {}, null, req.query.saved === '1');
}

// shared by Add and Edit: check the form, save it, or show it again with the errors
async function savingProductForm(req, res, productId) {
    const form = req.body;

    // drop the empty variant rows (the 3 blank rows the admin did not fill in)
    const variantRows = form.variants || [];
    form.variants = variantRows.filter(row => row.id || row.size || row.colour || row.sku);

    // 1. Yup check. On problems, show the form again with every message under its box
    let cleaned;
    try {
        cleaned = await productFormSchema.validate(form, { abortEarly: false, stripUnknown: true });
    } catch (err) {
        const errors = {};
        err.inner.forEach(issue => {
            errors[issue.path] = issue.message; // e.g. errors['variants[0].stock'] = 'Stock must be a whole number'
        });
        return renderProductForm(res, 400, productId, form, errors, 'Please fix the highlighted fields.', false);
    }

    // 2. save (the service also checks the SKUs)
    let savedId;
    try {
        savedId = await adminProductService.saveProduct(productId, cleaned);
    } catch (err) {
        if (err.statusCode !== 400 && err.statusCode !== 409) {
            throw err; // 404 or a database problem: the error handler deals with it
        }
        return renderProductForm(res, err.statusCode, productId, cleaned, err.fieldErrors || {}, err.message, false);
    }

    // 3. saved: go to the product's Edit page with a "Product saved." message (Post/Redirect/Get)
    res.redirect('/admin/products/' + savedId + '/edit?saved=1');
}

// POST /admin/products   (the Add form)
async function creatingProduct(req, res) {
    await savingProductForm(req, res, null);
}

// POST /admin/products/:id   (the Edit form)
async function updatingProduct(req, res) {
    await savingProductForm(req, res, req.cleanParams.id);
}



module.exports = { showLogin, loggingIn, loggingOut, showDashboard, showOrders, showOrder, 
    updatingStatus, markingPaid, showUsers, showProducts, deactivatingProduct, activatingProduct,
showNewProduct, showEditProduct, creatingProduct, updatingProduct };
