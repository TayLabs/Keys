import z from 'zod';
import dotenv from 'dotenv';

// Only load .env files with 'dotenv' if in development mode
if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: '.env', quiet: true });
	dotenv.config({
		path: '.env.local',
		override: true,
		quiet: true, // Disable logs/tips
	});
} else if (process.env.NODE_ENV === 'test') {
	dotenv.config({ path: '.env', quiet: true });
	dotenv.config({ path: '.env.test', override: true, quiet: true });
}

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'], {
			error: 'Must be set to development, production, or test',
		})
		.default('production'),
	PORT: z
		.string()
		.regex(/^\d+$/, 'Not a valid number')
		.default('7313')
		.transform(Number),
	DATABASE_URL: z.url('Must be a valid url for the database'),
	REDIS_URI: z
		.string('Must include Redis connection string (Format: "[ipaddr]:[port]")')
		.regex(/\b[\w.-]+:(\d{1,5})\b/, 'Invalid format, use "[host]:[port]"')
		.transform((str) => {
			const [host, port] = str.split(':');

			return {
				HOST: host,
				PORT: parseInt(port),
			};
		}),
	SERVICE_NAME: z.string().default('keys'),
	ACCESS_TOKEN_SECRET: z
		.string('Must be a valid string of characters')
		.min(6, 'Must be at least 6 characters long')
		.max(24, 'Must be at most 24 characters long'),
});
type EnvVariables = z.infer<typeof envSchema>;

let env: EnvVariables;
try {
	env = envSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {
		const errorTree = z.treeifyError<EnvVariables>(
			error as z.ZodError<EnvVariables>
		).properties;

		console.error(
			'❌ Invalid environment variables:',
			errorTree &&
				Object.entries(errorTree).map(
					([key, value]) => `${key}: ${value.errors.join(', ')}`
				)
		);
		process.exit(1);
	}
	throw error;
}

export { env as default, type EnvVariables };
