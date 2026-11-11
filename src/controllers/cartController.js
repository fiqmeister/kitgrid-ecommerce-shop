const toolService = require('../services/toolService');
const roundMoney = require('../utils/roundMoney');
const cartService = require('../services/cartService');

// the logged-in user's cart
async function gettingCart(req, res) {
    const cart = await cartService.getCart(req.user.id);// user.id gotten from authenticate which is from access token payload
    res.json(cart);
}
// add an item, req.body: {variantId, quantity}
async function addingItem(req, res) {
    const cart = await cartService.addItem(req.user.id, req.body.variantId, req.body.quantity);
    res.json(cart);
}

// set the quantity of an item, variantId from the URL, req.body {quantity}
async function updatingItemQuantity(req, res) {
    const cart = await cartService.updateItemQuantity(req.user.id, req.cleanParams.variantId, req.body.quantity);
    res.json(cart);
}

// remove an item, variantId from the URL
async function removingItem(req, res) {
    const cart = await cartService.removeItem(req.user.id, req.cleanParams.variantId);
    res.json(cart);
}

// merge the guest cart after login, req.body {items [{variantId, quantity}]}
async function mergingCart(req, res) {
    const cart = await cartService.mergeCart(req.user.id, req.body.items);
    res.json(cart);
}
// POST /api/cart/quote   body: { items: [{ variantId, quantity }] }   (the guest cart, no login)
// uses the Kit Advisor's quote (same bulk rules as the cart), but sends back the cart fields only:
async function quotingCart(req, res) {
    const quote = await toolService.getQuote(req.body.items);
    res.json({
        products: quote.products,
        totalUnits: quote.totalUnits,
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: roundMoney(quote.subtotal - quote.discount), // the cart total, without delivery
        allInStock: quote.allInStock,       // false when a size asks for more than the stock
        stockProblems: quote.stockProblems, // which sizes, so the cart page can warn the customer
    });
}

module.exports = { gettingCart, addingItem, updatingItemQuantity, removingItem, mergingCart, quotingCart };