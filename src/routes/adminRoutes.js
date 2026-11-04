// admin EJS pages. Mounted at /admin in app.js; every page except login needs the admin cookie

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdminCookie');
const validate = require('../middleware/validate');
const { adminOrderListSchema, statusChangeSchema  } = require('../validators/adminOrderValidators');
const { orderIdSchema } = require('../validators/orderValidators');
const { adminUserListSchema } = require('../validators/adminUserValidators');
const { adminProductListSchema } = require('../validators/adminProductValidators');
const { productIdSchema } = require('../validators/productValidators');



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
// products list (admins only), with search / category / stock filters and paging
router.get('/products', requireAdmin, validate(adminProductListSchema, 'query'), adminController.showProducts);
// Deactivate / Activate buttons (nothing is deleted)
router.post('/products/:id/deactivate', requireAdmin, validate(productIdSchema, 'params'), adminController.deactivatingProduct);
router.post('/products/:id/activate', requireAdmin, validate(productIdSchema, 'params'), adminController.activatingProduct);
// Add product: the empty form, and saving it
router.get('/products/new', requireAdmin, adminController.showNewProduct);
router.post('/products', requireAdmin, adminController.creatingProduct);
// Edit product: the filled-in form, and saving it
router.get('/products/:id/edit', requireAdmin, validate(productIdSchema, 'params'), adminController.showEditProduct);
router.post('/products/:id', requireAdmin, validate(productIdSchema, 'params'), adminController.updatingProduct);


module.exports = router;