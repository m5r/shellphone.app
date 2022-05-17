import { type ActionFunction, json } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { z } from "zod";

import db from "~/utils/db.server";
import { type FormError, validate } from "~/utils/validation.server";
import { requireLoggedIn } from "~/utils/auth.server";

type SetPhoneNumberFailureActionData = { errors: FormError<typeof bodySchema>; submitted?: never };
type SetPhoneNumberSuccessfulActionData = { errors?: never; submitted: true };
export type SetPhoneNumberActionData = SetPhoneNumberFailureActionData | SetPhoneNumberSuccessfulActionData;

const action: ActionFunction = async ({ request }) => {
	const { organizations } = await requireLoggedIn(request);
	const organization = organizations[0];
	const formData = Object.fromEntries(await request.formData());
	const validation = validate(bodySchema, formData);
	if (validation.errors) {
		return badRequest<SetPhoneNumberActionData>({ errors: validation.errors });
	}

	try {
		await db.phoneNumber.update({
			where: { organizationId_isCurrent: { organizationId: organization.id, isCurrent: true } },
			data: { isCurrent: false },
		});
	} catch (error: any) {
		if (error.code !== "P2025") {
			// if any error other than record not found
			throw error;
		}
	}

	await db.phoneNumber.update({
		where: { id: validation.data.phoneNumberSid },
		data: { isCurrent: true },
	});

	return json<SetPhoneNumberActionData>({ submitted: true });
};

export default action;

const bodySchema = z.object({
	phoneNumberSid: z
		.string()
		.refine((phoneNumberSid) => phoneNumberSid.startsWith("PN"), "Select a valid phone number"),
});
