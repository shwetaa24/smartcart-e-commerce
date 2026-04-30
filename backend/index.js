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
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Seed products if empty
    const productCheck = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, brand, price, original_price, discount, image) VALUES
        ('Premium Leather Wallet', 'Tommy Hilfiger', 1499, 2999, 50, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400'),
        ('Aviator Sunglasses', 'Ray-Ban', 3799, 7599, 50, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400'),
        ('Analog Watch', 'Fossil', 4999, 9999, 50, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400'),
        ('Canvas Backpack', 'Wildcraft', 1299, 2599, 50, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400'),
        ('Wayfarer Sunglasses', 'Oakley', 4299, 8599, 50, 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=400'),
        ('Chronograph Watch', 'Casio', 5999, 11999, 50, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=400'),
        ('Slim Leather Belt', 'Levis', 899, 1799, 50, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=400'),
        ('Crossbody Sling Bag', 'Caprese', 1899, 3799, 50, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400');
      `);
      console.log("Database seeded with products");
    }

    // Seed admin if empty
    const adminCheck = await pool.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO admins (username, email, password_hash) 
        VALUES ('admin', 'admin@swiftcart.com', 'admin123')
      `);
      console.log("Database seeded with default admin");
    }
    
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
      INSERT INTO orders (full_name, email_address, delivery_address, total_bill)
      VALUES ($1, $2, $3, $4) RETURNING *`;

    const result = await pool.query(query, [full_name, email_address, delivery_address, total_bill]);
    res.json({ message: "Order Saved Automatically!", order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// 4. ADMIN: Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// 5. ADMIN: Fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// 6. Products Endpoint
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: "Could not fetch products" });
  }
});

app.get('/', (req, res) => {
  res.send('SwiftCart RDS Backend is live');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});