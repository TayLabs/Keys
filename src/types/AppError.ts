import HttpStatus from './HttpStatus.enum';

export default class AppError extends Error {
	public statusCode: number;

	constructor(
		message: string,
		statusCode: (typeof HttpStatus)[keyof typeof HttpStatus]
	) {
		super(message);
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, AppError.prototype); // Prevent any bugs with extending built-in classes
	}
}
