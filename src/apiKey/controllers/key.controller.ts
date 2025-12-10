import { controller } from '@/middleware/controller.middleware';
import HttpStatus from '@/types/HttpStatus.enum';
import Key from '../services/Key.service';
import type { CreateReqParams, CreateResBody } from '../dto/key/create.dto';
import type {
  VerifyReqBody,
  VerifyReqParams,
  VerifyResBody,
} from '../dto/key/verify.dto';
import type { RemoveReqParams, RemoveResBody } from '../dto/key/remove.dto';
import AppError from '@/types/AppError';

export const create = controller<undefined, CreateResBody, CreateReqParams>(
  async (req, res, _next) => {
    const { key, keyRecord } = await new Key(req.params.serviceName).create();

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key,
        apiKeyId: keyRecord.id,
      },
    });
  }
);

export const verify = controller<VerifyReqBody, VerifyResBody, VerifyReqParams>(
  async (req, res, _next) => {
    if (!(await new Key(req.params.serviceName).verify(req.body.key))) {
      throw new AppError('Invalid Api Key', HttpStatus.UNAUTHORIZED);
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: {},
    });
  }
);

export const remove = controller<undefined, RemoveResBody, RemoveReqParams>(
  async (req, res, _next) => {
    const key = await new Key(
      req.params.serviceName,
      req.params.keyId
    ).remove();

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        key,
      },
    });
  }
);
