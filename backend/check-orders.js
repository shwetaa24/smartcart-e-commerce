require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function checkOrderConstraints() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log('Columns in "orders" table:');
    res.rows.forEach(row => console.log(`- ${row.column_name}: Nullable=${row.is_nullable}, Default=${row.column_default}`));
  } catch (err) {
    console.error('Error checking constraints:', err.message);
  } finally {
    await pool.end();
  }
}

checkOrderConstraints();
