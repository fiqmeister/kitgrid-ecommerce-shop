const router = require('express').Router();
const productController = require('../controllers/productController');
const validate = require('../middleware/validate');
const { productListSchema, productIdSchema } = require('../validators/productValidators');

router.get('/', validate(productListSchema, 'query'), productController.list);
router.get('/:id', validate(productIdSchema, 'params'), productController.getOneProduct);

module.exports = router;