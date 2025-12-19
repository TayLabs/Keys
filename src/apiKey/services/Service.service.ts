import { type UUID } from 'node:crypto';
import { keyTable } from '@/config/db/schema/key.schema';
import { db } from '@/config/db';
import { and, DrizzleQueryError, eq, or } from 'drizzle-orm';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import { Service as ServiceType } from '../interfaces/Service.interface';
import { permissionTable, serviceTable } from '@/config/db/schema/index.schema';
import { DatabaseError } from 'pg';

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
		try {
			const filteredPermissions = permissions.filter((permission) =>
				permission.scopes.includes('api-key')
			);

			let serviceRecord: typeof serviceTable.$inferSelect;
			await db.transaction(async (tx) => {
				// insert service, roles, and permissions
				serviceRecord = (
					await tx
						.insert(serviceTable)
						.values({ name: service, isExternal: true })
						.returning()
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
		} catch (err) {
			if (
				err instanceof DrizzleQueryError &&
				err.cause instanceof DatabaseError
			) {
				switch (err.cause.code) {
					case '23505': // unique_violation
						throw new Error('A service with that name already exist'); // Should occur as .onConflictUpdate exist
					case '42P01': // undefined_table
						throw new AppError(
							'Database table not found',
							HttpStatus.INTERNAL_SERVER_ERROR
						);
					default:
						throw err;
				}
			} else {
				throw err;
			}
		}
	}

	public async update({
		service,
		permissions,
	}: {
		service: string;
		permissions: { key: string; description: string; scopes: string[] }[];
	}): Promise<ServiceType> {
		try {
			const filteredPermissions = permissions.filter((permission) =>
				permission.scopes.includes('api-key')
			);

			let serviceRecord: typeof serviceTable.$inferSelect;
			await db.transaction(async (tx) => {
				// insert service, roles, and permissions
				serviceRecord = (
					await tx
						.update(serviceTable)
						.set({ name: service, isExternal: true })
						.where(
							and(
								eq(serviceTable.id, this._serviceId),
								eq(serviceTable.isExternal, true)
							)
						)
						.returning()
				)[0];

				if (!serviceRecord) {
					throw new AppError(
						'Invalid service Id or the service is not external facing',
						HttpStatus.BAD_REQUEST
					);
				}

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

				const allPermissions = await tx
					.select()
					.from(permissionTable)
					.where(eq(permissionTable.serviceId, this._serviceId));

				const oldPermissions = allPermissions.filter(
					(existing) =>
						!permissions.find((permission) => permission.key === existing.key)
				);

				if (oldPermissions.length > 0) {
					await tx
						.delete(permissionTable)
						.where(
							or(
								...oldPermissions.map((permission) =>
									eq(permissionTable.id, permission.id)
								)
							)
						);
				}
			});

			return serviceRecord!;
		} catch (err) {
			if (
				err instanceof DrizzleQueryError &&
				err.cause instanceof DatabaseError
			) {
				switch (err.cause.code) {
					case '23505': // unique_violation
						throw new Error('A service with that name already exist'); // Should occur as .onConflictUpdate exist
					case '42P01': // undefined_table
						throw new AppError(
							'Database table not found',
							HttpStatus.INTERNAL_SERVER_ERROR
						);
					default:
						throw err;
				}
			} else {
				throw err;
			}
		}
	}

	public async remove(): Promise<Pick<ServiceType, 'id'>> {
		if (!this._serviceId) {
			throw new AppError('Please specify a service id', HttpStatus.BAD_REQUEST);
		}

		const result = (
			await db
				.delete(serviceTable)
				.where(
					and(
						eq(serviceTable.id, this._serviceId),
						eq(serviceTable.isExternal, true)
					)
				)
				.returning({
					id: serviceTable.id,
				})
		)[0];

		if (!result) {
			throw new AppError(
				'Invalid service id or the service is internally populated and cannot be deleted',
				HttpStatus.BAD_REQUEST
			);
		}

		return result;
	}
}
