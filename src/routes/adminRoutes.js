// admin EJS pages. Mounted at /admin in app.js; every page except login needs the admin cookie

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdminCookie');
const validate = require('../middleware/validate');
const { adminOrderListSchema, statusChangeSchema  } = require('../validators/adminOrderValidators');
const { orderIdSchema } = require('../validators/orderValidators');
const { adminUserListSchema } = require('../validators/adminUserValidators');


// login page and form (open to everyone, otherwise no one could log in)
router.get('/login', adminController.showLogin);
router.post('/login', adminController.loggingIn);
// sign out (POST form in the header)
router.post('/logout', adminController.loggingOut);
// dashboard (admins only)
router.get('/', requireAdmin, adminController.showDashboard);
// orders list (admins only), with search / status / date filters and paging
router.get('/orders', requireAdmin, validate(adminOrderListSchema, 'query'), adminController.showOrders);

// one order's detail page (admins only)
router.get('/orders/:id', requireAdmin, validate(orderIdSchema, 'params'), adminController.showOrder);
// "Update status" form (paid → processing → shipped → delivered, or cancel)
router.post('/orders/:id/status', requireAdmin, validate(orderIdSchema, 'params'), validate(statusChangeSchema), adminController.updatingStatus);
// "Mark as paid" button
router.post('/orders/:id/paid', requireAdmin, validate(orderIdSchema, 'params'), adminController.markingPaid);
// users list (admins only, read-only), with search / role filters and paging
router.get('/users', requireAdmin, validate(adminUserListSchema, 'query'), adminController.showUsers);

module.exports = router;