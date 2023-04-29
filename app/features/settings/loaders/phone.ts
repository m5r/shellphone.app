import { type LoaderArgs, json } from "@remix-run/node";
import { type PhoneNumber, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { decrypt } from "~/utils/encryption";
import { getSession } from "~/utils/session.server";

export type PhoneSettingsLoaderData = {
	accountSid?: string;
	authToken?: string;
	phoneNumbers: Pick<PhoneNumber, "id" | "number" | "isCurrent">[];
};

const loader = async ({ request }: LoaderArgs) => {
	const session = await getSession(request);
	const twilio = session.get("twilio");
	if (!twilio) {
		logger.warn("Twilio account is not connected");
		return json({ phoneNumbers: [] });
	}

	const phoneNumbers = await db.phoneNumber.findMany({
		where: { twilioAccount: { accountSid: twilio.accountSid } },
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
