const router = require('express').Router();
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { checkoutSchema, orderListSchema, orderIdSchema } = require('../validators/orderValidators');

// for checkout, is for logged-in users only, delivery details need to be checked first
router.post('/', authenticate, validate(checkoutSchema), orderController.creatingOrder);
// order history: logged-in users only, check search/status/sort/page/limit first
router.get('/', authenticate, validate(orderListSchema, 'query'), orderController.listingOrders);
// order details: the id in the URL must be a positive whole number
router.get('/:id', authenticate, validate(orderIdSchema, 'params'), orderController.gettingOrder);

module.exports = router;