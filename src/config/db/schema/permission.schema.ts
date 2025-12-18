import { unique, varchar } from 'drizzle-orm/pg-core';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { UUID } from 'node:crypto';
import { serviceTable } from './service.schema';
import { text } from 'drizzle-orm/pg-core';

export const permissionTable = pgTable(
	'permissions',
	{
		id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
		serviceId: uuid('service_id')
			.$type<UUID>()
			.references(() => serviceTable.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			})
			.notNull(),
		key: varchar('key', { length: 128 }).notNull(),
		description: text('description'),
	},
	(table) => [
		unique('service_key_unique_constraint').on(table.serviceId, table.key),
	]
);
