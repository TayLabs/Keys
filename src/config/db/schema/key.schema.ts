import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { UUID } from 'node:crypto';

export const keyTable = pgTable('keys', {
	id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
	keyHash: varchar('key_hash', { length: 512 }).notNull(),
	keyLastFour: varchar('key_last_four', { length: 4 }).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});
