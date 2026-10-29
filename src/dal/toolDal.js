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

module.exports = { findLowStock, findSoldItems };