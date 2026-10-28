const router = require('express').Router();
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { checkoutSchema } = require('../validators/orderValidators');
// orderIdSchema not needed here, as there is not a need here
// it will be use for order_history and order_detail

// for checkout, is for logged-in users only, delivery details need to be checked first
router.post('/', authenticate, validate(checkoutSchema), orderController.creatingOrder);

module.exports = router;