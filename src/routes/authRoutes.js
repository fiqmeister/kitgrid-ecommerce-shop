// Maps a URL to a controller

const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

module.exports = router;