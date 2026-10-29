// takes the N8N tool requests and sends the results back. No logic or SQL here.

const toolService = require('../services/toolService');

// GET /api/tools/stock/low
async function gettingLowStock(req, res) {
    const result = await toolService.getLowStock();
    res.json(result);
}

module.exports = { gettingLowStock };