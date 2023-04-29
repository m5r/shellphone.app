import { type LoaderArgs, json } from "@remix-run/node";
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

const loader = async ({ request }: LoaderArgs) => {
	const { organization, twilio } = await requireLoggedIn(request);
	if (!twilio) {
		logger.warn("Twilio account is not connected");
		return json({ phoneNumbers: [] });
	}

	const phoneNumbers = await db.phoneNumber.findMany({
		where: { twilioAccount: { organizationId: organization.id } },
		select: { id: true, number: true, isCurrent: true },
		orderBy: { id: Prisma.SortOrder.desc },
	});

	return json({
		accountSid: twilio.accountSid,
		authToken: decrypt(twilio.authToken),
		phoneNumbers,
	});
};
export default loader;
