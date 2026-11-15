// Kit Advisor: sends the customer's message to the N8N workflow, then re-checks the AI's suggestion
// the AI only proposes items. The prices and stock the customer sees always come from our own quote

const createError = require('../utils/createError');
const userDal = require('../dal/userDal');
const toolService = require('./toolService');
const { quoteSchema } = require('../validators/toolValidators');

const wait_seconds = 90; // the most we wait for N8N (the AI + 2 or 3 tools usually take 5 to 15 seconds)
const unavailable_message = 'The Kit Advisor is not available right now. Please try again in a minute.';
const unchecked_message = 'Sorry, I could not check that kit against live stock. Please try asking again.';

// returns { reply, suggestion }. suggestion is null when the AI only answered with words
async function askAdvisor(userId, message, mode) {
    // 1. the customer's name, so the AI can greet them (the access token only holds id and role)
    const user = await userDal.findById(userId);
    const customerName = user ? user.name : '';

    // 2. call N8N (Express is the client here, N8N is the server)
    let response;
    try {
        response = await fetch(process.env.N8N_ADVISOR_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-key': process.env.N8N_ADVISOR_WEBHOOK_KEY, // N8N refuses the call without it (403)
            },
            body: JSON.stringify({ message: message, mode: mode, customerName: customerName }),
            signal: AbortSignal.timeout(wait_seconds * 1000), // give up after 90 seconds
        });
    } catch (err) {
        // fetch itself failed: N8N is not running, the address is wrong, or it took too long
        console.error('Kit Advisor: could not reach N8N:', err.message);
        throw createError(unavailable_message, 503);
    }

    // 3. N8N answered with an error code (403 wrong key, 404 workflow not published, 500 ...)
    // fetch does NOT throw for these, so we check ourselves
    if (!response.ok) {
        console.error('Kit Advisor: N8N answered with status', response.status);
        throw createError(unavailable_message, 503);
    }

    // 4. a failed workflow (for example a Groq rate limit) can still answer 200 with an EMPTY body,
    // so read the body as text first, then turn it into an object
    const text = await response.text();
    let answer;
    try {
        answer = JSON.parse(text);
    } catch (err) {
        console.error('Kit Advisor: N8N sent no JSON (did the AI Agent fail? check Executions)');
        throw createError(unavailable_message, 503);
    }

    // 5. the panel needs a reply at the very least
    if (!answer || !answer.reply) {
        console.error('Kit Advisor: the answer has no reply');
        throw createError(unavailable_message, 503);
    }

    // 6. no items: a question back, a refusal, or nothing fits the budget. Just the words
    if (!answer.items || answer.items.length === 0) {
        return { reply: answer.reply, suggestion: null };
    }

    // 7. the AI's list must follow the same rules as adding to the cart (whole numbers, 1 to 1000, at most 50 lines)
    let items;
    try {
        const checked = await quoteSchema.validate({ items: answer.items }, { stripUnknown: true });
        items = checked.items;
    } catch (err) {
        console.error('Kit Advisor: the AI sent items in the wrong shape');
        return { reply: unchecked_message, suggestion: null };
    }

    // 8. price it again ourselves. A made-up variant (404) or a size that sold out meanwhile drops the suggestion,
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

    // 9. the reply from the AI, the numbers from our quote
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
