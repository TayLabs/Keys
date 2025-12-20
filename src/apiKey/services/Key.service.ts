import { randomBytes, type UUID } from 'node:crypto';
import { hashAsync, verifyAsync } from '../utils/hash.util';
import { keyTable } from '@/config/db/schema/key.schema';
import { db } from '@/config/db';
import { and, DrizzleQueryError, eq, or } from 'drizzle-orm';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import parseTTL from '@/apiKey/utils/parseTTL.utils';
import env from '@/types/env';
import { DatabaseError } from 'pg';
import type { Key as KeyType } from '../interfaces/Key.interface';
import { getTableColumns } from 'drizzle-orm';
import { keyPermissionTable } from '@/config/db/schema/keyPermission.schema';
import { permissionTable } from '@/config/db/schema/permission.schema';

const { keyHash: _keyHashColumn, ...keyColumns } = getTableColumns(keyTable);

export default class Key {
	private _serviceId: UUID;
	private _keyId?: UUID;

	constructor(serviceId: UUID, keyId?: UUID) {
		this._serviceId = serviceId;
		this._keyId = keyId;
	}

	public async getAll(): Promise<KeyType[]> {
		const results = await db
			.select(keyColumns)
			.from(keyTable)
			.where(eq(keyTable.serviceId, this._serviceId));

		return results;
	}

	public async create({
		name,
		permissions,
	}: {
		name: string;
		permissions: UUID[];
	}): Promise<{
		key: string;
		keyRecord: KeyType;
	}> {
		try {
			const key = randomBytes(32).toString('hex'); // len: 64
			const keyHash = await hashAsync(key);

			const keyRecord = (
				await db
					.insert(keyTable)
					.values({
						serviceId: this._serviceId,
						name,
						keyHash,
						keyLastFour: key.substring(key.length - 4),
						expiresAt: new Date(
							Date.now() + parseTTL(env.API_KEY_TTL).milliseconds
						),
					})
					.returning(keyColumns)
			)[0];

			await db.insert(keyPermissionTable).values(
				permissions.map((permission) => ({
					permissionId: permission,
					keyId: keyRecord.id,
				}))
			);

			return {
				key,
				keyRecord,
			};
		} catch (err) {
			if (
				err instanceof DrizzleQueryError &&
				err.cause instanceof DatabaseError
			) {
				switch (err.cause.code) {
					// case '23505': // unique_violation
					// 	throw new Error('Unique violation', ); // Should occur as .onConflictUpdate exist
					case '23503': // Foreign key violation
						throw new AppError('Invalid Service Id', HttpStatus.BAD_REQUEST);
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

	public async update({ name }: { name: string }): Promise<KeyType> {
		const result = (
			await db
				.update(keyTable)
				.set({ name })
				.where(
					and(
						eq(keyTable.serviceId, this._serviceId),
						eq(keyTable.id, this._keyId!)
					)
				)
				.returning(keyColumns)
		)[0];

		// Could loop over and redo permissions, but it's better security practice not to allow a token's permissions to change once created

		return result;
	}

	public async verify({
		key,
		scopes,
	}: {
		key: string;
		scopes: string[];
	}): Promise<KeyType> {
		const keyRecords = await db
			.select(getTableColumns(keyTable))
			.from(keyTable);

		const permissions = await db
			.select({
				key: permissionTable.key,
				keyId: keyPermissionTable.keyId,
			})
			.from(permissionTable)
			.innerJoin(
				keyPermissionTable,
				eq(permissionTable.id, keyPermissionTable.permissionId)
			)
			.where(
				or(...keyRecords.map((key) => eq(keyPermissionTable.keyId, key.id)))
			);

		for (const keyRecord of keyRecords) {
			if (keyRecord.expiresAt >= new Date()) {
				if (await verifyAsync(keyRecord.keyHash, key)) {
					const filtered = permissions.filter(
						(permission) => permission.keyId === keyRecord.id
					);

					// Check if the key has permissions attached within the scopes passed in via the request
					if (filtered.reduce((_, val) => scopes.includes(val.key), false)) {
						delete (keyRecord as any).keyHash;
						return keyRecord;
					}
				}
			}
		}

		throw new AppError('Invalid api key', HttpStatus.BAD_REQUEST);
	}

	public async remove(): Promise<Pick<typeof keyTable.$inferSelect, 'id'>> {
		if (!this._keyId) {
			throw new AppError('Please specify a key id', HttpStatus.BAD_REQUEST);
		}

		const result = (
			await db.delete(keyTable).where(eq(keyTable.id, this._keyId)).returning({
				id: keyTable.id,
			})
		)[0];

		return result;
	}
}
