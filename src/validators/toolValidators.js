// checks the query strings that N8N sends to the tool routes

const yup = require('yup');

// a date like 2026-10-29 (year-month-day), as MariaDB stores it
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// T2: orders summary. Both dates optional; the service uses the last 7 days if left out
const orderSummarySchema = yup.object({
    from: yup.string().trim().matches(datePattern, 'from must be a date like 2026-10-22'),
    to: yup.string().trim().matches(datePattern, 'to must be a date like 2026-10-29'),
});

module.exports = { orderSummarySchema };