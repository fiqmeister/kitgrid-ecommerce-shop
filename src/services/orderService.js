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

    return {
        orderId,
        status: 'pending_payment',
        subtotal: order.subtotal,
        discount: order.discountTotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
    }
}

module.exports = { createOrder };