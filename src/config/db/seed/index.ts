import Password from '@/auth/utils/Password.util';
import { db } from '..';
import {
  userTable,
  profileTable,
  serviceTable,
  roleTable,
  permissionTable,
  rolePermissionTable,
  userRoleTable,
} from '../schema/index.schema';
import prod from './prod.data';

export default async function seed(options?: { includeTestData: boolean }) {
  try {
    await db.transaction(async (tx) => {
      // insert user/profiles
      const users = await tx
        .insert(userTable)
        .values(
          await Promise.all(
            prod.users.map(async (user) => ({
              ...user,
              passwordHash: await Password.hashAsync(user.passwordHash),
            }))
          )
        )
        .onConflictDoNothing();
      await tx.insert(profileTable).values(prod.profiles).onConflictDoNothing();

      // insert service, roles, and permissions
      await tx.insert(serviceTable).values(prod.services).onConflictDoNothing();
      await tx.insert(roleTable).values(prod.roles).onConflictDoNothing();

      for (const role of prod.roles) {
        const filtered = prod.permissions.filter((permission) =>
          permission.roles.includes(role.name)
        );
        if (filtered.length > 0) {
          await tx
            .insert(permissionTable)
            .values(
              filtered.map((permission) => ({
                ...permission,
                roles: undefined,
              }))
            )
            .returning()
            .onConflictDoNothing();

          await tx
            .insert(rolePermissionTable)
            .values(
              filtered.map((permission) => ({
                permissionId: permission.id,
                roleId: role.id,
              }))
            )
            .onConflictDoNothing();
        }
      }
      for (const user of prod.users) {
        const filtered = prod.roles.filter((role) =>
          user.roles.includes(role.name)
        );
        if (filtered.length > 0) {
          await tx
            .insert(userRoleTable)
            .values(
              filtered.map((role) => ({
                userId: user.id,
                roleId: role.id,
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
