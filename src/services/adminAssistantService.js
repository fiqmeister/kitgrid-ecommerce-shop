// admin assistant: sends the admin's question to the N8N workflow and checks the answer
// all the AI work happens in N8N. This file only passes the question on and makes sure the reply is usable

const createError = require('../utils/createError');

const wait_seconds = 90; // the most we wait for N8N (Gemini + 2 or 3 tools usually take 5 to 15 seconds)
const unavailable_message = 'The assistant is not available right now. Please try again in a minute.';

// sends the question to N8N and returns { reply, cards, attention, lowStock, proposals }
async function askAssistant(question) {
    // 1. call N8N (Express is the client here, N8N is the server)
    let response;
    try {
        response = await fetch(process.env.N8N_ADMIN_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-key': process.env.N8N_ADMIN_WEBHOOK_KEY, // N8N refuses the call without it (403)
            },
            body: JSON.stringify({ message: question }), // N8N reads it as body.message
            signal: AbortSignal.timeout(wait_seconds * 1000), // give up after 90 seconds
        });
    } catch (err) {
        // fetch itself failed: N8N is not running, the address is wrong, or it took too long
        console.error('Admin assistant: could not reach N8N:', err.message);
        throw createError(unavailable_message, 503);
    }

    // 2. N8N answered, but with an error code (403 wrong key, 404 workflow not published, 500 ...)
    // fetch does NOT throw for these, so we check ourselves
    if (!response.ok) {
        console.error('Admin assistant: N8N answered with status', response.status);
        throw createError(unavailable_message, 503);
    }

    // 3. a failed workflow can still answer 200 with an EMPTY body,
    // so read the body as text first, then turn it into an object
    const text = await response.text();
    let answer;
    try {
        answer = JSON.parse(text);
    } catch (err) {
        console.error('Admin assistant: N8N sent no JSON (did the AI Agent fail? check Executions)');
        throw createError(unavailable_message, 503);
    }

    // 4. the page needs a reply at the very least
    if (!answer || !answer.reply) {
        console.error('Admin assistant: the answer has no reply');
        throw createError(unavailable_message, 503);
    }

    // 5. only pass on the parts the page uses; a missing list becomes an empty list
    return {
        reply: answer.reply,
        cards: answer.cards || [],
        attention: answer.attention || [],
        lowStock: answer.lowStock || [],
        proposals: answer.proposals || [],
    };
}

module.exports = { askAssistant };
