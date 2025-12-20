export type ResponseBody<T = Record<string, any> | undefined> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			message: string;
			stack?: string;
	  };
