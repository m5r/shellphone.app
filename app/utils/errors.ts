export class AuthenticationError extends Error {
	name = "AuthenticationError";
	statusCode = 401;

	constructor(message = "You must be logged in to access this") {
		super(message);
	}
}

export class ResetPasswordError extends Error {
	name = "ResetPasswordError";
	message = "Reset password link is invalid or it has expired.";
}

export class NotFoundError extends Error {
	name = "NotFoundError";
	statusCode = 404;

	constructor(message = "This could not be found") {
		super(message);
	}
}
