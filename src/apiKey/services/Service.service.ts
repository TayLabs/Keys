import { type UUID } from 'node:crypto';
import { keyTable } from '@/config/db/schema/key.schema';
import { db } from '@/config/db';
import { eq } from 'drizzle-orm';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import { Service as ServiceType } from '../interfaces/Service.interface';
import { permissionTable, serviceTable } from '@/config/db/schema/index.schema';

export default class Service {
	private _serviceId: UUID;

	constructor(serviceId: UUID) {
		this._serviceId = serviceId;
	}

	public static async getAll(): Promise<ServiceType[]> {
		const result = await db.select().from(serviceTable);

		return result;
	}

	public async get(): Promise<ServiceType> {
		const result = (
			await db
				.select()
				.from(serviceTable)
				.where(eq(serviceTable.id, this._serviceId))
		)[0];

		return result;
	}

	public static async register({
		service,
		permissions,
	}: {
		service: string;
		permissions: { key: string; description: string; scopes: string[] }[];
	}): Promise<ServiceType> {
		const filteredPermissions = permissions.filter((permission) =>
			permission.scopes.includes('api-key')
		);

		let serviceRecord: typeof serviceTable.$inferSelect;
		await db.transaction(async (tx) => {
			// insert service, roles, and permissions
			serviceRecord = (
				await tx.insert(serviceTable).values({ name: service }).returning()
			)[0];

			if (filteredPermissions && filteredPermissions.length > 0) {
				await tx
					.insert(permissionTable)
					.values(
						filteredPermissions.map((permission) => ({
							...permission,
							serviceId: serviceRecord.id,
						}))
					)
					.onConflictDoNothing();
			}
		});

		return serviceRecord!;
	}

	public async remove(): Promise<Pick<ServiceType, 'id'>> {
		if (!this._serviceId) {
			throw new AppError('Please specify a service id', HttpStatus.BAD_REQUEST);
		}

		const result = (
			await db
				.delete(serviceTable)
				.where(eq(serviceTable.id, this._serviceId))
				.returning({
					id: serviceTable.id,
				})
		)[0];

		return result;
	}
}
