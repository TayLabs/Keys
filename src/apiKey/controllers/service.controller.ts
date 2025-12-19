import { controller } from '@/middleware/controller.middleware';
import { RegisterReqBody, RegisterResBody } from '../dto/service/register.dto';
import Service from '../services/Service.service';
import {
	type RemoveReqParams,
	type RemoveResBody,
} from '../dto/service/remove.dto';
import HttpStatus from '@/types/HttpStatus.enum';
import type { GetReqParams, GetResBody } from '../dto/service/get.dto';
import type { GetAllResBody } from '../dto/service/getAll.dto';
import type {
	UpdateReqBody,
	UpdateReqParams,
	UpdateResBody,
} from '../dto/service/update.dto';

export const getAll = controller<{}, GetAllResBody>(async (req, res, _next) => {
	const services = await Service.getAll();

	res.status(HttpStatus.OK).json({
		success: true,
		data: {
			services,
		},
	});
});

export const get = controller<{}, GetResBody, GetReqParams>(
	async (req, res, _next) => {
		const service = await new Service(req.params.serviceId).get();

		res.status(HttpStatus.OK).json({
			success: true,
			data: {
				service,
			},
		});
	}
);

export const register = controller<RegisterReqBody, RegisterResBody>(
	async (req, res, _next) => {
		const service = await Service.register(req.body);

		res.status(HttpStatus.CREATED).json({
			success: true,
			data: {
				service,
			},
		});
	}
);

export const update = controller<UpdateReqBody, UpdateResBody, UpdateReqParams>(
	async (req, res, _next) => {
		const service = await new Service(req.params.serviceId).update(req.body);

		res.status(HttpStatus.CREATED).json({
			success: true,
			data: {
				service,
			},
		});
	}
);

export const remove = controller<{}, RemoveResBody, RemoveReqParams>(
	async (req, res, _next) => {
		const service = await new Service(req.params.serviceId).remove();

		res.status(HttpStatus.OK).json({
			success: true,
			data: {
				service,
			},
		});
	}
);
