// a helper function that create normal error and attach the HTTP status code
// so the error handler knows what to send back

function createError(message, statusCode) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

module.exports = createError;