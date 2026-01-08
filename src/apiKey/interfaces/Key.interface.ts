import type { UUID } from 'node:crypto';

export type Key = {
  id: UUID;
  name: string;
  keyLastFour: string;
  expiresAt: Date;
  createdAt: Date;
};
