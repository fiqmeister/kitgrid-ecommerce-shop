const createError = require('../utils/createError');

function validate(schema, source) {
    return async function (req, res, next) {
        try {
            //check the source is body or query
            const input = source === 'query' ? req.query : req.body || {};
            // check the body or query against the rules, and keep the cleaned result
            const cleaned = await schema.validate(input, {
                abortEarly: false,   // report every problem, not just the first
                stripUnknown: true,  // drop any field that is not in the schema
            });

            if (source === 'query') {
                req.cleanQuery = cleaned;// save in a new property
            } else {
                req.body = cleaned;
            }
            next();
        } catch (err) {
            // turn Yup's list of problems into a simple list
            // builds the error to pass to the error handler
            const details = [];
            for (const issue of err.inner) {
                details.push({ field: issue.path, message: issue.message });
            }
            // 
            const error = createError('Validation failed', 400);
            error.details = details;
            next(error);
        }
    };
}

module.exports = validate;