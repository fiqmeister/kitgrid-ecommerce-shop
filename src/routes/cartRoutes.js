const router = require('express').Router();
const cartController = require('../controllers/cartController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { addItemSchema, updateItemSchema, variantIdSchema, mergeCartSchema } = require('../validators/cartValidators');

router.get('/', authenticate, cartController.gettingCart);
router.post('/items', authenticate, validate(addItemSchema), cartController.addingItem);
// 2 validates, one for :variantId, one for the body
router.put('/items/:variantId', authenticate, validate(variantIdSchema, 'params'), validate(updateItemSchema), cartController.updatingItemQuantity);
router.delete('/items/:variantId', authenticate, validate(variantIdSchema, 'params'), cartController.removingItem);
router.post('/merge', authenticate, validate(mergeCartSchema), cartController.mergingCart);
// the guest cart's prices: NO authenticate (guests have no token); nothing is saved
router.post('/quote', validate(mergeCartSchema), cartController.quotingCart);


module.exports = router;
