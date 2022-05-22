import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { Prisma } from "@prisma/client";

import { requireLoggedIn } from "~/utils/auth.server";
import db from "~/utils/db.server";

export type KeypadLoaderData = {
	hasOngoingSubscription: boolean;
	hasPhoneNumber: boolean;
	lastRecipientCalled?: string;
};

const loader: LoaderFunction = async ({ request }) => {
	const { phoneNumber } = await requireLoggedIn(request);
	const hasOngoingSubscription = true; // TODO
	const hasPhoneNumber = Boolean(phoneNumber);
	const lastCall =
		phoneNumber &&
		(await db.phoneCall.findFirst({
			where: { phoneNumberId: phoneNumber.id },
			orderBy: { createdAt: Prisma.SortOrder.desc },
		}));
	return json<KeypadLoaderData>({
		hasOngoingSubscription,
		hasPhoneNumber,
		lastRecipientCalled: lastCall?.recipient,
	});
};

export default loader;
