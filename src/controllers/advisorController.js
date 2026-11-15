const advisorService = require('../services/advisorService');

// POST /api/advisor: one message to the Kit Advisor, one answer back
async function askingAdvisor(req, res) {
    const result = await advisorService.askAdvisor(req.user.id, req.body.message, req.body.mode);
    res.json(result);
}

module.exports = { askingAdvisor };
