import env from './types/env';
import app from './app';
import runMigrations from './config/db/utils/runMigrations';
import redisClient from './config/redis/client';
import { pool } from './config/db';
import seed from './config/db/seed';

async function startServer() {
	try {
		await runMigrations();
		await seed();

		const port = env.PORT || 7313;
		const server = app.listen(port, () => {
			console.log(`🚀 Server is running on port ${port}`);
		});

		process.on('SIGTERM', async () => {
			// close redis connection
			redisClient.disconnect();
			await pool.end();

			await server.close();
			process.exit(0);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

startServer();
