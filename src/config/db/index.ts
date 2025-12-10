import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseError, Pool } from 'pg';
import * as schema from './schema/index.schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
pool.on('connect', () => {
  // console.log('🔌 Database connection established successfully.');
});
pool.on('error', (err) => {
  if (err instanceof DatabaseError && err.code === '57P01') return; // Ignore 'admin shutdown' errors

  console.error('🛑 Database connection failed:', err);
  process.exit(1);
});

const db = drizzle({ client: pool, schema });
console.log('🔌 Database connection established successfully.');

export { db, pool };
