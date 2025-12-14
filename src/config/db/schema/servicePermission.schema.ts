import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { UUID } from 'node:crypto';

export const servicePermissionTable = pgTable('service_permission', {
	id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
	serviceId: uuid('service_id').$type<UUID>().notNull(),
	permissionId: uuid('permission_id').$type<UUID>().notNull(),
});
