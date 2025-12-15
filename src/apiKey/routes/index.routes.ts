import { Router } from 'express';
import keyRouter from './key.routes';

const apiKeyRouter = Router();

apiKeyRouter.use('/services/:serviceId/keys', keyRouter);

export { apiKeyRouter };
