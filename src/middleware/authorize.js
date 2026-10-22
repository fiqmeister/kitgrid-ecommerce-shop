// checks whether user allowed to be in a certain route

const createError = require('../utils/createError');

function authorize (role) {
    return function (req, res, next) {
        if (!req.user || req.user.role !== role) {
            throw createError('You do not have permission to do this', 403);
        }
        next();
    }
}

module.exports = authorize;