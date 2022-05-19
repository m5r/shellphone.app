import { type ActionFunction, json } from "@remix-run/node";

import { SignIn } from "../validations";
import { type FormError, validate } from "~/utils/validation.server";
import { authenticate } from "~/utils/auth.server";

export type SignInActionData = { errors: FormError<typeof SignIn> };

const action: ActionFunction = async ({ request }) => {
	const formData = Object.fromEntries(await request.clone().formData());
	const validation = validate(SignIn, formData);
	if (validation.errors) {
		return json<SignInActionData>({ errors: validation.errors });
	}

	const searchParams = new URL(request.url).searchParams;
	const redirectTo = searchParams.get("redirectTo");
	const successRedirect = redirectTo ? decodeURIComponent(redirectTo) : null;
	const { email, password } = validation.data;
	return authenticate({ email, password, request, successRedirect });
};

export default action;
