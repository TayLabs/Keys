import { authenticate } from '@/config/auth';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { Router } from 'express';
import { registerBodySchema } from '../dto/service/register.dto';
import { removeParamSchema } from '../dto/key/remove.dto';
import {
	get,
	getAll,
	register,
	remove,
} from '../controllers/service.controller';
import { getParamsSchema } from '../dto/service/get.dto';

const serviceRouter = Router({ mergeParams: true });

serviceRouter.get('/', getAll);
serviceRouter.get('/:serviceId', validateParams(getParamsSchema), get);
serviceRouter.post(
	'/register',
	authenticate({ allow: ['service.write'] }),
	validateBody(registerBodySchema),
	register
);
serviceRouter.delete(
	'/:serviceId',
	authenticate({ allow: ['service.write'] }),
	validateParams(removeParamSchema),
	remove
);

export { serviceRouter };
