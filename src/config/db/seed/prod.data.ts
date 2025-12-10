import z from 'zod';
import env from '@/types/env';
import { profileTable } from '../schema/profile.schema';
import { userTable } from '../schema/user.schema';
import { roleTable } from '../schema/role.schema';
import { serviceTable } from '../schema/service.schema';
import { permissionTable } from '../schema/permission.schema';

const prod = {
  users: [
    {
      id: '04f83b2f-6468-4474-9002-254cd1ac47f6',
      email: env.ADMIN.EMAIL,
      emailVerified: !z.email().safeParse(env.ADMIN.EMAIL).success, // Won't work with sending password reset to email if there's not a valid email, but non-email usernames won't validate properly on that route anyways
      passwordHash: env.ADMIN.PASSWORD,
      forcePasswordChange: env.ADMIN.PASSWORD === 'admin', // force change if it's the default password
      roles: ['admin', 'user'],
    },
  ] satisfies (typeof userTable.$inferInsert & {
    roles: string[];
  })[],
  profiles: [
    {
      userId: '04f83b2f-6468-4474-9002-254cd1ac47f6',
      firstName: 'TayLab',
      lastName: 'Admin',
      displayName: 'Admin',
      username: 'admin',
    },
  ] satisfies (typeof profileTable.$inferInsert)[],
  services: [
    {
      id: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      name: 'auth',
    },
  ] satisfies (typeof serviceTable.$inferInsert)[],
  roles: [
    {
      id: '23e28142-85b2-412a-8e20-eeed89bbfa04',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      name: 'admin',
    },
    {
      id: 'e5075ee5-2083-4018-bd78-6e266662067d',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      name: 'user',
      assignToNewUser: true,
    },
  ] satisfies (typeof roleTable.$inferInsert)[],
  permissions: [
    {
      id: '920b5a41-348e-4f29-b25c-8ea1c63bfc40',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'user',
      action: 'read',
      roles: ['user'],
    },
    {
      id: 'a2664168-5db7-437a-9bee-355617db4037',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'user',
      action: 'write',
      roles: ['user'],
    },
    {
      id: 'da36a721-118f-44fa-ac62-381a58451aed',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'service',
      action: 'read',
      roles: ['admin'],
    },
    {
      id: 'db37ebc1-5d3c-49af-ac0d-50dfc09e2fb5',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'service',
      action: 'write',
      roles: ['admin'],
    },
    {
      id: '3bb84928-5878-4703-8276-d46913535c59',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'role',
      action: 'read',
      roles: ['admin'],
    },
    {
      id: '4a7331bb-679f-448d-ac72-27d06465a0a2',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'role',
      action: 'write',
      roles: ['admin'],
    },
    {
      id: '457c17e6-da87-4245-ab1b-23ee403b853b',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'permission',
      action: 'read',
      roles: ['admin'],
    },
    {
      id: 'f96f7b82-f3cb-48f9-b8b5-e1b7d29e2381',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'permission',
      action: 'write',
      roles: ['admin'],
    },
    {
      id: '9ba8fc1c-cd43-4fb6-8e66-e6348caba223',
      serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
      resource: 'key',
      action: 'write',
      roles: ['admin'],
    },
  ] satisfies (typeof permissionTable.$inferInsert & {
    roles: string[];
  })[],
};

export default prod;
