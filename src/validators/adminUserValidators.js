// checks the filters on the admin users list

const yup = require('yup');

// users list query string: search, role, page (8 per page)
const adminUserListSchema = yup.object({
    search: yup.string().trim().max(100, 'Search is too long'), // name or email
    // '' is allowed: "All roles" in the dropdown sends role= with nothing after it
    role: yup.string().oneOf(['customer', 'admin', ''], 'Unknown role'),
    page: yup.number().integer().min(1).default(1),
});

module.exports = { adminUserListSchema };
