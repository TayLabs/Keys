import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import { Key } from '@/apiKey/interfaces/Key.interface';

const getParamSchema = z.object({
  keyId: z.uuid('Must be a valid UUID').transform((str: string) => str as UUID),
});

type GetReqParams = z.infer<typeof getParamSchema>;
type GetResBody = ResponseBody<{
  key: Key;
}>;

export { getParamSchema, type GetReqParams, type GetResBody };
