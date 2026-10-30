// SQL for the N8N tools (/api/tools). Read-only reports for the admin assistant and Kit Advisor.

const pool = require('../db/database');

// T1: variants at or below their own low-stock threshold (active products only)
async function findLowStock() {
    const [rows] = await pool.query(
        `SELECT product_variants.id, products.name AS product_name, product_variants.sku,
        product_variants.colour, product_variants.size, product_variants.stock,
        product_variants.low_stock_threshold
        FROM product_variants
        JOIN products ON products.id = product_variants.product_id
        WHERE products.is_active = 1
        AND product_variants.stock <= product_variants.low_stock_threshold
        ORDER BY product_variants.stock, products.name`
    );
    return rows;
}
// T1: item lines of these variants, from orders placed since a date (cancelled orders left out)
// the service adds these up into "units sold in the last 30 days"
async function findSoldItems(variantIds, sinceDate) {
    if (variantIds.length === 0) {
        return []; // no low-stock variants, nothing to look up
    }
    const [rows] = await pool.query(
        `SELECT order_items.variant_id, order_items.quantity
        FROM order_items
        JOIN orders ON orders.id = order_items.order_id
        WHERE order_items.variant_id IN (?)
        AND orders.status <> 'cancelled'
        AND orders.created_at >= ?`,
        [variantIds, sinceDate]
    );
    return rows;
}
// T2: how many orders, and their money total, for each status, placed between two dates
async function countOrdersByStatus(fromDate, toDate) {
    const [rows] = await pool.query(
        `SELECT status, COUNT(*) AS order_count, SUM(total) AS total_amount
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY status`,
        [fromDate, toDate]
    );
    return rows;
}
// T2: orders that need admin's action: waiting to be shipped (paid, processing) or waiting for payment
// not limited by date: an order from last month that still hasn't shipped needs attention too
async function findOrdersNeedAttn() {
    const [rows] = await pool.query(
        `SELECT id, status, total, created_at
        FROM orders
        WHERE status IN ('pending_payment', 'paid', 'processing')
        ORDER BY created_at`
    );
    return rows;
}
// T6: Pick List. Every item in orders waiting to ship, added up per variant across all those orders
async function findPickList() {
    const [rows] = await pool.query(
        `SELECT order_items.variant_id, product_variants.sku, order_items.product_name,
        order_items.colour, order_items.size, SUM(order_items.quantity) AS total_quantity
        FROM order_items
        JOIN orders ON orders.id = order_items.order_id
        JOIN product_variants ON product_variants.id = order_items.variant_id
        WHERE orders.status IN ('paid', 'processing')
        GROUP BY order_items.variant_id, product_variants.sku, order_items.product_name,
        order_items.colour, order_items.size
        ORDER BY order_items.product_name, order_items.variant_id`
    );
    return rows;
}
// T6: Delivery List. Orders waiting to ship with who and where to deliver, oldest first
async function findOrdersToShip() {
    const [rows] = await pool.query(
        `SELECT id, status, recipient_name, phone, address_line1, unit_number,
        address_line2, postal_code, created_at
        FROM orders
        WHERE status IN ('paid', 'processing')
        ORDER BY created_at`
    );
    return rows;
}

module.exports = { findLowStock, findSoldItems, countOrdersByStatus, findOrdersNeedAttn, findPickList, findOrdersToShip};