import { serviceTable } from '../schema/service.schema';
import { permissionTable } from '../schema/permission.schema';

const prod = {
	services: [
		{
			id: '61b6ec0f-81a1-4a0c-a0e7-c13917937fa7',
			name: 'keys',
		},
		{
			id: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			name: 'auth',
		},
	] satisfies (typeof serviceTable.$inferInsert)[],
	permissions: [
		// TODO: Fill out with permission data for all services (prob get some sort of config for it)
		{
			id: '920b5a41-348e-4f29-b25c-8ea1c63bfc40',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'user',
			action: 'read',
			services: ['auth'],
		},
		{
			id: 'a2664168-5db7-437a-9bee-355617db4037',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'user',
			action: 'write',
			services: ['auth'],
		},
		{
			id: 'da36a721-118f-44fa-ac62-381a58451aed',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'service',
			action: 'read',
			services: ['auth'],
		},
		{
			id: 'db37ebc1-5d3c-49af-ac0d-50dfc09e2fb5',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'service',
			action: 'write',
			services: ['auth'],
		},
		{
			id: '3bb84928-5878-4703-8276-d46913535c59',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'role',
			action: 'read',
			services: ['auth'],
		},
		{
			id: '4a7331bb-679f-448d-ac72-27d06465a0a2',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'role',
			action: 'write',
			services: ['auth'],
		},
		{
			id: '457c17e6-da87-4245-ab1b-23ee403b853b',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'permission',
			action: 'read',
			services: ['auth'],
		},
		{
			id: 'f96f7b82-f3cb-48f9-b8b5-e1b7d29e2381',
			serviceId: 'b6d842b8-91be-46f7-a340-c4afb1b63a0b',
			resource: 'permission',
			action: 'write',
			services: ['auth'],
		},
		{
			id: '9ba8fc1c-cd43-4fb6-8e66-e6348caba223',
			serviceId: '61b6ec0f-81a1-4a0c-a0e7-c13917937fa7',
			resource: 'key',
			action: 'write',
			services: ['auth'],
		},
	] satisfies (typeof permissionTable.$inferInsert & {
		services: string[];
	})[],
};

export default prod;
