// checks the query strings that N8N sends to the tool routes

const yup = require('yup');

// a date like 2026-10-29 (year-month-day), as MariaDB stores it
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// T2: orders summary. Both dates optional; the service uses the last 7 days if left out
const orderSummarySchema = yup.object({
    from: yup.string().trim().matches(datePattern, 'from must be a date like 2026-10-22'),
    to: yup.string().trim().matches(datePattern, 'to must be a date like 2026-10-29'),
});
// T3: find variants by product name/SKU, colour and size. All optional, but the service needs at least one
const variantSearchSchema = yup.object({
    search: yup.string().trim().max(100, 'search is too long'),
    colour: yup.string().trim().max(30, 'colour is too long'),
    size: yup.string().trim().max(20, 'size is too long'),
});
// T4: Kit Advisor product search. All optional; with no filters it returns the first 10 products in stock
const productSearchSchema = yup.object({
    search: yup.string().trim().max(100, 'search is too long'),
    category: yup.string().trim().max(50, 'category is too long'),
    ageGroup: yup.string().oneOf(['mini_junior', 'youth', 'senior'], 'ageGroup must be mini_junior, youth or senior'),
    size: yup.string().trim().max(20, 'size is too long'),
    colour: yup.string().trim().max(30, 'colour is too long'),
    maxPrice: yup.number().typeError('maxPrice must be a number').min(0, 'maxPrice cannot be negative'),
});

module.exports = { orderSummarySchema, variantSearchSchema, productSearchSchema };