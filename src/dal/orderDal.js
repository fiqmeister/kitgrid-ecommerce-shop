const pool = require('../db/database');

// only these fixed texts are ever added after ORDER BY, never anything typed by the user
// need id when 2 orders have same created_at time
const SORTS = {
    newest: 'orders.created_at DESC, orders.id DESC',
    oldest: 'orders.created_at ASC, orders.id ASC',
};
// builds the extra " AND ..." pieces for the search order history filter
// filter by order status, search: order number or product name
function buildOrderFilterSql(filters) {
    let sql = '';
    const params = [];

    if (filters.status) {
        sql += ' AND orders.status = ?';
        params.push(filters.status);
    }
    if (filters.search) {
        if (filters.orderNumber) {
            // number: match the order number or product name that contains it, number in a product name
            // Eg: 'Pro 3 Jersey'
            sql += ' AND (orders.id = ? OR orders.id IN (SELECT order_id FROM order_items WHERE product_name LIKE ?))';
            params.push(filters.orderNumber, '%' + filters.search + '%');
        } else {
            // text: orders that contain a product with this name
            sql += ' AND orders.id IN (SELECT order_id FROM order_items WHERE product_name LIKE ?)';
            params.push('%' + filters.search + '%');
        }
    }

    return { sql: sql, params: params };
}

// one function to run the whole checkout process as 1 transaction
// order: is the totals + delivery details
// items: is the cart lines (with price snapshot) worked out by service

// if 0 means stock not enough, stop and rollback the transaction, return null
// return the new order Id when whole transaction is successful
async function createOrder(userId, order, items) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        //create the order itself, status default already set as pending_payment in db
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, subtotal, discount_total, delivery_fee, total,
            recipient_name, phone, address_line1, unit_number, address_line2, postal_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, order.subtotal, order.discountTotal, order.deliveryFee, order.total,
                order.recipientName, order.recipientPhoneNum, order.addressLine1, order.unitNumber,
                order.addressLine2, order.postalCode
            ]
        );
        const orderId = orderResult.insertId;
        // create the order Id, which will be needed for order_items and order_status_history

        for (const item of items) {
            // find the rows if conditions are true: the right variantId and enough stock
            const [stockResult] = await connection.query(
                `UPDATE product_variants
                SET stock = stock - ?
                WHERE id = ?
                AND stock >= ?`,
                [item.quantity, item.variantId, item.quantity]
            );

            if (stockResult.affectedRows === 0) {
                await connection.rollback();
                return null;
            }
            // the price snapshot, so later price change never alter this order
            await connection.query(
                `INSERT INTO order_items (order_id, variant_id, quantity, unit_price, discount_percent,
                line_total, product_name, size, colour)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.variantId, item.quantity, item.unitPrice,
                    item.discountPercent, item.lineTotal, item.productName, item.size, item.colour]
            );
        }
        // create the order status history row, which is changed_by customer since it's a new order
        // from the customer's cart
        await connection.query(
            `INSERT INTO order_status_history (order_id, changed_by, status)
            VALUES (?, ?, 'pending_payment')`,
            [orderId, userId]
        );
        // cart has become an order, so empty the cart
        await connection.query(
            `DELETE FROM cart_items
            WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();
        return orderId;

    } catch (err) {
        await connection.rollback();
        throw err;

    } finally {
        connection.release();
    }
}
// one page of customer's orders (history list)
async function findOrders(userId, filters, sort, limit, offset) {
    const filter = buildOrderFilterSql(filters);

    const sql = 
    `SELECT id, status, total, created_at
    FROM orders
    WHERE user_id = ?` + filter.sql +
    ` ORDER BY ` + (SORTS[sort] || SORTS.newest) +
    ` LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, [userId].concat(filter.params, [limit, offset]));
    return rows;
}
// total no. of orders matching the filters (this is for paging)
async function countOrders(userId, filters) {
    const filter = buildOrderFilterSql(filters);

    const sql =
    `SELECT COUNT(*) AS total
    FROM orders
    WHERE user_id = ?` + filter.sql;

    const [rows] = await pool.query(sql, [userId].concat(filter.params));
    return rows[0].total;
}

// summary of item lines (product name, qty), Eg: "Matchday Jersey x 12, Training Bib x 6"
// by passing 1 or more OrderIds, use IN(?) to pass the array of orderIds in
async function findItemsByOrderIds(orderIds) {
    if (orderIds.length === 0) {
        return []; // empty list will have SQL error, so if there is no orderId, just return
    }
    const [rows] = await pool.query(
        `SELECT order_id, product_name, quantity
        FROM order_items
        WHERE order_id IN (?)
        ORDER BY order_id, id`,
        [orderIds]
    );
    return rows;
}

//find one order by orderId, and belongs to this user, this is for order details page
async function findOrderById(userId, orderId) {
    const [rows] = await pool.query(
        `SELECT id, status, subtotal, discount_total, delivery_fee, total, recipient_name, 
        phone, address_line1, unit_number, address_line2, postal_code, created_at
        FROM orders
        WHERE id = ?
        AND user_id = ?`,
        [orderId, userId]
    );
    return rows[0];
}
// details of the snapshot items from order_items, since already in the order
// plus product id and age group JOIN from variant
async function findOrderItems(orderId) {
    const [rows] = await pool.query(
        `SELECT order_items.variant_id, order_items.quantity, order_items.unit_price,
        order_items.discount_percent, order_items.line_total, order_items.product_name,
        order_items.size, order_items.colour, product_variants.age_group, product_variants.product_id
        FROM order_items
        JOIN product_variants ON product_variants.id = order_items.variant_id
        WHERE order_items.order_id = ?
        ORDER BY product_variants.product_id, order_items.id`,
        [orderId]
    );
    return rows;
}
// status changes of one order(orderId) - for the progress timeline
async function findStatusHistory(orderId) {
    const [rows] = await pool.query(
        `SELECT status, changed_at
        FROM order_status_history
        WHERE order_id = ?
        ORDER BY changed_at, id`,
        [orderId] 
    );
    return rows;
}

module.exports = { createOrder, findOrders, countOrders, findItemsByOrderIds, findOrderById,
    findOrderItems, findStatusHistory};
