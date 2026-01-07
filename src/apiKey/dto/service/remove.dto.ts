import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';

const removeParamsSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

type RemoveReqParams = z.infer<typeof removeParamsSchema>;
type RemoveResBody = ResponseBody<{
  service: {
    id: UUID;
  };
}>;

export { removeParamsSchema, type RemoveReqParams, type RemoveResBody };
