require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection Configuration
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('amazonaws.com');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        subtotal DECIMAL(10,2),
        tax DECIMAL(10,2),
        total_bill DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        price DECIMAL(10,2),
        original_price DECIMAL(10,2),
        discount INTEGER,
        image TEXT
      );
    `);
    console.log("Database initialized (tables verified)");
  } catch (err) {
    console.error("Error initializing database:", err.message);
  }
};
initDB();

// 2. AUTOMATIC LOGIN/SIGNUP: Save user to DB
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // This query checks if user exists, if not, it inserts them automatically
    const query = `
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2) 
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email 
      RETURNING *`;

    const result = await pool.query(query, [email, password]);
    res.json({ message: "Success", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// 3. AUTOMATIC ORDER: Save bill to DB
app.post('/api/orders', async (req, res) => {
  const { full_name, email_address, delivery_address, total_bill } = req.body;
  try {
    const query = `
      INSERT INTO orders (full_name, email_address, delivery_address, subtotal, tax, total_bill)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

    // Hardcoded subtotal/tax logic for the example based on your screenshot
    const subtotal = 3799.00;
    const tax = 683.82;

    const result = await pool.query(query, [full_name, email_address, delivery_address, subtotal, tax, total_bill]);
    res.json({ message: "Order Saved Automatically!", order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// 4. Products Endpoint
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    // Fallback dummy data if table isn't ready
    res.json([
      { id: 101, name: 'Premium Leather Wallet', brand: 'Tommy Hilfiger', price: 1499, originalPrice: 2999, discount: 50, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400' },
      { id: 102, name: 'Aviator Sunglasses', brand: 'Ray-Ban', price: 3799, originalPrice: 7599, discount: 50, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400' },
      { id: 103, name: 'Analog Watch', brand: 'Fossil', price: 4999, originalPrice: 9999, discount: 50, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
      { id: 104, name: 'Canvas Backpack', brand: 'Wildcraft', price: 1299, originalPrice: 2599, discount: 50, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400' }
    ]);
  }
});

app.get('/', (req, res) => {
  res.send('SwiftCart RDS Backend is live');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});