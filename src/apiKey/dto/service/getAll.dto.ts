import type { ResponseBody } from '@/types/ResponseBody';
import type { Service } from '@/apiKey/interfaces/Service.interface';

type GetAllResBody = ResponseBody<{
	services: Service[];
}>;

export { type GetAllResBody };
