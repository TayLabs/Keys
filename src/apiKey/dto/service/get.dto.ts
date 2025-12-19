import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import type { Service } from '@/apiKey/interfaces/Service.interface';

const getParamsSchema = z.object({
	serviceId: z.uuid('Invalid UUID').transform((str) => str as UUID),
});

type GetReqParams = z.infer<typeof getParamsSchema>;
type GetResBody = ResponseBody<{
	service: Service;
}>;

export { getParamsSchema, type GetReqParams, type GetResBody };
