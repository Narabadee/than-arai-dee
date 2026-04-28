import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('[DB] Error: DATABASE_URL is missing!');
  throw new Error('DATABASE_URL environment variable is not set.');
}

console.log('[DB] Connecting to:', process.env.DATABASE_URL.split('@')[1]); // Log host only for safety

export const sql = postgres(process.env.DATABASE_URL, { 
  ssl: 'require',
  prepare: false
});
