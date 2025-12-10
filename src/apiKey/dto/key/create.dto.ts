import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';

const createParamSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

type CreateReqParams = z.infer<typeof createParamSchema>;
type CreateResBody = ResponseBody<{
  key: string;
  apiKeyId: UUID;
}>;

export { createParamSchema, type CreateReqParams, type CreateResBody };
