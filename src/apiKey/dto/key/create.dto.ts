import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { UUID } from 'node:crypto';
import { Key } from '@/apiKey/interfaces/Key.interface';

const createParamSchema = z.object({
	serviceId: z.uuid('Must be a valid UUID').transform((str) => str as UUID),
});

const createBodySchema = z.object({
	name: z
		.string('Must be a valid string')
		.min(1, 'Name is too short')
		.max(128, 'Name is too long'),
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
