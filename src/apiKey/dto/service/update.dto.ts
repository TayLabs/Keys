import z from 'zod';
import type { ResponseBody } from '@/types/ResponseBody';
import type { Service } from '@/apiKey/interfaces/Service.interface';

const updateParamsSchema = z.object({
  serviceName: z.string('Must be a valid string'),
});

const updateBodySchema = z.object({
  service: z
    .string('Must be a valid string')
    .min(2, 'Service name is too short')
    .max(128, 'Service name is too long')
    .optional(),
  permissions: z
    .array(
      z.object({
        key: z
          .string('Must be a valid string')
          .min(2, 'Permission name is too short')
          .max(128, 'Permission name is too long'),
        description: z.string('Must be a valid string').optional(),
      })
    )
    .optional(),
});

type UpdateReqParams = z.infer<typeof updateParamsSchema>;
type UpdateReqBody = z.infer<typeof updateBodySchema>;
type UpdateResBody = ResponseBody<{
  service: Service;
}>;

export {
  updateParamsSchema,
  updateBodySchema,
  type UpdateReqParams,
  type UpdateReqBody,
  type UpdateResBody,
};
