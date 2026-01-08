import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import { Key } from '@/apiKey/interfaces/Key.interface';

const updateParamSchema = z.object({
  keyId: z.uuid('Must be a valid UUID').transform((str: string) => str as UUID),
});

const updateBodySchema = z.object({
  name: z
    .string('Must be a valid string')
    .min(1, 'Name is too short')
    .max(128, 'Name is too long'),
  permissions: z.array(
    z.uuid('Invalid uuid').transform((str: string) => str as UUID),
    'Invalid array of strings'
  ),
});

type UpdateReqParams = z.infer<typeof updateParamSchema>;
type UpdateReqBody = z.infer<typeof updateBodySchema>;
type UpdateResBody = ResponseBody<{
  key: Key;
}>;

export {
  updateParamSchema,
  updateBodySchema,
  type UpdateReqParams,
  type UpdateReqBody,
  type UpdateResBody,
};
