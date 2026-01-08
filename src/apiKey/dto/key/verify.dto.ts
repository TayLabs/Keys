import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';

const verifyBodySchema = z.object({
  key: z
    .string('Must be a valid string')
    .length(64, 'Must be 64 characters long'),
  scopes: z.array(
    z
      .string()
      .regex(
        /^\S+:\S+\.\S+$/,
        'Invalid format for permission, must be formatted like "service:permission.name"'
      ),
    'Must be a valid array of strings'
  ),
});

type VerifyReqBody = z.infer<typeof verifyBodySchema>;
type VerifyResBody = ResponseBody<undefined>;

export { verifyBodySchema, type VerifyReqBody, type VerifyResBody };
