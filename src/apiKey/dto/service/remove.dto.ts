import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';

const removeParamsSchema = z.object({
	serviceId: z.uuid('Invalid UUID').transform((str) => str as UUID),
});

type RemoveReqParams = z.infer<typeof removeParamsSchema>;
type RemoveResBody = ResponseBody<{
	service: {
		id: UUID;
	};
}>;

export { removeParamsSchema, type RemoveReqParams, type RemoveResBody };
