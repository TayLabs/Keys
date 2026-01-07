import { Router } from 'express';
import {
  create,
  getAll,
  remove,
  update,
  verify,
} from '../controllers/key.controller';
import { createBodySchema, createParamSchema } from '../dto/key/create.dto';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { removeParamSchema } from '../dto/key/remove.dto';
import { verifyBodySchema, verifyParamSchema } from '../dto/key/verify.dto';
import { authenticate } from '@/config/auth';
import { getAllParamsSchema } from '../dto/key/getAll.dto';
import { updateBodySchema, updateParamSchema } from '../dto/key/update.dto';
import { serviceParser } from '../middleware/service.middleware';

// /services/:serviceId/keys
const keyRouter = Router({ mergeParams: true });

keyRouter.get(
  '/',
  authenticate({ allow: ['key.read'] }),
  validateParams(getAllParamsSchema),
  serviceParser,
  getAll
);
keyRouter.post(
  '/verify',
  validateParams(verifyParamSchema),
  validateBody(verifyBodySchema),
  serviceParser,
  verify
);
keyRouter.post(
  '/',
  authenticate({ allow: ['key.write'] }),
  validateParams(createParamSchema),
  validateBody(createBodySchema),
  serviceParser,
  create
);
keyRouter.patch(
  '/:keyId',
  authenticate({ allow: ['key.write'] }),
  validateParams(updateParamSchema),
  validateBody(updateBodySchema),
  serviceParser,
  update
);
keyRouter.delete(
  '/:keyId',
  authenticate({ allow: ['key.write'] }),
  validateParams(removeParamSchema),
  serviceParser,
  remove
);

export default keyRouter;
