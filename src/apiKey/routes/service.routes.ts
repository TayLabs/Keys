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

const serviceRouter = Router({ mergeParams: true });

serviceRouter.get('/', authenticate({ allow: ['service.read'] }), getAll);
serviceRouter.get(
	'/:serviceId',
	authenticate({ allow: ['service.read'] }),
	validateParams(getParamsSchema),
	get
);
serviceRouter.post(
	'/register',
	authenticate({ allow: ['service.write'] }),
	validateBody(registerBodySchema),
	register
);
serviceRouter.patch(
	'/:serviceId',
	authenticate({ allow: ['service.write'] }),
	validateParams(updateParamsSchema),
	validateBody(updateBodySchema),
	update
);
serviceRouter.delete(
	'/:serviceId',
	authenticate({ allow: ['service.write'] }),
	validateParams(removeParamsSchema),
	remove
);

export { serviceRouter };
