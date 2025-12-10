import env from '@/types/env';
import Redis from 'ioredis';

const redisClient = new Redis({
	host: env.REDIS_URI.HOST,
	port: env.REDIS_URI.PORT,
	maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
	console.log('📻 Connected to Redis');
});

redisClient.on('error', async (err) => {
	console.error('🛑 Redis connection error:', err);
	await redisClient.quit(); // Prevents multiple connection attempts
	process.exit(1);
});

export default redisClient;
