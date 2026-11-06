// Maps a URL to a controller

const router = require('express').Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/authValidators');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { apiLoginLimiter } = require('../middleware/loginLimiters');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', apiLoginLimiter, validate(loginSchema), authController.login)

router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(refreshSchema), authController.logout);
router.get('/current-user', authenticate, authController.currentUser);

module.exports = router;