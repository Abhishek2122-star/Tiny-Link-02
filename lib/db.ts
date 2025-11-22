import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('DB Error:', error);
    throw error;
  }
}
