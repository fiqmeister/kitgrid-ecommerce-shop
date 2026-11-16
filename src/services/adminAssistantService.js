// admin assistant: sends the admin's question to the N8N workflow and checks the answer
// all the AI work happens in N8N. This file only passes the question on and makes sure the reply is usable

const callN8n = require('../utils/callN8n');

const unavailable_message = 'The assistant is not available right now. Please try again in a minute.';

// sends the question to N8N and returns { reply, cards, attention, lowStock, proposals }
async function askAssistant(question) {
    // 1. ask N8N; callN8n throws a 503 if N8N is down, refuses the key, or sends no usable answer
    const answer = await callN8n(
        process.env.N8N_ADMIN_WEBHOOK_URL,
        process.env.N8N_ADMIN_WEBHOOK_KEY,
        { message: question },
        'Admin assistant',
        unavailable_message
    );

    // 2. only pass on the parts the page uses; a missing list becomes an empty list
    return {
        reply: answer.reply,
        cards: answer.cards || [],
        attention: answer.attention || [],
        lowStock: answer.lowStock || [],
        proposals: answer.proposals || [],
    };
}

module.exports = { askAssistant };
