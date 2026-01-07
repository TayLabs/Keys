import { db } from '@/config/db';
import { serviceTable } from '@/config/db/schema/index.schema';
import AppError from '@/types/AppError';
import HttpStatus from '@/types/HttpStatus.enum';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { UUID } from 'node:crypto';

export type ParsedServiceReqParams = {
  serviceId: UUID;
};

export const serviceParser: RequestHandler<
  {
    serviceName: string;
  } & ParsedServiceReqParams
> = async (req, _res, next) => {
  try {
    const result = (
      await db
        .select({ id: serviceTable.id })
        .from(serviceTable)
        .where(eq(serviceTable.name, req.params.serviceName))
    )[0];

    if (!result)
      throw new AppError(
        'Service with that name does not exist',
        HttpStatus.NOT_FOUND
      );

    req.params.serviceId = result.id; // Append service.id to req.params

    next();
  } catch (error) {
    next(error);
  }
};
