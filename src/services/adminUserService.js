// admin users: works out the users list page

const adminUserDal = require('../dal/adminUserDal');

const page_size = 8; // rows per page, the same as the orders list

// the words shown on the role badges and in the role dropdown
const roleLabels = {
    customer: 'Customer',
    admin: 'Admin',
};

// users list: one page of users, plus the numbers for "Showing 1 to 8 of 31"
async function listUsers(query) {
    const filters = {
        search: query.search,
        role: query.role,
    };

    const offset = (query.page - 1) * page_size;
    const rows = await adminUserDal.findUsers(filters, page_size, offset);
    const total = await adminUserDal.countUsers(filters);

    // tidy each row for the page
    const users = rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        roleLabel: roleLabels[row.role],
        teamName: row.team_name, // null when the user has no team
        orderCount: Number(row.order_count),
        joinedAt: row.created_at,
    }));

    return {
        users,
        page: query.page,
        total,
        totalPages: Math.ceil(total / page_size),
        firstShown: total === 0 ? 0 : offset + 1,
        lastShown: offset + users.length,
    };
}

module.exports = { listUsers, roleLabels };
