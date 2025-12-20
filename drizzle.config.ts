import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle/migrations',
	schema: './src/config/db/schema/index.schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
