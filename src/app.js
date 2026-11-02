const express = require('express');
const cors = require('cors');
const pool = require('./db/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const toolRoutes = require('./routes/toolRoutes');
const errorHandler = require('./middleware/errorHandler');
const requireApiKey = require('./middleware/requireApiKey');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/adminRoutes');


const app = express();
// EJS pages for the admin side
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(cors({ origin: process.env.CLIENT_URL })); //only allows this address to make requests
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // reads HTML form posts into req.body
app.use(cookieParser()); // reads cookies into req.cookies
app.use(express.static('./src/rss')); // serves admin.css at /admin.css

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tools', requireApiKey, toolRoutes); // middleware use here means ALL tool route gets checked and protected
// admin route
app.use('/admin', adminRoutes);


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

app.use(errorHandler);

module.exports = app;