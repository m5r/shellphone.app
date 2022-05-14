import { type ActionFunction, json } from "@remix-run/node";
import { GlobalRole, MembershipRole } from "@prisma/client";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { authenticate, hashPassword } from "~/utils/auth.server";
import { type FormError, validate } from "~/utils/validation.server";
import { Register } from "../validations";

export type RegisterActionData = {
	errors: FormError<typeof Register>;
};

const action: ActionFunction = async ({ request }) => {
	const formData = Object.fromEntries(await request.formData());
	const validation = validate(Register, formData);
	if (validation.errors) {
		return json<RegisterActionData>({ errors: validation.errors });
	}

	const { fullName, email, password } = validation.data;
	const hashedPassword = await hashPassword(password.trim());
	try {
		await db.user.create({
			data: {
				fullName: fullName.trim(),
				email: email.toLowerCase().trim(),
				hashedPassword,
				role: GlobalRole.CUSTOMER,
				memberships: {
					create: {
						role: MembershipRole.OWNER,
						organization: {
							create: {}
						},
					},
				},
			},
		});
	} catch (error: any) {
		logger.error(error);

		if (error.code === "P2002") {
			if (error.meta.target[0] === "email") {
				return json<RegisterActionData>({
					errors: { general: "An account with this email address already exists" },
				});
			}
		}

		return json<RegisterActionData>({
			errors: { general: `An unexpected error happened${error.code ? `\nCode: ${error.code}` : ""}` },
		});
	}

	return authenticate({ email, password, request, failureRedirect: "/register" });
};

export default action;
