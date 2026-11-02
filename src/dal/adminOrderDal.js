// admin orders: SQL for the orders list (Part A). Detail and status changes are added in Part B
// unlike orderDal, these queries are NOT limited to one user: the admin sees every order

const pool = require('../db/database');

// builds the extra " AND ..." pieces for the admin orders list filters
// search: an order number (exact) or part of a customer name
function buildAdminOrderFilterSql(filters) {
    let sql = '';
    const params = [];

    if (filters.orderNumber) {
        sql += ' AND orders.id = ?';
        params.push(filters.orderNumber);
    } else if (filters.search) {
        sql += ' AND users.name LIKE ?';
        params.push('%' + filters.search + '%');
    }
    if (filters.status) {
        sql += ' AND orders.status = ?';
        params.push(filters.status);
    }
    if (filters.from) {
        sql += ' AND DATE(orders.created_at) >= ?';
        params.push(filters.from);
    }
    if (filters.to) {
        sql += ' AND DATE(orders.created_at) <= ?';
        params.push(filters.to);
    }

    return { sql: sql, params: params };
}

// one page of orders, newest first, with customer name, team name (if any) and total units
async function findOrders(filters, limit, offset) {
    const filter = buildAdminOrderFilterSql(filters);

    const sql =
    `SELECT orders.id, orders.status, orders.total, orders.created_at,
    users.name AS customer_name, team_profiles.team_name,
    SUM(order_items.quantity) AS total_units
    FROM orders
    JOIN users ON users.id = orders.user_id
    LEFT JOIN team_profiles ON team_profiles.user_id = users.id
    JOIN order_items ON order_items.order_id = orders.id
    WHERE 1 = 1` + filter.sql +
    ` GROUP BY orders.id, orders.status, orders.total, orders.created_at, users.name, team_profiles.team_name
    ORDER BY orders.created_at DESC, orders.id DESC
    LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, filter.params.concat([limit, offset]));
    return rows;
}

// how many orders match the filters (for "43 orders" and the page buttons)
async function countOrders(filters) {
    const filter = buildAdminOrderFilterSql(filters);

    const sql =
    `SELECT COUNT(*) AS total
    FROM orders
    JOIN users ON users.id = orders.user_id
    WHERE 1 = 1` + filter.sql;

    const [rows] = await pool.query(sql, filter.params);
    return rows[0].total;
}

module.exports = { findOrders, countOrders };
