const pool = require('../db/database');

// one variant with its stock, if does not exist it will be undefined or product is deactivated
async function findVariant(variantId) {
    const [rows] = await pool.query(
        `SELECT product_variants.id, product_variants.stock
        FROM product_variants
        JOIN products ON products.id = product_variants.product_id
        WHERE product_variants.id = ?
        AND products.is_active = 1`,
        [variantId]
    );
    return rows[0];
}
// how many of this variant the user already has in the cart; 0 if none
async function findQuantity(userId, variantId) {
    const [rows] = await pool.query(
        `SELECT quantity
        FROM cart_items
        WHERE user_id = ?
        AND variant_id = ?`,
        [userId, variantId]
    );
    if (rows.length === 0) {
        return 0;
    }
    return rows[0].quantity;
}

// update by DELETE old row(if any), then INSERT a new one
// if adding a new item, DELETE find no matching rows but isn't an error('delete 0 rows'), is a valid SQL result
async function saveItemQuantity(userId, variantId, quantity) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query(
            `DELETE FROM cart_items
            WHERE user_id = ?
            AND variant_id = ?`,
            [userId, variantId]
        )
        
        await connection.query(
            `INSERT INTO cart_items (user_id, variant_id, quantity)
            VALUES (?, ?, ?)`,
            [userId, variantId, quantity]
        )

        await connection.commit();

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
// return the rows that were deleted; 1 if it was in the cart, 0 if not
async function removeItem(userId, variantId) {
    // naming convention: delete return result object
    const [result] = await pool.query(
        `DELETE FROM cart_items
        WHERE user_id = ?
        AND variant_id = ?`,
        [userId, variantId]
    );
    return result.affectedRows;
}

// get the cart items from userId, with product and variant details to display
async function findCart(userId) {
    const [rows] = await pool.query(
        `SELECT cart_items.variant_id, cart_items.quantity, product_variants.sku,
        product_variants.size, product_variants.colour, product_variants.age_group,
        product_variants.stock, products.name, products.base_price, products.is_bulk_eligible,
        products.id AS product_id
        FROM cart_items
        JOIN product_variants ON product_variants.id = cart_items.variant_id
        JOIN products ON products.id = product_variants.product_id
        WHERE cart_items.user_id = ?
        ORDER BY products.id, product_variants.id`,// this ORDER BY matters when used in cartService
        [userId]
    );
    return rows;
}

module.exports = { findVariant, findQuantity, saveItemQuantity, removeItem, findCart };