import { ResponseBody } from '@/types/ResponseBody';
import { RequestHandler } from 'express';

/**
 * @description A middleware controller wrapper to handle async errors and typing of the request and response body.
 * @param func The request handler function to wrap. There is no need to wrap the contents in try/catch as it is handled automatically for async functions
 * @returns A request handler function with proper typing and error handling
 */
export function controller<
	ReqBody extends {} | undefined,
	ResBody extends ResponseBody,
	Params extends Record<string, any> = {},
	Query extends Record<string, any> = {}
>(
	func: RequestHandler<Params, ResBody, ReqBody, Query>
): RequestHandler<Params, ResBody, ReqBody, Query> {
	return async (req, res, next) => {
		try {
			if (isAsync(func)) {
				await func(req, res, next);
			} else {
				func(req, res, next);
			}
		} catch (err) {
			next(err);
		}
	};
}

const isAsync = (fn: any) => {
	return fn?.constructor?.name === 'AsyncFunction';
};
