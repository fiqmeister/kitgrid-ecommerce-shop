// calls an N8N webhook and returns its JSON answer
// shared by the admin assistant and the Kit Advisor: both send a secret header, wait up to 90 seconds,
// and treat "N8N not reachable", "an error code" and "an empty or broken answer" the same way (503)

const createError = require('./createError');

const wait_seconds = 90; // the most we wait for N8N (the AI + 2 or 3 tools usually take 5 to 15 seconds)

// url, key: from .env
// body: the object N8N receives (it reads it as body.message and so on)
// name: who is calling, for the server log ("Admin assistant", "Kit Advisor")
// unavailableMessage: what the admin or customer sees when it fails
async function callN8n(url, key, body, name, unavailableMessage) {
    // 1. call N8N (Express is the client here, N8N is the server)
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-key': key, // N8N refuses the call without it (403)
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(wait_seconds * 1000), // give up after 90 seconds
        });
    } catch (err) {
        // fetch itself failed: N8N is not running, the address is wrong, or it took too long
        console.error(name + ': could not reach N8N:', err.message);
        throw createError(unavailableMessage, 503);
    }

    // 2. N8N answered with an error code (403 wrong key, 404 workflow not published, 500 ...)
    // fetch does NOT throw for these, so we check ourselves
    if (!response.ok) {
        console.error(name + ': N8N answered with status', response.status);
        throw createError(unavailableMessage, 503);
    }

    // 3. a failed workflow (for example a rate limit) can still answer 200 with an EMPTY body,
    // so read the body as text first, then turn it into an object
    const text = await response.text();
    let answer;
    try {
        answer = JSON.parse(text);
    } catch (err) {
        console.error(name + ': N8N sent no JSON (did the AI Agent fail? check Executions)');
        throw createError(unavailableMessage, 503);
    }

    // 4. both assistants need a reply at the very least
    if (!answer || !answer.reply) {
        console.error(name + ': the answer has no reply');
        throw createError(unavailableMessage, 503);
    }

    return answer;
}

module.exports = callN8n;
