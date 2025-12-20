import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';

const verifyParamSchema = z.object({
	serviceName: z.string('Must be a valid string'),
});

const verifyBodySchema = z.object({
	key: z
		.string('Must be a valid string')
		.length(64, 'Must be 64 characters long'),
	scopes: z.array(z.string(), 'Must be a valid array of strings'),
});

type VerifyReqBody = z.infer<typeof verifyBodySchema>;
type VerifyReqParams = z.infer<typeof verifyParamSchema>;
type VerifyResBody = ResponseBody<undefined>;

export {
	verifyParamSchema,
	verifyBodySchema,
	type VerifyReqParams,
	type VerifyReqBody,
	type VerifyResBody,
};
