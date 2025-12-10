import rateLimit from 'express-rate-limit';
// import RedisStore, { type RedisReply } from 'rate-limit-redis';

export const globalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
	// store: new RedisStore({
	//   sendCommand: async (command: string, ...args: string[]) =>
	//     (await redisClient.call(command, ...args)) as RedisReply,
	// }),
});
