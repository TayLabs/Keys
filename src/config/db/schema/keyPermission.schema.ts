import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import type { UUID } from 'node:crypto';
import { keyTable } from './key.schema';
import { permissionTable } from './permission.schema';

export const keyPermissionTable = pgTable('key_permissions', {
	id: uuid('id').$type<UUID>().primaryKey().defaultRandom(),
	keyId: uuid('key_id')
		.$type<UUID>()
		.references(() => keyTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	permissionId: uuid('permission_id')
		.$type<UUID>()
		.references(() => permissionTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
});
