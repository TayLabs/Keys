import { ResponseBody } from '@/types/ResponseBody';
import { type RequestHandler } from 'express';
import { treeifyError, type ZodType, ZodError } from 'zod';

export function validateBody<T extends ZodType>(
  schema: T
): RequestHandler<{}, ResponseBody> {
  return async (req, res, next) => {
    try {
      const validatedBody = await schema.parseAsync(req.body);
      req.body = validatedBody;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorTree = treeifyError<T>(err as ZodError<T>).properties;
        return res.status(400).json({
          success: false,
          message: errorTree
            ? 'Invalid request body: ' +
              Object.entries(errorTree)
                .map(([key, value]) => `${key}: ${value.errors.join(', ')}`)
                .join(' | ')
            : 'Invalid request body',
        });
      } else {
        next(err);
      }
    }
  };
}

export function validateParams<T extends ZodType>(
  schema: T
): RequestHandler<any, ResponseBody> {
  return async (req, res, next) => {
    try {
      const validatedParams = await schema.parseAsync(req.params);
      req.params = validatedParams;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorTree = treeifyError<T>(err as ZodError<T>).properties;
        return res.status(400).json({
          success: false,
          message: errorTree
            ? 'Invalid request params: ' +
              Object.entries(errorTree)
                .map(([key, value]) => `${key}: ${value.errors.join(', ')}`)
                .join(' | ')
            : 'Invalid request params',
        });
      } else {
        next(err);
      }
    }
  };
}

export function validateQueryParams<T extends ZodType>(
  schema: T
): RequestHandler<any, ResponseBody> {
  return async (req, res, next) => {
    try {
      const validatedQuery = await schema.parseAsync(req.query);

      Object.defineProperty(req, 'query', {
        ...Object.getOwnPropertyDescriptor(req, 'query'),
        value: validatedQuery,
        writable: true,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorTree = treeifyError<T>(err as ZodError<T>).properties;
        return res.status(400).json({
          success: false,
          message: errorTree
            ? 'Invalid request params: ' +
              Object.entries(errorTree)
                .map(([key, value]) => `${key}: ${value.errors.join(', ')}`)
                .join(' | ')
            : 'Invalid request params',
        });
      } else {
        next(err);
      }
    }
  };
}
