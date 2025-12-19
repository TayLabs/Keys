import type { UUID } from 'node:crypto';

export type Service = {
	id: UUID;
	name: string;
	isExternal: boolean;
};
