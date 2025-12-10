import AppError from '@/types/AppError';
import { type RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
	next(new AppError('Resource not found', 404));
};
