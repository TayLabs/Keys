import type { UUID } from 'node:crypto';

export type Permission = {
	id: UUID;
	key: string;
	description: string | null;
};
