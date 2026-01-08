import type { UUID } from 'node:crypto';
import type { Permission } from './Permission.interface';

export type Key = {
  id: UUID;
  name: string;
  keyLastFour: string;
  expiresAt: Date;
  createdAt: Date;
  permissions?: Permission[];
};
