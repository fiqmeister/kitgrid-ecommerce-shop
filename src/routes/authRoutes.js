// Maps a URL to a controller

const router = require('express').Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema } = require('../validators/authValidators');

router.post('/register', validate(registerSchema), authController.register);

module.exports = router;