const orderService = require('../services/orderService');

async function creatingOrder(req, res) {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order); //201 Created: a new order row was created, the same as register.
}
// GET /api/orders: order history, one page
async function listingOrders(req, res) {
    const result = await orderService.listOrders(req.user.id, req.cleanQuery);
    res.json(result);
}

// GET /api/orders/:id: one order's details
async function gettingOrder(req, res) {
    const order = await orderService.getOrder(req.user.id, req.cleanParams.id);
    res.json(order);
}

module.exports = { creatingOrder, listingOrders, gettingOrder };