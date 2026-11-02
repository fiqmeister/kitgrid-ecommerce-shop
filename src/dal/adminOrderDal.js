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
// one order with its customer (name, email) and team name (if any), for the order detail page
// any customer's order: the admin is not limited to their own
async function findOrderById(orderId) {
    const [rows] = await pool.query(
        `SELECT orders.id, orders.status, orders.subtotal, orders.discount_total, orders.delivery_fee,
        orders.total, orders.recipient_name, orders.phone, orders.address_line1, orders.unit_number,
        orders.address_line2, orders.postal_code, orders.created_at,
        users.name AS customer_name, users.email AS customer_email, team_profiles.team_name
        FROM orders
        JOIN users ON users.id = orders.user_id
        LEFT JOIN team_profiles ON team_profiles.user_id = users.id
        WHERE orders.id = ?`,
        [orderId]
    );
    return rows[0]; // undefined when there is no such order
}

// status history, newest first, with the role of whoever made each change
// changed_by is NULL for the payment step (Stripe), so LEFT JOIN keeps that row
async function findStatusHistory(orderId) {
    const [rows] = await pool.query(
        `SELECT order_status_history.status, order_status_history.changed_at, users.role AS changed_by_role
        FROM order_status_history
        LEFT JOIN users ON users.id = order_status_history.changed_by
        WHERE order_status_history.order_id = ?
        ORDER BY order_status_history.changed_at DESC, order_status_history.id DESC`,
        [orderId]
    );
    return rows;
}

// change an order's status as one transaction: the order, the stock (when cancelling) and the history row
// fromStatus: the status the service saw. If the order has changed since (another click/tab), nothing happens
// returns true when changed, false when the order was no longer in fromStatus
async function changeStatus(orderId, fromStatus, toStatus, adminId, addStockBack) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // only changes the row if it is still in the status we expect
        const [result] = await connection.query(
            `UPDATE orders
            SET status = ?
            WHERE id = ?
            AND status = ?`,
            [toStatus, orderId, fromStatus]
        );
        if (result.affectedRows === 0) {
            await connection.rollback();
            return false;
        }

        // cancelling: put every item's quantity back into stock
        if (addStockBack) {
            const [items] = await connection.query(
                `SELECT variant_id, quantity
                FROM order_items
                WHERE order_id = ?`,
                [orderId]
            );
            for (const item of items) {
                await connection.query(
                    `UPDATE product_variants
                    SET stock = stock + ?
                    WHERE id = ?`,
                    [item.quantity, item.variant_id]
                );
            }
        }

        // record who changed it and when (changed_at defaults to NOW() in the table)
        await connection.query(
            `INSERT INTO order_status_history (order_id, changed_by, status)
            VALUES (?, ?, ?)`,
            [orderId, adminId, toStatus]
        );

        await connection.commit();
        return true;

    } catch (err) {
        await connection.rollback();
        throw err;

    } finally {
        connection.release();
    }
}

module.exports = { findOrders, countOrders, findOrderById, findStatusHistory, changeStatus };
