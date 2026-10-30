// get the cart, work out the bulk rules for discount
// add, update, remove, and merging cart

const cartDal = require('../dal/cartDal')
const productDal = require('../dal/productDal')
const roundMoney = require('../utils/roundMoney')
const createError = require('../utils/createError')

// get the logged-in user's cart, priced with the bulk rules
async function getCart(userId) {
    const rows = await cartDal.findCart(userId);
    const rules = await productDal.findBulkDiscount();
    return priceCart(rows, rules);
}

// works out the prices for a list of item rows: group by product, bulk discount per product, totals
// shared by the cart and the N8N quote tool, so both always use the same rules
// rows must be sorted by product id (the grouping below relies on it)
function priceCart(rows, rules) {
    // group the rows(items) by product first
    const products = [];
    for (const row of rows) {
        let group = products[products.length - 1];
        if (!group || group.productId !== row.product_id) {
            group = {
                productId: row.product_id,
                name: row.name,
                unitPrice: Number(row.base_price),
                isBulkEligible: row.is_bulk_eligible === 1,
                totalQuantity: 0,
                lines: [],
            };
            products.push(group);
        }
        // push each variant into lines[], which is a grouping for that product
        group.lines.push({
            variantId: row.variant_id,
            sku: row.sku,
            size: row.size,
            colour: row.colour,
            ageGroup: row.age_group,
            stock: row.stock,
            quantity: row.quantity,
        });
        group.totalQuantity += row.quantity;
    }
    
    // bulk discount calculation by tiers for each product(from its total units)
    // also get the whole cart total no. of units(items), subtotal and discount amount
    let cartTotalUnits = 0;
    let cartSubtotalAmt = 0;
    let cartDiscountAmt = 0;

    for (const group of products) {
        let discountPercent = 0;
        let nextTier = null;
        if (group.isBulkEligible) {
            for (const rule of rules) { //sorted lowest tier first
                const percent = Number(rule.discount_percent);
                if (group.totalQuantity >= rule.min_quantity) {
                    // current tier; keeps updating, so it ends on the highest tier
                    // if totalQuantity reaches the highest/last tier, nextTier never gets set, so it stays null
                    // means there is no more higher tier for user to aim for
                    discountPercent = percent;
                } else if (nextTier === null) {
                    // the tier above the current one, not reached yet
                    // will inform user how many units more to reach it
                    nextTier = {
                        minQuantity: rule.min_quantity,
                        discountPercent: percent,
                        unitsNeeded: rule.min_quantity - group.totalQuantity,
                    };
                }
            }
        }
        // line total per size = unit price x quantity, before discount (the "Line total" column in the cart)
        for (const line of group.lines) {
            line.lineTotal = roundMoney(group.unitPrice * line.quantity);
        }

        group.subtotal = roundMoney(group.unitPrice * group.totalQuantity); // all sizes, before discount
        group.discountPercent = discountPercent;
        group.discount = roundMoney(group.subtotal * discountPercent / 100); // one bulk discount for the whole product
        group.total = roundMoney(group.subtotal - group.discount); // the "Product total"

        group.nextTier = nextTier; // set the next tier

        cartTotalUnits += group.totalQuantity; //total no. of units for the whole cart
        cartSubtotalAmt += group.subtotal; //subtotal for the whole cart
        cartDiscountAmt += group.discount; //total discount amount for the whole cart
    }

    return {
        products,
        totalUnits: cartTotalUnits,
        subtotal: roundMoney(cartSubtotalAmt),
        discount: roundMoney(cartDiscountAmt),
        total: roundMoney(cartSubtotalAmt - cartDiscountAmt),
    };

}

// add item to the cart, if item already there, just add the quantity
async function addItem(userId, variantId, quantity) {
    // check the variant item by variantId
    const variant = await cartDal.findVariant(variantId);
    if (!variant) {
        throw createError('Product not found', 404);
    }
    // check the current and new quantity, throw error if more than stock qty
    const currentQuantity = await cartDal.findQuantity(userId, variantId);
    const newQuantity = currentQuantity + quantity;
    if (newQuantity > variant.stock) {
        throw createError('Only ' + variant.stock + ' qty in stock!', 400);
    }
    // save item and newQuantity
    await cartDal.saveItemQuantity(userId, variantId, newQuantity);
    return getCart(userId); // after saving newly added item and quantity, then return updated data
}

async function updateItemQuantity(userId, variantId, quantity) {
    // if user set 0, remove item
    if (quantity === 0) {
        return removeItem(userId, variantId);
    }

    const currentQuantity = await cartDal.findQuantity(userId, variantId);
    if (currentQuantity === 0) {
        throw createError('Item is not in your cart', 404);
    }

    const variant = await cartDal.findVariant(variantId);
    if (!variant) {
        throw createError('Product not found', 404);
    }
    if (quantity > variant.stock) {
        throw createError('Only ' + variant.stock + ' qty in stock!', 400);
    }
    // save newQuantity of the item
    await cartDal.saveItemQuantity(userId, variantId, quantity);
    return getCart(userId);

}

async function removeItem(userId, variantId) {
    const removed = await cartDal.removeItem(userId, variantId);
    if (removed === 0) {
        throw createError('Item is not in your cart', 404);
    }
    return getCart(userId);
}
// the guest cart after login, add each item
async function mergeCart(userId, items) {
    for (const item of items) {
        const variant = await cartDal.findVariant(item.variantId);// calling this able to get variant stock
        if (variant) {
            const currentQuantity = await cartDal.findQuantity(userId, item.variantId);// calling this able to get quantity from the db cart
            // the account may already have this item in the db cart (from an earlier login), or 0 if not
            // then add the quantity from guest cart on top (merge)
            let newQuantity = currentQuantity + item.quantity;// qty in db cart_items + qty in guest cart
            if (newQuantity > variant.stock) {
                newQuantity = variant.stock; // capped at the stock quantity
            }
            if (newQuantity > currentQuantity) {// only save if the quantity goes up: skips out-of-stock items and items with no change
                // if newQuantity < currentQuantity (in db), skip it, cart keeps the currentQuantity
                // merge is to only add guest items, final stock check at checkout
                // or let React warn customer
                await cartDal.saveItemQuantity(userId, item.variantId, newQuantity);
            }
        }
    }
    return getCart(userId);
}

module.exports = { getCart, priceCart, addItem, updateItemQuantity, removeItem, mergeCart };