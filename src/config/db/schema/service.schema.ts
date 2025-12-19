import { boolean, uuid } from 'drizzle-orm/pg-core';
import { varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { UUID } from 'node:crypto';

export const serviceTable = pgTable('services', {
	id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
	name: varchar('name', { length: 128 }).notNull().unique(),
	isExternal: boolean('is_external').notNull().default(false),
});
