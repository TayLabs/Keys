import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import { Key } from '@/apiKey/interfaces/Key.interface';

const createParamSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

const createBodySchema = z.object({
  name: z
    .string('Must be a valid string')
    .min(1, 'Name is too short')
    .max(128, 'Name is too long'),
  permissions: z.array(
    z.uuid('Invalid uuid').transform((str: string) => str as UUID),
    'Invalid array of strings'
  ),
});

type CreateReqParams = z.infer<typeof createParamSchema>;
type CreateReqBody = z.infer<typeof createBodySchema>;
type CreateResBody = ResponseBody<{
  key: Key;
  apiKey: string;
}>;

export {
  createParamSchema,
  createBodySchema,
  type CreateReqParams,
  type CreateReqBody,
  type CreateResBody,
};
