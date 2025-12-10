import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '..';
import path from 'node:path';

export default async function runMigrations() {
  const migrationsFolder = path.join(__dirname, '../migrations');
  await migrate(db, { migrationsFolder });

  console.log('⚒️  Migrations complete');
}
