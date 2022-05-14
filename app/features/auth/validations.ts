import { z } from "zod";

export const password = z.string().min(10).max(100);

export const Register = z.object({
	orgName: z.string().nonempty(),
	fullName: z.string().nonempty(),
	email: z.string().email(),
	password,
});

export const SignIn = z.object({
	email: z.string().email(),
	password,
});

export const ForgotPassword = z.object({
	email: z.string().email(),
});

export const ResetPassword = z
	.object({
		password: password,
		passwordConfirmation: password,
		token: z.string(),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Passwords don't match",
		path: ["passwordConfirmation"], // set the path of the error
	});

export const AcceptInvitation = z.object({
	fullName: z.string(),
	email: z.string().email(),
	password,
	token: z.string(),
});

export const AcceptAuthedInvitation = z.object({
	token: z.string(),
});
