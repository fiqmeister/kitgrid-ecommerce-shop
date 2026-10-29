// N8N tool routes. The API key is checked once for all of them in app.js

const router = require('express').Router();
const toolController = require('../controllers/toolController');

// T1: get low-stock variants + last 30 days sales + suggested reorder amount
router.get('/stock/low', toolController.gettingLowStock);

module.exports = router;