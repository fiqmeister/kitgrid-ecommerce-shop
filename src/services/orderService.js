// checkout order, to turn the customer's cart into an order
// works out every prices, the client only sends the delivery details

const cartService = require('./cartService');
const cartDal = require('../dal/cartDal');
const orderDal = require('../dal/orderDal');
const createError = require('../utils/createError');
const roundMoney = require('../utils/roundMoney');

const delivery_fee_price = 8; // delivery flat fee price
const free_delivery_units = 15; // 15 or more units/qty in the cart

async function createOrder(userId, delivery) {
    // the cart and bulk discount the customer see
    const cart = await cartService.getCart(userId);
    if (cart.products.length === 0) {
        throw createError('Your cart is empty', 400);
    }

    // check every line again and build the price snapshot for order_items
    const items = [];
    for (const product of cart.products) {
        for (const line of product.lines) {
            const variant = await cartDal.findVariant(line.variantId); // is the product variant still active?
            if (!variant) {
                throw createError(product.name + ' is no longer available. Please remove from your cart', 400);
            }
            if (line.quantity > variant.stock) {
                throw createError('Only ' + variant.stock + ' qty left for ' + product.name + ' (' + line.size + ')', 400);
                // inform customer the stock qty left with the name and size of the variant item
            }
            items.push({
                variantId: line.variantId,
                quantity: line.quantity,
                unitPrice: product.unitPrice,
                discountPercent: product.discountPercent, // the product's current tier, applies to every size
                lineTotal: line.lineTotal, // unit price x quantity, before discount (copied from getCart)
                productName: product.name,
                size: line.size,
                colour: line.colour,

            });
        }
    }
    // delivery fee logic
    let deliveryFee = delivery_fee_price;
    if (cart.totalUnits >= free_delivery_units) {
        deliveryFee = 0;
    }
    // build order details
    const order = {
        subtotal: cart.subtotal,
        discountTotal: cart.discount,
        deliveryFee,
        total: roundMoney(cart.total + deliveryFee),
        recipientName: delivery.recipientName,
        recipientPhoneNum: delivery.recipientPhoneNum,
        addressLine1: delivery.addressLine1,
        unitNumber: delivery.unitNumber || null,
        addressLine2: delivery.addressLine2 || null,
        postalCode: delivery.postalCode,
    };
    // create the new order Id
    const orderId = await orderDal.createOrder(userId, order, items);

    if (orderId === null) { // this occurs when someone bought the stock between the check above and the UPDATE in DAL
        throw createError('Some items just went out of stock. Please check your cart and try again', 409);
    }

    return getOrder(userId, orderId); // the confirmation page shows the full order
}
// order history: one page of the user's orders, each with units and a product summary for its card
async function listOrders(userId, query) {
    // "1042" or "#1042" in the search box counts as an order number
    let orderNumber = null;
    if (query.search) {
        const withoutHash = query.search.replace('#', '');
        if (/^\d+$/.test(withoutHash)) { // only digits
            orderNumber = Number(withoutHash);
        }
    }

    const filters = {
        status: query.status,
        search: query.search,
        orderNumber: orderNumber,
    };

    const offset = (query.page - 1) * query.limit; // limit default is 5, set at orderValidators
    const orders = await orderDal.findOrders(userId, filters, query.sort, query.limit, offset);
    const total = await orderDal.countOrders(userId, filters);

    // the item lines of every order on this page, in one query
    const orderIds = [];
    for (const order of orders) {
        orderIds.push(order.id);
    }
    const itemRows = await orderDal.findItemsByOrderIds(orderIds);

    // build each card: total units, and quantities added up per product name
    const items = [];
    for (const order of orders) {
        const products = [];
        let totalUnits = 0;
        for (const row of itemRows) {
            if (row.order_id === order.id) {
                totalUnits += row.quantity;
                // same product already in the summary (another size)? add to it, otherwise start a new entry
                const existing = products.find(product => product.name === row.product_name);
                if (existing) {
                    existing.quantity += row.quantity;
                } else {
                    products.push({ name: row.product_name, quantity: row.quantity });
                }
            }
        }
        items.push({
            id: order.id,
            status: order.status,
            createdAt: order.created_at,
            total: Number(order.total),
            totalUnits: totalUnits,
            products: products,
        });
    }

    return {
        items: items,
        page: query.page,
        limit: query.limit,
        total: total,
        totalPages: Math.ceil(total / query.limit),
    };
}

// one order with its items grouped by product (like the cart) and its status timeline
async function getOrder(userId, orderId) {
    const order = await orderDal.findOrderById(userId, orderId);
    if (!order) {
        throw createError('Order not found', 404); // also when the order belongs to someone else
    }
    const rows = await orderDal.findOrderItems(orderId);
    const historyRows = await orderDal.findStatusHistory(orderId);

    // group the snapshot lines by product (rows are sorted by product id), same idea as getCart
    const products = [];
    let totalUnits = 0;
    for (const row of rows) {
        let group = products[products.length - 1];
        if (!group || group.productId !== row.product_id) {
            group = {
                productId: row.product_id,
                name: row.product_name,
                discountPercent: Number(row.discount_percent), // the same on every line of this product
                totalQuantity: 0,
                subtotal: 0,
                lines: [],
            };
            products.push(group);
        }
        group.lines.push({
            variantId: row.variant_id,
            size: row.size,
            colour: row.colour,
            ageGroup: row.age_group,
            quantity: row.quantity,
            unitPrice: Number(row.unit_price),
            lineTotal: Number(row.line_total), // before discount, as on the cart page
        });
        group.totalQuantity += row.quantity;
        group.subtotal += Number(row.line_total);
        totalUnits += row.quantity;
    }

    // the "Bulk discount (15% on 18 units)" row and "Product total", from the stored snapshot only
    for (const group of products) {
        group.subtotal = roundMoney(group.subtotal);
        group.discount = roundMoney(group.subtotal * group.discountPercent / 100);
        group.total = roundMoney(group.subtotal - group.discount);
    }

    // the progress timeline
    const history = [];
    for (const row of historyRows) {
        history.push({ status: row.status, changedAt: row.changed_at });
    }

    return {
        id: order.id,
        status: order.status,
        createdAt: order.created_at,
        totalUnits: totalUnits,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount_total),
        deliveryFee: Number(order.delivery_fee),
        total: Number(order.total),
        delivery: {
            recipientName: order.recipient_name,
            phone: order.phone,
            addressLine1: order.address_line1,
            unitNumber: order.unit_number,
            addressLine2: order.address_line2,
            postalCode: order.postal_code,
        },
        products: products,
        history: history,
    };
}


module.exports = { createOrder, listOrders, getOrder };