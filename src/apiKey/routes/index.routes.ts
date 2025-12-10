import { Router } from 'express';
import keyRouter from './key.routes';

const apiKeyRouter = Router();

apiKeyRouter.use('/services/:serviceName', keyRouter);

export { apiKeyRouter };
