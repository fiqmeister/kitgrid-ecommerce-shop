const router = require('express').Router();
const productController = require('../controllers/productController');
const validate = require('../middleware/validate');
const { productListSchema } = require('../validators/productValidators');

router.get('/', validate(productListSchema, 'query'), productController.list);

module.exports = router;