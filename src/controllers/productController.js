const productService = require('../services/productService');
// list of products
async function list(req, res) {
    const result = await productService.listProducts(req.cleanQuery);
    res.json(result);
}
// detail of 1 selected product
async function getOneProduct(req ,res) {
    const product = await productService.getProduct(req.cleanParams.id);
    res.json(product);
}

module.exports = { list, getOneProduct };