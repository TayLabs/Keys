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
import { serviceTable } from '@/config/db/schema/service.schema';

const { keyHash: _keyHashColumn, ...keyColumns } = getTableColumns(keyTable);

export default class Key {
  private _keyId?: UUID;

  constructor(keyId?: UUID) {
    this._keyId = keyId;
  }

  public async getAll(): Promise<KeyType[]> {
    const keys = await db.select(keyColumns).from(keyTable);

    if (keys.length < 1) return [];

    const permissions = await db
      .select({
        ...getTableColumns(permissionTable),
        keyId: keyPermissionTable.keyId,
      })
      .from(permissionTable)
      .innerJoin(
        keyPermissionTable,
        eq(keyPermissionTable.permissionId, permissionTable.id)
      )
      .where(or(...keys.map((key) => eq(keyPermissionTable.keyId, key.id))));

    return keys.map((key) => ({
      ...key,
      permissions: permissions.filter(
        (permission) => permission.keyId === key.id
      ),
    }));
  }

  public async get(): Promise<KeyType> {
    const key = (
      await db
        .select(keyColumns)
        .from(keyTable)
        .where(eq(keyTable.id, this._keyId!))
    )[0];

    if (!key)
      throw new AppError(
        'Key with that id does not exist',
        HttpStatus.NOT_FOUND
      );

    const permissions = await db
      .select(getTableColumns(permissionTable))
      .from(permissionTable)
      .innerJoin(
        keyPermissionTable,
        eq(permissionTable.id, keyPermissionTable.permissionId)
      )
      .where(eq(keyPermissionTable.keyId, key.id));

    return { ...key, permissions };
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
          case '23505': // unique_violation
            throw new AppError(
              'A key with that name already exist',
              HttpStatus.BAD_REQUEST
            );
          case '23503': // Foreign key violation
            throw new AppError('Invalid Permission Id', HttpStatus.BAD_REQUEST);
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
    name,
    permissions,
  }: {
    name: string;
    permissions: UUID[];
  }): Promise<KeyType> {
    try {
      let result: KeyType;
      await db.transaction(async (tx) => {
        result = (
          await tx
            .update(keyTable)
            .set({ name })
            .where(eq(keyTable.id, this._keyId!))
            .returning()
        )[0] as any;

        if (permissions && permissions.length > 0) {
          await tx
            .insert(keyPermissionTable)
            .values(
              permissions.map((permissionId) => ({
                permissionId,
                keyId: this._keyId!,
              }))
            )
            .onConflictDoNothing();
        }

        const allPermissions = await tx
          .select()
          .from(keyPermissionTable)
          .where(eq(keyPermissionTable.keyId, this._keyId!));

        const oldPermissions = allPermissions.filter(
          (existing) =>
            !permissions?.find(
              (permissionId) => permissionId === existing.permissionId
            )
        );

        if (oldPermissions.length > 0) {
          await tx
            .delete(keyPermissionTable)
            .where(
              or(
                ...oldPermissions.map((permission) =>
                  eq(keyPermissionTable.permissionId, permission.permissionId!)
                )
              )
            );
        }

        result.permissions = await tx
          .select(getTableColumns(permissionTable))
          .from(permissionTable)
          .innerJoin(
            keyPermissionTable,
            eq(keyPermissionTable.permissionId, permissionTable.id)
          )
          .where(eq(keyPermissionTable.keyId, this._keyId!));
      });

      return result!;
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError
      ) {
        switch (err.cause.code) {
          case '23505': // unique_violation
            throw new Error('A key with that name already exist');
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

    for (const keyRecord of keyRecords) {
      if (keyRecord.expiresAt >= new Date()) {
        if (await verifyAsync(keyRecord.keyHash, key)) {
          const permissions = await db
            .selectDistinct({
              service: serviceTable.name,
              key: permissionTable.key,
            })
            .from(permissionTable)
            .leftJoin(
              serviceTable,
              eq(serviceTable.id, permissionTable.serviceId)
            )
            .innerJoin(
              keyPermissionTable,
              eq(permissionTable.id, keyPermissionTable.permissionId)
            )
            .where(eq(keyPermissionTable.keyId, keyRecord.id));

          // Check if the key has permissions matchingi the scopes provided
          console.log(
            permissions.map((perm) => `${perm.service}:${perm.key}`),
            scopes
          );
          if (
            permissions.reduce(
              (_, val) => scopes.includes(`${val.service}:${val.key}`),
              false
            )
          ) {
            delete (keyRecord as any).keyHash;
            return keyRecord;
          } else {
            throw new AppError(
              'The key does not have permisisons to view this route',
              HttpStatus.FORBIDDEN
            );
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
