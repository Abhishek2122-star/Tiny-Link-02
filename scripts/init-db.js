/**
 * Database Initialization Script
 * Run this script to create the database schema for TinyLink
 * 
 * Usage:
 *   node scripts/init-db.js
 * 
 * Requires DATABASE_URL environment variable to be set
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') 
    ? { rejectUnauthorized: false }
    : false,
});

const schema = `
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(8) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_created_at ON links(created_at DESC);
`;

async function initDb() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    console.log('📋 Creating schema...');
    await client.query(schema);
    
    console.log('✅ Database initialized successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tables created:', result.rows.map(r => r.table_name).join(', '));
    
    client.release();
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
