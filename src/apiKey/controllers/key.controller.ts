import { controller } from '@/middleware/controller.middleware';
import HttpStatus from '@/types/HttpStatus.enum';
import Key from '../services/Key.service';
import type {
  CreateReqBody,
  CreateReqParams,
  CreateResBody,
} from '../dto/key/create.dto';
import type {
  VerifyReqBody,
  VerifyReqParams,
  VerifyResBody,
} from '../dto/key/verify.dto';
import type { RemoveReqParams, RemoveResBody } from '../dto/key/remove.dto';
import AppError from '@/types/AppError';
import type { GetAllReqParams, GetAllResBody } from '../dto/key/getAll.dto';
import {
  UpdateReqBody,
  UpdateReqParams,
  UpdateResBody,
} from '../dto/key/update.dto';
import { serviceTable } from '@/config/db/schema/service.schema';
import { eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { ParsedServiceReqParams } from '../middleware/service.middleware';

export const getAll = controller<
  undefined,
  GetAllResBody,
  GetAllReqParams & ParsedServiceReqParams
>(async (req, res, next) => {
  const keys = await new Key(req.params.serviceId).getAll();

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      keys,
    },
  });
});

export const create = controller<
  CreateReqBody,
  CreateResBody,
  CreateReqParams & ParsedServiceReqParams
>(async (req, res, _next) => {
  const { key, keyRecord } = await new Key(req.params.serviceId).create(
    req.body
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      key: keyRecord,
      apiKey: key,
    },
  });
});

export const update = controller<
  UpdateReqBody,
  UpdateResBody,
  UpdateReqParams & ParsedServiceReqParams
>(async (req, res, _next) => {
  const keyRecord = await new Key(
    req.params.serviceId,
    req.params.keyId
  ).update(req.body);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      key: keyRecord,
    },
  });
});

export const verify = controller<
  VerifyReqBody,
  VerifyResBody,
  VerifyReqParams & ParsedServiceReqParams
>(async (req, res, _next) => {
  const serviceRecord = (
    await db
      .select()
      .from(serviceTable)
      .where(eq(serviceTable.name, req.params.serviceName))
  )[0];

  if (!serviceRecord) {
    throw new AppError('Invalid service name', HttpStatus.NOT_FOUND);
  }

  await new Key(serviceRecord.id).verify(req.body);

  res.status(HttpStatus.OK).json({
    success: true,
    data: undefined,
  });
});

export const remove = controller<
  undefined,
  RemoveResBody,
  RemoveReqParams & ParsedServiceReqParams
>(async (req, res, _next) => {
  const key = await new Key(req.params.serviceId, req.params.keyId).remove();

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      key,
    },
  });
});
