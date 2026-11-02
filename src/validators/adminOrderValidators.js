// checks the filters on the admin orders list, and the status change form on the order detail page

const yup = require('yup');

// a date like 2026-10-29 (year-month-day), what <input type="date"> sends
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const statuses = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

// orders list query string: search, status, date range, page (8 per page)
const adminOrderListSchema = yup.object({
    search: yup.string().trim().max(100, 'Search is too long'), // order number or customer name, worked out in service
    // '' is allowed: "All statuses" in the dropdown sends status= with nothing after it
    status: yup.string().oneOf(statuses.concat(['']), 'Unknown status'),
    from: yup.string().trim().matches(datePattern, { message: 'From must be a date like 2026-10-01', excludeEmptyString: true }),
    to: yup.string().trim().matches(datePattern, { message: 'To must be a date like 2026-10-19', excludeEmptyString: true }),
    page: yup.number().integer().min(1).default(1),
});

// "Update status" form on the order detail page
// check whether the change is allowed from the current status
const statusChangeSchema = yup.object({
    status: yup.string().oneOf(statuses, 'Unknown status').required('Choose a status'),
});

module.exports = { adminOrderListSchema, statusChangeSchema };
