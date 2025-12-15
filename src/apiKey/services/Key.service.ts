import { randomBytes, type UUID } from 'node:crypto';
import { hashAsync, verifyAsync } from '../utils/hash.util';
import { keyTable } from '@/config/db/schema/key.schema';
import { db } from '@/config/db';
import { eq } from 'drizzle-orm';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import parseTTL from '@/apiKey/utils/parseTTL.utils';
import env from '@/types/env';

export default class Key {
	private _serviceId: UUID;
	private _keyId?: UUID;

	constructor(serviceId: UUID, keyId?: UUID) {
		this._serviceId = serviceId;
		this._keyId = keyId;
	}

	public async create(): Promise<{
		key: string;
		keyRecord: typeof keyTable.$inferSelect;
	}> {
		const key = randomBytes(32).toString('hex'); // len: 64
		const keyHash = await hashAsync(key);

		const keyRecord = (
			await db
				.insert(keyTable)
				.values({
					serviceId: this._serviceId,
					keyHash,
					keyLastFour: key.substring(key.length - 4),
					expiresAt: new Date(
						Date.now() + parseTTL(env.API_KEY_TTL).milliseconds
					),
				})
				.returning()
		)[0];

		return {
			key,
			keyRecord,
		};
	}

	public async verify(key: string): Promise<boolean> {
		const keyRecords = await db.select().from(keyTable);

		for (const keyRecord of keyRecords) {
			if (keyRecord.expiresAt >= new Date()) {
				if (await verifyAsync(keyRecord.keyHash, key)) {
					return true;
				}
			} else {
				await db.delete(keyTable).where(eq(keyTable.id, keyRecord.id)); // delete expired key
			}
		}

		return false;
	}

	public async remove(): Promise<typeof keyTable.$inferSelect> {
		if (!this._keyId) {
			throw new AppError('Please specify a key id', HttpStatus.BAD_REQUEST);
		}

		const result = (
			await db.delete(keyTable).where(eq(keyTable.id, this._keyId)).returning()
		)[0];

		return result;
	}
}
