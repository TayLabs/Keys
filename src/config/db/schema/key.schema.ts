import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { UUID } from 'node:crypto';
import { serviceTable } from './service.schema';

export const keyTable = pgTable('keys', {
	id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
	serviceId: uuid('service_id')
		.$type<UUID>()
		.references(() => serviceTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),
	keyHash: varchar('key_hash', { length: 512 }).notNull(),
	keyLastFour: varchar('key_last_four', { length: 4 }).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});
