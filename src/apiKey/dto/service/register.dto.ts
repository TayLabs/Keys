import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { Service } from '@/apiKey/interfaces/Service.interface';

const registerBodySchema = z.object({
	service: z
		.string('Must be a valid string')
		.min(2, 'Service name is too short')
		.max(128, 'Service name is too long'),
	permissions: z.array(
		z.object({
			key: z
				.string('Must be a valid string')
				.min(2, 'Permission name is too short')
				.max(128, 'Permission name is too long'),
			description: z.string('Must be a valid string').optional(),
		})
	),
});

type RegisterReqBody = z.infer<typeof registerBodySchema>;
type RegisterResBody = ResponseBody<{
	service: Service;
}>;

export { registerBodySchema, type RegisterReqBody, type RegisterResBody };
