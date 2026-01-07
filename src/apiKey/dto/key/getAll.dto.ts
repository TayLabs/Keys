import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import type { Key } from '@/apiKey/interfaces/Key.interface';

const getAllParamsSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

type GetAllReqParams = z.infer<typeof getAllParamsSchema>;
type GetAllResBody = ResponseBody<{
  keys: Key[];
}>;

export { getAllParamsSchema, type GetAllReqParams, type GetAllResBody };
