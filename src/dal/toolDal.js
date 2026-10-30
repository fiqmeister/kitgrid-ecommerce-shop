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
// T3: find variants by product name or SKU, colour and size, with their current low-stock threshold
// only the filters that were sent are added, same idea as buildFilterSql in productDal
async function findVariants(filters, limit) {
    let sql = `SELECT product_variants.id, products.name AS product_name, product_variants.sku,
        product_variants.colour, product_variants.size, product_variants.stock,
        product_variants.low_stock_threshold
        FROM product_variants
        JOIN products ON products.id = product_variants.product_id
        WHERE products.is_active = 1`;
    const params = [];

    if (filters.search) {
        sql += ' AND (products.name LIKE ? OR product_variants.sku LIKE ?)';
        params.push('%' + filters.search + '%');
        params.push('%' + filters.search + '%');
    }
    if (filters.colour) {
        sql += ' AND product_variants.colour = ?';
        params.push(filters.colour);
    }
    if (filters.size) {
        sql += ' AND product_variants.size = ?';
        params.push(filters.size);
    }

    sql += ' ORDER BY products.name, product_variants.id LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows;
}
// T4: active products for the Kit Advisor, filtered by name, category name and highest unit price
// only the filters that were sent are added, same idea as findVariants
async function findProducts(filters) {
    let sql = `SELECT products.id, products.name, products.description, products.base_price,
        products.is_bulk_eligible, categories.name AS category
        FROM products
        JOIN categories ON categories.id = products.category_id
        WHERE products.is_active = 1`;
    const params = [];

    if (filters.search) {
        sql += ' AND products.name LIKE ?';
        params.push('%' + filters.search + '%');
    }
    if (filters.category) {
        sql += ' AND categories.name LIKE ?';
        params.push('%' + filters.category + '%');
    }
    if (filters.maxPrice !== undefined) {
        sql += ' AND products.base_price <= ?';
        params.push(filters.maxPrice);
    }

    sql += ' ORDER BY products.name';

    const [rows] = await pool.query(sql, params);
    return rows;
}
// T4: the in-stock variants of these products, filtered by age group, size and colour
async function findInStockVariants(productIds, filters) {
    if (productIds.length === 0) {
        return []; // no products matched, nothing to look up
    }
    let sql = `SELECT id, product_id, sku, size, colour, age_group, stock
        FROM product_variants
        WHERE product_id IN (?)
        AND stock > 0`;
    const params = [productIds];

    if (filters.ageGroup) {
        sql += ' AND age_group = ?';
        params.push(filters.ageGroup);
    }
    if (filters.size) {
        sql += ' AND size = ?';
        params.push(filters.size);
    }
    if (filters.colour) {
        sql += ' AND colour = ?';
        params.push(filters.colour);
    }

    sql += ' ORDER BY product_id, id';

    const [rows] = await pool.query(sql, params);
    return rows;
}


module.exports = { findLowStock, findSoldItems, countOrdersByStatus, findOrdersNeedAttn, 
    findPickList, findOrdersToShip, findVariants, findProducts, findInStockVariants};