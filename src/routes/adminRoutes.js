// admin EJS pages. Mounted at /admin in app.js; every page except login needs the admin cookie

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdminCookie');

// login page and form (open to everyone, otherwise no one could log in)
router.get('/login', adminController.showLogin);
router.post('/login', adminController.loggingIn);
// sign out (POST form in the header)
router.post('/logout', adminController.loggingOut);
// dashboard (admins only)
router.get('/', requireAdmin, adminController.showDashboard);

module.exports = router;