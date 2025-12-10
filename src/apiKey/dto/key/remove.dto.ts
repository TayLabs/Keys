import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';

const removeParamSchema = z.object({
  serviceName: z.string('Must be a valid string'),
  keyId: z.uuid('Must be a valid UUID').transform((str) => str as UUID),
});

type RemoveReqParams = z.infer<typeof removeParamSchema>;
type RemoveResBody = ResponseBody<{
  key: {
    id: UUID;
  };
}>;

export { removeParamSchema, type RemoveReqParams, type RemoveResBody };
