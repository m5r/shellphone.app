import { type LoaderFunction, json } from "@remix-run/node";
import { type PhoneNumber, Prisma } from "@prisma/client";

import { requireLoggedIn } from "~/utils/auth.server";
import settingsPhoneAction from "~/features/settings/actions/phone";
import TwilioConnect from "~/features/settings/components/phone/twilio-connect";
import PhoneNumberForm from "~/features/settings/components/phone/phone-number-form";
import logger from "~/utils/logger.server";
import db from "~/utils/db.server";

export type PhoneSettingsLoaderData = {
	phoneNumbers: Pick<PhoneNumber, "id" | "number" | "isCurrent">[];
};

export const loader: LoaderFunction = async ({ request }) => {
	const { organizations } = await requireLoggedIn(request);
	const organization = organizations[0];
	if (!organization.twilioAccountSid) {
		logger.warn("Twilio account is not connected");
		return json<PhoneSettingsLoaderData>({ phoneNumbers: [] });
	}

	const phoneNumbers = await db.phoneNumber.findMany({
		where: { organizationId: organization.id },
		select: { id: true, number: true, isCurrent: true },
		orderBy: { id: Prisma.SortOrder.desc },
	});

	return json<PhoneSettingsLoaderData>({ phoneNumbers });
};

export const action = settingsPhoneAction;

function PhoneSettings() {
	return (
		<div className="flex flex-col space-y-6">
			<TwilioConnect />
			<PhoneNumberForm />
		</div>
	);
}

export default PhoneSettings;
