import type { UUID } from 'node:crypto';
import type { Permission } from './Permission.interface';

export type Service = {
	id: UUID;
	name: string;
	isExternal: boolean;
	permissions: Permission[];
};
