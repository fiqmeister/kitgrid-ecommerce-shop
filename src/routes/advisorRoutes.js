const router = require('express').Router();
const advisorController = require('../controllers/advisorController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { advisorSchema } = require('../validators/advisorValidators');

// Kit Advisor: logged-in customers only (protects the free AI quota), message and mode checked first
router.post('/', authenticate, validate(advisorSchema), advisorController.askingAdvisor);

module.exports = router;
