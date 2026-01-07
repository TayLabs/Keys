import { Router } from 'express';
import keyRouter from './key.routes';
import { serviceRouter } from './service.routes';

const apiKeyRouter = Router();

apiKeyRouter.use('/services', serviceRouter);
apiKeyRouter.use('/services/:serviceName/keys', keyRouter);

export { apiKeyRouter };
