import { type ActionFunction, json, redirect } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { z } from "zod";
import SecurePassword from "secure-password";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { hashPassword, requireLoggedIn, verifyPassword } from "~/utils/auth.server";
import { type FormError, validate } from "~/utils/validation.server";
import { destroySession, getSession } from "~/utils/session.server";
import deleteUserQueue from "~/queues/delete-user-data.server";

const action: ActionFunction = async ({ request }) => {
	const formData = Object.fromEntries(await request.formData());
	if (!formData._action) {
		const errorMessage = "POST /settings without any _action";
		logger.error(errorMessage);
		return badRequest({ errorMessage });
	}

	switch (formData._action as Action) {
		case "deleteUser":
			return deleteUser(request);
		case "changePassword":
			return changePassword(request, formData);
		case "updateUser":
			return updateUser(request, formData);
		default:
			const errorMessage = `POST /settings with an invalid _action=${formData._action}`;
			logger.error(errorMessage);
			return badRequest({ errorMessage });
	}
};

export default action;

async function deleteUser(request: Request) {
	const {
		user: { id },
	} = await requireLoggedIn(request);

	await db.user.update({
		where: { id },
		data: { hashedPassword: "pending deletion" },
	});
	await deleteUserQueue.add(`delete user ${id}`, { userId: id });

	return redirect("/", {
		headers: {
			"Set-Cookie": await destroySession(await getSession(request)),
		},
	});
}

type ChangePasswordFailureActionData = { errors: FormError<typeof validations.changePassword>; submitted?: never };
type ChangePasswordSuccessfulActionData = { errors?: never; submitted: true };
export type ChangePasswordActionData = {
	changePassword: ChangePasswordFailureActionData | ChangePasswordSuccessfulActionData;
};

async function changePassword(request: Request, formData: unknown) {
	const validation = validate(validations.changePassword, formData);
	if (validation.errors) {
		return json<ChangePasswordActionData>({
			changePassword: { errors: validation.errors },
		});
	}

	const {
		user: { id },
	} = await requireLoggedIn(request);
	const user = await db.user.findUnique({ where: { id } });
	const { currentPassword, newPassword } = validation.data;
	const verificationResult = await verifyPassword(user!.hashedPassword!, currentPassword);
	if ([SecurePassword.INVALID, SecurePassword.INVALID_UNRECOGNIZED_HASH, false].includes(verificationResult)) {
		return json<ChangePasswordActionData>({
			changePassword: { errors: { currentPassword: "Current password is incorrect" } },
		});
	}

	const hashedPassword = await hashPassword(newPassword.trim());
	await db.user.update({
		where: { id: user!.id },
		data: { hashedPassword },
	});

	return json<ChangePasswordActionData>({
		changePassword: { submitted: true },
	});
}

type UpdateUserFailureActionData = { errors: FormError<typeof validations.updateUser>; submitted?: never };
type UpdateUserSuccessfulActionData = { errors?: never; submitted: true };
export type UpdateUserActionData = {
	updateUser: UpdateUserFailureActionData | UpdateUserSuccessfulActionData;
};

async function updateUser(request: Request, formData: unknown) {
	const validation = validate(validations.updateUser, formData);
	if (validation.errors) {
		return json<UpdateUserActionData>({
			updateUser: { errors: validation.errors },
		});
	}

	const { user } = await requireLoggedIn(request);
	const { email, fullName } = validation.data;
	await db.user.update({
		where: { id: user.id },
		data: { email, fullName },
	});

	return json<UpdateUserActionData>({
		updateUser: { submitted: true },
	});
}

type Action = "deleteUser" | "updateUser" | "changePassword";

const validations = {
	deleteUser: null,
	changePassword: z.object({
		currentPassword: z.string(),
		newPassword: z.string().min(10).max(100),
	}),
	updateUser: z.object({
		fullName: z.string(),
		email: z.string(),
	}),
} as const;
