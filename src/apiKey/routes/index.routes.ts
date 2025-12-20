import { Router } from 'express';
import keyRouter from './key.routes';
import { serviceRouter } from './service.routes';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { verifyBodySchema, verifyParamSchema } from '../dto/key/verify.dto';
import { verify } from '../controllers/key.controller';

const apiKeyRouter = Router();

apiKeyRouter.use('/services', serviceRouter);
apiKeyRouter.use('/services/:serviceId/keys', keyRouter);
apiKeyRouter.post(
	'/services/:serviceName/keys/verify',
	validateParams(verifyParamSchema),
	validateBody(verifyBodySchema),
	verify
);

export { apiKeyRouter };
