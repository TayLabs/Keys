import env from '@/types/env';
import TayLabAuth from '@taylabs-auth-sdk/express';

const { authenticate } = new TayLabAuth(
	env.SERVICE_NAME,
	env.ACCESS_TOKEN_SECRET
);

export { authenticate };
