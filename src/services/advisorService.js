// Kit Advisor: sends the customer's message to the N8N workflow, then re-checks the AI's suggestion
// the AI only proposes items. The prices and stock the customer sees always come from our own quote

const callN8n = require('../utils/callN8n');
const userDal = require('../dal/userDal');
const toolService = require('./toolService');
const { quoteSchema } = require('../validators/toolValidators');

const unavailable_message = 'The Kit Advisor is not available right now. Please try again in a minute.';
const unchecked_message = 'Sorry, I could not check that kit against live stock. Please try asking again.';

// returns { reply, suggestion }. suggestion is null when the AI only answered with words
async function askAdvisor(userId, message, mode) {
    // 1. the customer's name, so the AI can greet them (the access token only holds id and role)
    const user = await userDal.findById(userId);
    const customerName = user ? user.name : '';

    // 2. ask N8N; callN8n throws a 503 if N8N is down, refuses the key, or sends no usable answer
    const answer = await callN8n(
        process.env.N8N_ADVISOR_WEBHOOK_URL,
        process.env.N8N_ADVISOR_WEBHOOK_KEY,
        { message, mode, customerName },
        'Kit Advisor',
        unavailable_message
    );

    // 3. no items: a question back, a refusal, or nothing fits the budget. Just the words
    if (!answer.items || answer.items.length === 0) {
        return { reply: answer.reply, suggestion: null };
    }

    // 4. the AI's list must follow the same rules as adding to the cart (whole numbers, 1 to 1000, at most 50 lines)
    let items;
    try {
        const checked = await quoteSchema.validate({ items: answer.items }, { stripUnknown: true });
        items = checked.items;
    } catch (err) {
        console.error('Kit Advisor: the AI sent items in the wrong shape');
        return { reply: unchecked_message, suggestion: null };
    }

    // 5. price it again ourselves. A made-up variant (404) or a size that sold out meanwhile drops the suggestion,
    // so the customer is never shown a price or a kit we cannot sell
    let quote;
    try {
        quote = await toolService.getQuote(items);
    } catch (err) {
        if (err.statusCode === 404) {
            console.error('Kit Advisor: the AI suggested a variant that does not exist');
            return { reply: unchecked_message, suggestion: null };
        }
        throw err; // a real problem (for example the database is down): the error handler sends 500
    }
    if (!quote.allInStock) {
        console.error('Kit Advisor: the suggestion asks for more than is in stock');
        return { reply: unchecked_message, suggestion: null };
    }

    // 6. the reply from the AI, the numbers from our quote
    return {
        reply: answer.reply,
        suggestion: {
            title: answer.title || 'Kit suggestion', // the AI often leaves the title out
            items,                            // [{ variantId, quantity }] for "Add all to cart"
            products: quote.products,                // each product with its lines, bulk discount and total
            totalUnits: quote.totalUnits,
            subtotal: quote.subtotal,
            discount: quote.discount,
            deliveryFee: quote.deliveryFee,
            total: quote.total,
        },
    };
}

module.exports = { askAdvisor };
