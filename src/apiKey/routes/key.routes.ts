import { Router } from 'express';
import { create, remove, verify } from '../controllers/key.controller';
import { createParamSchema } from '../dto/key/create.dto';
import { validateParams } from '@/middleware/validate.middleware';
import { removeParamSchema } from '../dto/key/remove.dto';
import { verifyParamSchema } from '../dto/key/verify.dto';
import { authenticate } from '@/config/auth';

// /services/:serviceId/keys
const keyRouter = Router({ mergeParams: true });

keyRouter.post(
  '/',
  authenticate({ allow: ['key.write'] }),
  validateParams(createParamSchema),
  create
);
keyRouter.post('/verify', validateParams(verifyParamSchema), verify);
keyRouter.delete(
  '/:keyId',
  authenticate({ allow: ['key.write'] }),
  validateParams(removeParamSchema),
  remove
);

export default keyRouter;
