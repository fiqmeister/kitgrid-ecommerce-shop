// admin products: SQL for the products list (Part A). The add / edit form is added in Part B
// unlike productDal, these queries include INACTIVE products: the admin sees everything

const pool = require('../db/database');

// builds the filter pieces for the products list
// WHERE checks one product row at a time (name, category)
// HAVING checks the GROUP of variants after they are added up (stock alerts)
function buildAdminProductFilterSql(filters) {
    let whereSql = '';
    let havingSql = '';
    const params = [];

    if (filters.search) {
        whereSql += ' AND products.name LIKE ?';
        params.push('%' + filters.search + '%');
    }
    if (filters.categoryId) {
        whereSql += ' AND products.category_id = ?';
        params.push(filters.categoryId);
    }

    // stock filter: no ? needed, the numbers come from the table itself
    if (filters.stock === 'out') {
        // at least one variant has 0 left
        havingSql = ' HAVING MIN(product_variants.stock) = 0';
    } else if (filters.stock === 'low') {
        // at least one variant is at or below its own threshold
        havingSql = ' HAVING MIN(product_variants.stock - product_variants.low_stock_threshold) <= 0';
    }

    return { whereSql: whereSql, havingSql: havingSql, params: params };
}

// the shared part of the list query: one row per product, with its variants added up
// findProducts adds ORDER BY + LIMIT to it; countProducts uses it as it is
function buildProductListSql(filter) {
    return `SELECT products.id, products.name, products.base_price, products.is_bulk_eligible,
    products.is_active, products.created_at, categories.name AS category_name,
    SUM(product_variants.stock) AS total_units,
    MIN(product_variants.stock) AS lowest_stock,
    MIN(product_variants.stock - product_variants.low_stock_threshold) AS lowest_margin
    FROM products
    JOIN categories ON categories.id = products.category_id
    LEFT JOIN product_variants ON product_variants.product_id = products.id
    WHERE 1 = 1` + filter.whereSql +
    ` GROUP BY products.id, products.name, products.base_price, products.is_bulk_eligible,
    products.is_active, products.created_at, categories.name` + filter.havingSql;
}

// one page of products, newest first
async function findProducts(filters, limit, offset) {
    const filter = buildAdminProductFilterSql(filters);
    const sql = buildProductListSql(filter) +
        ` ORDER BY products.created_at DESC, products.id DESC
        LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, filter.params.concat([limit, offset]));
    return rows;
}

// how many products match the filters (for "24 products" and the page buttons)
// runs the same grouped query without LIMIT and counts the rows that come back
async function countProducts(filters) {
    const filter = buildAdminProductFilterSql(filters);
    const [rows] = await pool.query(buildProductListSql(filter), filter.params);
    return rows.length;
}

// every category, for the Category dropdown (and the product form in Part B)
async function findCategories() {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    return rows;
}

// Deactivate (0) or Activate (1) a product. Returns false if no product has that id
async function setActive(productId, isActive) {
    const [result] = await pool.query(
        'UPDATE products SET is_active = ? WHERE id = ?',
        [isActive, productId]
    );
    return result.affectedRows > 0;
}
// ---------- Part B: the Add / Edit product form ----------

// one product's own columns, for filling in the Edit form (active or not)
async function findProductById(productId) {
    const [rows] = await pool.query(
        `SELECT id, name, description, base_price, is_bulk_eligible, is_active,
        pitch_surface, material, weight_grams, skill_level, durability_rating, category_id
        FROM products
        WHERE id = ?`,
        [productId]
    );
    return rows[0]; // undefined when there is no such product
}

// that product's variants, in the order they were added
async function findVariantsForProduct(productId) {
    const [rows] = await pool.query(
        `SELECT id, size, colour, sku, age_group, stock, low_stock_threshold
        FROM product_variants
        WHERE product_id = ?
        ORDER BY id`,
        [productId]
    );
    return rows;
}

// the ids of the tags this product has, so the right boxes are ticked
async function findTagIdsForProduct(productId) {
    const [rows] = await pool.query(
        'SELECT tag_id FROM product_tags WHERE product_id = ?',
        [productId]
    );
    return rows.map(row => row.tag_id);
}

// every tag, for the checkboxes
async function findTags() {
    const [rows] = await pool.query('SELECT id, name FROM tags ORDER BY name');
    return rows;
}

// any variants (of ANY product) that already use one of these SKUs, for the "SKU already exists" check
async function findVariantsBySkus(skus) {
    const [rows] = await pool.query(
        'SELECT id, sku FROM product_variants WHERE sku IN (?)',
        [skus]
    );
    return rows;
}

// saves the whole form as ONE transaction: the product, its variants and its tags
// productId null = Add (INSERT a new product), a number = Edit (UPDATE that product)
// returns the product's id, or null when the product (or one of its variants) was not found
async function saveProduct(productId, product, variants, tagIds) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. the product row
        if (productId === null) {
            const [result] = await connection.query(
                `INSERT INTO products (name, description, base_price, is_bulk_eligible, pitch_surface,
                material, weight_grams, skill_level, durability_rating, category_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [product.name, product.description, product.basePrice, product.isBulkEligible, product.pitchSurface,
                product.material, product.weightGrams, product.skillLevel, product.durabilityRating, product.categoryId]
            );
            productId = result.insertId; // the new product's id, needed for its variants and tags
        } else {
            const [result] = await connection.query(
                `UPDATE products
                SET name = ?, description = ?, base_price = ?, is_bulk_eligible = ?, pitch_surface = ?,
                material = ?, weight_grams = ?, skill_level = ?, durability_rating = ?, category_id = ?
                WHERE id = ?`,
                [product.name, product.description, product.basePrice, product.isBulkEligible, product.pitchSurface,
                product.material, product.weightGrams, product.skillLevel, product.durabilityRating, product.categoryId,
                productId]
            );
            if (result.affectedRows === 0) {
                await connection.rollback();
                return null;
            }
        }

        // 2. the variants: rows with an id are updated, rows without one are new
        for (const variant of variants) {
            if (variant.id) {
                // "AND product_id = ?" stops a changed hidden id from editing ANOTHER product's variant
                const [result] = await connection.query(
                    `UPDATE product_variants
                    SET size = ?, colour = ?, sku = ?, age_group = ?, stock = ?, low_stock_threshold = ?
                    WHERE id = ?
                    AND product_id = ?`,
                    [variant.size, variant.colour, variant.sku, variant.ageGroup, variant.stock,
                    variant.lowStockThreshold, variant.id, productId]
                );
                if (result.affectedRows === 0) {
                    await connection.rollback();
                    return null;
                }
            } else {
                await connection.query(
                    `INSERT INTO product_variants (product_id, size, colour, sku, age_group, stock, low_stock_threshold)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [productId, variant.size, variant.colour, variant.sku, variant.ageGroup, variant.stock,
                    variant.lowStockThreshold]
                );
            }
        }

        // 3. the tags: remove the old ticks, then add the ticked ones
        await connection.query('DELETE FROM product_tags WHERE product_id = ?', [productId]);
        for (const tagId of tagIds) {
            await connection.query(
                'INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)',
                [productId, tagId]
            );
        }

        await connection.commit();
        return productId;

    } catch (err) {
        await connection.rollback();
        throw err;

    } finally {
        connection.release();
    }
}
// ---------- nov05: low-stock threshold change (the admin assistant's Confirm button) ----------

// one variant with its product name, for the "Threshold saved" message (undefined if not found)
async function findVariantSummary(variantId) {
    const [rows] = await pool.query(
        `SELECT product_variants.id, products.name AS product_name, product_variants.colour,
        product_variants.size, product_variants.low_stock_threshold
        FROM product_variants
        JOIN products ON products.id = product_variants.product_id
        WHERE product_variants.id = ?`,
        [variantId]
    );
    return rows[0];
}

// saves a new threshold for one variant. Returns false when no variant has this id
async function updateThreshold(variantId, threshold) {
    const [result] = await pool.query(
        'UPDATE product_variants SET low_stock_threshold = ? WHERE id = ?',
        [threshold, variantId]
    );
    return result.affectedRows > 0;
}


module.exports = { findProducts, countProducts, findCategories, setActive,
    findProductById, findVariantsForProduct, findTagIdsForProduct, findTags,
    findVariantsBySkus, saveProduct, findVariantSummary, updateThreshold
 };
