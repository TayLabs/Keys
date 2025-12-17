import fetchPermissions from '@/config/db/utils/fetchPermissions';
import { db } from '..';
import { serviceTable, permissionTable } from '../schema/index.schema';

export default async function seed() {
	try {
		const config = await fetchPermissions();

		await db.transaction(async (tx) => {
			// insert service, roles, and permissions
			await tx
				.insert(serviceTable)
				.values(
					config.map((repo) => ({
						name: repo.service,
					}))
				)
				.onConflictDoNothing();

			const services = await tx.select().from(serviceTable);

			for (const service of services) {
				const repo = config.find((repo) => repo.service === service.name);

				if (repo) {
					await tx
						.insert(permissionTable)
						.values(
							repo?.permissions.map((permission) => ({
								...permission,
								serviceId: service.id,
							}))
						)
						.onConflictDoNothing();
				}
			}
		});

		console.log('🌱 Seed data inserted');
	} catch (err) {
		console.error(err);
	}
}
