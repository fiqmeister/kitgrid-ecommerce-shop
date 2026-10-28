// Only place to talk with DB. SQL queries

const pool = require('../db/database');

async function findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];// returns the user row, or undefined if no user has this email
}
// user creation will only have 'customer' role since DEFAULT is set as 'customer'
async function create({ name, email, passwordHash }) {
    const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
        [name, email, passwordHash]
    );
    return result.insertId;
}
// return user with selected columns, leaving out the password col
async function findById(id) {
    const [rows] = await pool.query(
        `SELECT id, name, email, role, created_at FROM users WHERE id = ?`,
        [id]
    );
    return rows[0];
}
// export all functions
module.exports = { findByEmail, create, findById };