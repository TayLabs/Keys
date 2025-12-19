import { Router } from 'express';
import { create, getAll, remove, verify } from '../controllers/key.controller';
import { createParamSchema } from '../dto/key/create.dto';
import { validateParams } from '@/middleware/validate.middleware';
import { removeParamSchema } from '../dto/key/remove.dto';
import { verifyParamSchema } from '../dto/key/verify.dto';
import { authenticate } from '@/config/auth';
import { getAllParamsSchema } from '../dto/key/getAll.dto';

// /services/:serviceId/keys
const keyRouter = Router({ mergeParams: true });

keyRouter.get(
	'/',
	authenticate({ allow: ['key.read'] }),
	validateParams(getAllParamsSchema),
	getAll
);
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
