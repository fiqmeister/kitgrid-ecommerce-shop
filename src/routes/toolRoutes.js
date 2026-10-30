// N8N tool routes. The API key is checked once for all of them in app.js

const router = require('express').Router();
const toolController = require('../controllers/toolController');
const validate = require('../middleware/validate');
const { orderSummarySchema, variantSearchSchema } = require('../validators/toolValidators');

// T1: get low-stock variants + last 30 days sales + suggested reorder amount
router.get('/stock/low', toolController.gettingLowStock);
// T2: orders summary for a date range (default last 7 days), plus orders that need attention
router.get('/orders/summary', validate(orderSummarySchema, 'query'), toolController.gettingOrderSummary);
// T6: pick list and delivery list (grouped by postal sector) for orders waiting to ship
router.get('/orders/to-ship', toolController.gettingOrdersToShip);
// T3: find a variant and its current threshold (the AI only proposes a change; the admin confirms it)
router.get('/variants', validate(variantSearchSchema, 'query'), toolController.searchingVariants);


module.exports = router;