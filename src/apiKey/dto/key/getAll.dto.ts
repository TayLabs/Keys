import type { ResponseBody } from '@/types/ResponseBody';
import type { Key } from '@/apiKey/interfaces/Key.interface';

type GetAllResBody = ResponseBody<{
  keys: Key[];
}>;

export { type GetAllResBody };
