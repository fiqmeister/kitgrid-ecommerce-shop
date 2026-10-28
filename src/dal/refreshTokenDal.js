const pool = require('../db/database');
// INSERT refresh token hash with expiry time 
async function createRT({ userId, tokenHash, expiresAt }) {
    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [userId, tokenHash, expiresAt]
    );
}
// Check if the given token hash is valid
async function findValidToken(tokenHash) {
    const [rows] = await pool.query(
        `SELECT id, user_id FROM refresh_tokens WHERE token_hash = ? AND is_revoked = 0 AND expires_at > NOW()`,
        [tokenHash]
    );
    return rows[0];
}
// UPDATE to blacklist the row from the given token hash
async function revoke(tokenHash) {
    await pool.query(
        `UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?`,
        [tokenHash]
    );
}

module.exports = { createRT, findValidToken, revoke };