const pool = require('../db/database');

async function createRT ({ userId, tokenHash, expiresAt}) {
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, tokenHash, expiresAt]
    );
}

module.exports = { createRT };