// Turns every error into JSON response and shows to user
// server errors are saved to log
const fs = require('fs');

function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;
    if (status === 500) {
        console.error(err);
        // one entry
        const entry = new Date().toISOString() + ' ' + req.method + ' ' + req.originalUrl + '\n' + err.stack + '\n\n';
        fs.appendFileSync('logs/error.log', entry); // adds to the end of the file
    }

    const body = {
        error: status === 500 ? 'Something went wrong' : err.message
    };

    if (err.details) {
        body.details = err.details;
    }
    res.status(status).json(body);
}

module.exports = errorHandler;