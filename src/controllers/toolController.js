// takes the N8N tool requests and sends the results back. No logic or SQL here.

const toolService = require('../services/toolService');

// GET /api/tools/stock/low
async function gettingLowStock(req, res) {
    const result = await toolService.getLowStock();
    res.json(result);
}
// GET /api/tools/orders/summary?from=&to=
async function gettingOrderSummary(req, res) {
    const result = await toolService.getOrderSummary(req.cleanQuery);
    res.json(result);
}
// GET /api/tools/orders/to-ship
async function gettingOrdersToShip(req, res) {
    const result = await toolService.getOrdersToShip();
    res.json(result);
}

module.exports = { gettingLowStock, gettingOrderSummary, gettingOrdersToShip };