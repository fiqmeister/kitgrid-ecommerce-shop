// admin EJS pages. Mounted at /admin in app.js; every page except login needs the admin cookie

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdminCookie');
const validate = require('../middleware/validate');
const { adminOrderListSchema } = require('../validators/adminOrderValidators');


// login page and form (open to everyone, otherwise no one could log in)
router.get('/login', adminController.showLogin);
router.post('/login', adminController.loggingIn);
// sign out (POST form in the header)
router.post('/logout', adminController.loggingOut);
// dashboard (admins only)
router.get('/', requireAdmin, adminController.showDashboard);
// orders list (admins only), with search / status / date filters and paging
router.get('/orders', requireAdmin, validate(adminOrderListSchema, 'query'), adminController.showOrders);


module.exports = router;