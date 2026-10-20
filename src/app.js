const express = require('express');
const cors = require('cors');
const pool = require('./db/database');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL })); //only allows this address to make requests
app.use(express.json());

// temporary check: delete once the first real route works
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) AS products FROM products');
        res.json({ status: 'ok', products: rows[0].products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error' });
    }
});

module.exports = app;