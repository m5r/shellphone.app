import { type LoaderFunction, json } from "@remix-run/node";
import { type PhoneNumber, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";
import logger from "~/utils/logger.server";
import { decrypt } from "~/utils/encryption";

export type PhoneSettingsLoaderData = {
	accountSid?: string;
	authToken?: string;
	phoneNumbers: Pick<PhoneNumber, "id" | "number" | "isCurrent">[];
};

const loader: LoaderFunction = async ({ request }) => {
	const { organization, twilio } = await requireLoggedIn(request);
	if (!twilio) {
		logger.warn("Twilio account is not connected");
		return json<PhoneSettingsLoaderData>({ phoneNumbers: [] });
	}

	const phoneNumbers = await db.phoneNumber.findMany({
		where: { organizationId: organization.id },
		select: { id: true, number: true, isCurrent: true },
		orderBy: { id: Prisma.SortOrder.desc },
	});

	return json<PhoneSettingsLoaderData>({
		accountSid: twilio.accountSid,
		authToken: decrypt(twilio.authToken),
		phoneNumbers,
	});
};
export default loader;
