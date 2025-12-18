import { randomBytes, type UUID } from 'node:crypto';
import { hashAsync, verifyAsync } from '../utils/hash.util';
import { keyTable } from '@/config/db/schema/key.schema';
import { db } from '@/config/db';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import parseTTL from '@/apiKey/utils/parseTTL.utils';
import env from '@/types/env';
import { DatabaseError } from 'pg';

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
    try {
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
