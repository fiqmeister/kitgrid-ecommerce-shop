const pool = require('../db/database');

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
            WHERE user_id =?`,
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

module.exports = { createOrder };
