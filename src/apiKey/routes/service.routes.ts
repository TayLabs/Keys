import { authenticate } from '@/config/auth';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { Router } from 'express';
import { registerBodySchema } from '../dto/service/register.dto';
import { removeParamsSchema } from '../dto/service/remove.dto';
import {
  get,
  getAll,
  register,
  update,
  remove,
} from '../controllers/service.controller';
import { getParamsSchema } from '../dto/service/get.dto';
import {
  updateBodySchema,
  updateParamsSchema,
} from '../dto/service/update.dto';
import { serviceParser } from '../middleware/service.middleware';

const serviceRouter = Router({ mergeParams: true });

serviceRouter.get('/', authenticate({ allow: ['service.read'] }), getAll);
serviceRouter.get(
  '/:serviceName',
  authenticate({ allow: ['service.read'] }),
  validateParams(getParamsSchema),
  serviceParser,
  get
);
serviceRouter.post(
  '/register',
  authenticate({ allow: ['service.write'] }),
  validateBody(registerBodySchema),
  register
);
serviceRouter.patch(
  '/:serviceName',
  authenticate({ allow: ['service.write'] }),
  validateParams(updateParamsSchema),
  validateBody(updateBodySchema),
  serviceParser,
  update
);
serviceRouter.delete(
  '/:serviceName',
  authenticate({ allow: ['service.write'] }),
  validateParams(removeParamsSchema),
  serviceParser,
  remove
);

export { serviceRouter };
