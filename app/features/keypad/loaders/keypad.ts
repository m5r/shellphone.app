import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { getSession } from "~/utils/session.server";

export type KeypadLoaderData = {
	hasPhoneNumber: boolean;
	lastRecipientCalled?: string;
};

const loader: LoaderFunction = async ({ request }) => {
	const session = await getSession(request);
	const twilio = session.get("twilio");
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { twilioAccountSid_isCurrent: { twilioAccountSid: twilio?.accountSid ?? "", isCurrent: true } },
	});
	const hasPhoneNumber = Boolean(phoneNumber);
	const lastCall =
		phoneNumber &&
		(await db.phoneCall.findFirst({
			where: { phoneNumberId: phoneNumber.id },
			orderBy: { createdAt: Prisma.SortOrder.desc },
		}));
	return json<KeypadLoaderData>(
		{
			hasPhoneNumber,
			lastRecipientCalled: lastCall?.recipient,
		},
		{
			headers: { Vary: "Cookie" },
		},
	);
};

export default loader;
