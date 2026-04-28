import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function test() {
  try {
    console.log('Testing connection...');
    const result = await sql`SELECT count(*) FROM dishes`;
    console.log('Dishes count:', result[0].count);
    const types = await sql`SELECT count(*) FROM dish_types`;
    console.log('Dish types count:', types[0].count);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
