const pool = require('../db/database');

// only these fixed texts are ever added after ORDER BY, never anything typed by the user
const SORTS = {
    newest: 'products.created_at DESC',
    price_asc: 'products.base_price ASC',
    price_desc: 'products.base_price DESC',
};

// builds the extra " AND ..." pieces, one for each filter the customer chose
function buildFilterSql(filters) {
    let sql = '';
    const params = [];

    if (filters.search) {
        sql += ' AND products.name LIKE ?';
        params.push('%' + filters.search + '%');
    }
    if (filters.categoryId) {
        sql += ' AND products.category_id = ?';
        params.push(filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
        sql += ' AND products.base_price >= ?';
        params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        sql += ' AND products.base_price <= ?';
        params.push(filters.maxPrice);
    }
    if (filters.pitchSurface) {
        sql += ' AND products.pitch_surface = ?';
        params.push(filters.pitchSurface);
    }
    if (filters.skillLevel) {
        sql += ' AND products.skill_level = ?';
        params.push(filters.skillLevel);
    }
    if (filters.ageGroup) {
        sql += ' AND products.id IN (SELECT product_id FROM product_variants WHERE age_group = ?)';
        params.push(filters.ageGroup);
    }
    if (filters.colours.length > 0) {
        sql += ' AND products.id IN (SELECT product_id FROM product_variants WHERE colour IN (?))';
        params.push(filters.colours);
    }
    if (filters.tag) {
        sql += ' AND products.id IN (SELECT product_tags.product_id FROM product_tags JOIN tags ON tags.id = product_tags.tag_id WHERE tags.name = ?)';
        params.push(filters.tag);
    }

    return { sql: sql, params: params };
}
// after the filters building, then pass it accordingly by the filters, sort,
// limit and offset for paging
// if there is no filter, result will show all active products with their category names
async function findAll(filters, sort, limit, offset) {
    const filter = buildFilterSql(filters);

    const sql =
        `SELECT products.id, products.name, products.base_price, products.pitch_surface,
                products.skill_level, products.material, categories.name AS category
         FROM products
         JOIN categories ON categories.id = products.category_id
         WHERE products.is_active = 1` +
        filter.sql +
        ` ORDER BY ` + (SORTS[sort] || SORTS.newest) +
        ` LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, filter.params.concat([limit, offset]));// concat joins arrays together into one array
    return rows;
}

async function count(filters) {
    const filter = buildFilterSql(filters);
    const sql = 
    `SELECT COUNT(*) AS total 
    FROM products 
    WHERE products.is_active = 1` + filter.sql;
    const [rows] = await pool.query(sql, filter.params);
    return rows[0].total;
}
// 1 product with its category name
async function findById(id) {
    const [rows] = await pool.query(
        `SELECT products.id, products.name, products.description, products.base_price, products.pitch_surface,
        products.material, products.weight_grams, products.skill_level, products.durability_rating,
        products.is_bulk_eligible, categories.name AS category
        FROM products
        JOIN categories ON categories.id = products.category_id
        WHERE products.id = ?
        AND products.is_active = 1`,
        [id]
    );
    return rows[0];
}
// find and return size/colour and stock of the product by using product id
async function findVariants(id) {
    const [rows] = await pool.query(
        `SELECT id, sku, size, colour, age_group, stock
        FROM product_variants
        WHERE product_id = ?
        ORDER BY id`,
        [id]
    );
    return rows;

}
// find tag names of the product
async function findTags(id) {
    const [rows] = await pool.query(
        `SELECT tags.name
        FROM product_tags
        JOIN tags ON tags.id = product_tags.tag_id
        WHERE product_tags.product_id = ?`,
        [id]
    );
    return rows;
}
//  bulk discount tiers, lowest first
async function findBulkDiscount() {
    const [rows] = await pool.query(
        `SELECT min_quantity, discount_percent
        FROM bulk_discount_rules
        ORDER BY min_quantity ASC`
    );
    return rows;
}
module.exports = { findAll, count, findById, findVariants, findTags, findBulkDiscount };