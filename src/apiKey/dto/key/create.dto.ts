import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';

const createParamSchema = z.object({
	serviceId: z.uuid('Must be a valid UUID').transform((str) => str as UUID),
});

type CreateReqParams = z.infer<typeof createParamSchema>;
type CreateResBody = ResponseBody<{
	key: string;
	apiKeyId: UUID;
}>;

export { createParamSchema, type CreateReqParams, type CreateResBody };
