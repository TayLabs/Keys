export type ResponseBody<T = Record<string, any>> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			message: string;
			stack?: string;
	  };
