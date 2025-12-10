import { exec } from 'node:child_process';
import path from 'node:path';

export default function generateSchema() {
	exec('npx drizzle-kit generate', {
		cwd: path.join(__dirname, '../../../../'),
	});

	console.log('🏗️ Schema generation complete');
}
