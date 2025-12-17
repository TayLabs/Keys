import fetchPermissions from '@/config/taylab/fetchPermissions';
import { db } from '..';
import {
	serviceTable,
	permissionTable,
	servicePermissionTable,
} from '../schema/index.schema';
import prod from './prod.data';

export default async function seed(options?: { includeTestData: boolean }) {
	try {
		console.log(await fetchPermissions());

		await db.transaction(async (tx) => {
			// insert service, roles, and permissions
			await tx.insert(serviceTable).values(prod.services).onConflictDoNothing();
			await tx
				.insert(permissionTable)
				.values(prod.permissions)
				.returning()
				.onConflictDoNothing();

			for (const permission of prod.permissions) {
				const services = prod.services.filter((service) =>
					permission.services.includes(service.name)
				);

				for (const service of services) {
					await tx
						.insert(servicePermissionTable)
						.values({
							serviceId: service.id,
							permissionId: permission.id,
						})
						.onConflictDoNothing();
				}
			}
		});

		console.log('🌱 Seed data inserted');
	} catch (err) {
		console.error(err);
	}
}
