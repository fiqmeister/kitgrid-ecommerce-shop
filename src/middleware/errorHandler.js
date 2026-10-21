// Turns every error into JSON response and shows to user

function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;
    if (status === 500) console.error(err);

    const body = {
        error: status === 500 ? 'Something went wrong' : err.message
    };

    if (err.details) {
        body.details = err.details;
    }
    res.status(status).json(body);
}

module.exports = errorHandler;