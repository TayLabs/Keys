import { Router } from 'express';
import {
  create,
  getAll,
  remove,
  update,
  verify,
} from '../controllers/key.controller';
import { createBodySchema } from '../dto/key/create.dto';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { removeParamSchema } from '../dto/key/remove.dto';
import { verifyBodySchema } from '../dto/key/verify.dto';
import { authenticate } from '@/config/auth';
import { updateBodySchema, updateParamSchema } from '../dto/key/update.dto';

// /services/:serviceId/keys
const keyRouter = Router({ mergeParams: true });

keyRouter.get('/', authenticate({ allow: ['key.read'] }), getAll);
keyRouter.post('/verify', validateBody(verifyBodySchema), verify);
keyRouter.post(
  '/',
  authenticate({ allow: ['key.write'] }),
  validateBody(createBodySchema),
  create
);
keyRouter.patch(
  '/:keyId',
  authenticate({ allow: ['key.write'] }),
  validateParams(updateParamSchema),
  validateBody(updateBodySchema),
  update
);
keyRouter.delete(
  '/:keyId',
  authenticate({ allow: ['key.write'] }),
  validateParams(removeParamSchema),
  remove
);

export default keyRouter;
