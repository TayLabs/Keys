import { controller } from '@/middleware/controller.middleware';
import HttpStatus from '@/types/HttpStatus.enum';
import Key from '../services/Key.service';
import type { CreateReqBody, CreateResBody } from '../dto/key/create.dto';
import type { VerifyReqBody, VerifyResBody } from '../dto/key/verify.dto';
import type { RemoveReqParams, RemoveResBody } from '../dto/key/remove.dto';
import type { GetAllResBody } from '../dto/key/getAll.dto';
import {
  UpdateReqBody,
  UpdateReqParams,
  UpdateResBody,
} from '../dto/key/update.dto';
import { GetReqParams, GetResBody } from '../dto/key/get.dto';

export const getAll = controller<undefined, GetAllResBody>(
  async (_req, res, _next) => {
    const keys = await new Key().getAll();

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        keys,
      },
    });
  }
);

export const get = controller<undefined, GetResBody, GetReqParams>(
  async (req, res, _next) => {
    const key = await new Key(req.params.keyId).get();

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key,
      },
    });
  }
);

export const create = controller<CreateReqBody, CreateResBody>(
  async (req, res, _next) => {
    const { key, keyRecord } = await new Key().create(req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key: keyRecord,
        apiKey: key,
      },
    });
  }
);

export const update = controller<UpdateReqBody, UpdateResBody, UpdateReqParams>(
  async (req, res, _next) => {
    const keyRecord = await new Key(req.params.keyId).update(req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key: keyRecord,
      },
    });
  }
);

export const verify = controller<VerifyReqBody, VerifyResBody>(
  async (req, res, _next) => {
    await new Key().verify(req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      data: undefined,
    });
  }
);

export const remove = controller<undefined, RemoveResBody, RemoveReqParams>(
  async (req, res, _next) => {
    const key = await new Key(req.params.keyId).remove();

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key,
      },
    });
  }
);
