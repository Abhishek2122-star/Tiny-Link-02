// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// export async function query(text: string, params?: any[]) {
//   try {
//     return await pool.query(text, params);
//   } catch (error) {
//     console.error('DB Error:', error);
//     throw error;
//   }
// }


import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export { pool };
