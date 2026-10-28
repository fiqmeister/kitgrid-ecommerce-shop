const orderService = require('../services/orderService');

async function creatingOrder(req, res) {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order); //201 Created: a new order row was created, the same as register.
}

module.exports = { creatingOrder };