import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { Service } from '@/apiKey/interfaces/Service.interface';

const getParamsSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

type GetReqParams = z.infer<typeof getParamsSchema>;
type GetResBody = ResponseBody<{
  service: Service;
}>;

export { getParamsSchema, type GetReqParams, type GetResBody };
