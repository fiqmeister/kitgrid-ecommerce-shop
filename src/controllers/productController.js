const productService = require('../services/productService');

async function list(req, res) {
    const result = await productService.listProducts(req.cleanQuery);
    res.json(result);
}

module.exports = { list };