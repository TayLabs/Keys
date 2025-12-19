import { controller } from '@/middleware/controller.middleware';
import HttpStatus from '@/types/HttpStatus.enum';
import Key from '../services/Key.service';
import type {
	CreateReqBody,
	CreateReqParams,
	CreateResBody,
} from '../dto/key/create.dto';
import type {
	VerifyReqBody,
	VerifyReqParams,
	VerifyResBody,
} from '../dto/key/verify.dto';
import type { RemoveReqParams, RemoveResBody } from '../dto/key/remove.dto';
import AppError from '@/types/AppError';
import type { GetAllReqParams, GetAllResBody } from '../dto/key/getAll.dto';

export const getAll = controller<undefined, GetAllResBody, GetAllReqParams>(
	async (req, res, next) => {
		const keys = await new Key(req.params.serviceId).getAll();

		res.status(HttpStatus.OK).json({
			success: true,
			data: {
				keys,
			},
		});
	}
);

export const create = controller<CreateReqBody, CreateResBody, CreateReqParams>(
	async (req, res, _next) => {
		const { key, keyRecord } = await new Key(req.params.serviceId).create(
			req.body
		);

		res.status(HttpStatus.OK).json({
			success: true,
			data: {
				key: keyRecord,
				apiKey: key,
			},
		});
	}
);

export const verify = controller<VerifyReqBody, VerifyResBody, VerifyReqParams>(
	async (req, res, _next) => {
		if (!(await new Key(req.params.serviceId).verify(req.body.key))) {
			throw new AppError('Invalid Api Key', HttpStatus.UNAUTHORIZED);
		}

		res.status(HttpStatus.OK).json({
			success: true,
			data: {},
		});
	}
);

export const remove = controller<undefined, RemoveResBody, RemoveReqParams>(
	async (req, res, _next) => {
		const key = await new Key(req.params.serviceId, req.params.keyId).remove();

		res.status(HttpStatus.OK).json({
			success: true,
			data: {
				key,
			},
		});
	}
);
