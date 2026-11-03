// admin users: SQL for the users list
// read-only: the admin can look at users but not change them

const pool = require('../db/database');

// builds the extra " AND ..." pieces for the users list filters
// search: part of a name OR part of an email
function buildAdminUserFilterSql(filters) {
    let sql = '';
    const params = [];

    if (filters.search) {
        // the brackets matter: without them, the OR would ignore the role filter below
        sql += ' AND (users.name LIKE ? OR users.email LIKE ?)';
        params.push('%' + filters.search + '%');
        params.push('%' + filters.search + '%');
    }
    if (filters.role) {
        sql += ' AND users.role = ?';
        params.push(filters.role);
    }

    return { sql: sql, params: params };
}

// one page of users, newest first, with team name (if any) and how many orders they placed
async function findUsers(filters, limit, offset) {
    const filter = buildAdminUserFilterSql(filters);

    const sql =
    `SELECT users.id, users.name, users.email, users.role, users.created_at,
    team_profiles.team_name,
    COUNT(orders.id) AS order_count
    FROM users
    LEFT JOIN team_profiles ON team_profiles.user_id = users.id
    LEFT JOIN orders ON orders.user_id = users.id
    WHERE 1 = 1` + filter.sql +
    ` GROUP BY users.id, users.name, users.email, users.role, users.created_at, team_profiles.team_name
    ORDER BY users.created_at DESC, users.id DESC
    LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, filter.params.concat([limit, offset]));
    return rows;
}

// how many users match the filters (for "31 users" and the page buttons)
async function countUsers(filters) {
    const filter = buildAdminUserFilterSql(filters);

    const sql =
    `SELECT COUNT(*) AS total
    FROM users
    WHERE 1 = 1` + filter.sql;

    const [rows] = await pool.query(sql, filter.params);
    return rows[0].total;
}

module.exports = { findUsers, countUsers };
