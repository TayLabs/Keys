import * as schema from '../schema/index.schema';

const test = {
	users: [
		{
			id: '04f83b2f-6468-4474-9002-254cd1ac47f6',
			email: 'john.doe@taylorkelley.dev',
			passwordHash: 'Password123!',
			twoFactorEnabled: false,
		},
	] satisfies (typeof schema.userTable.$inferInsert)[],

	profiles: [
		{
			userId: '04f83b2f-6468-4474-9002-254cd1ac47f6',
			firstName: 'John',
			lastName: 'Doe',
			username: 'john.doe27',
		},
	] satisfies (typeof schema.profileTable.$inferInsert)[],
};

export default test;
