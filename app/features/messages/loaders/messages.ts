import type { LoaderFunction } from "@remix-run/node";
import { type Message, Prisma, Direction, SubscriptionStatus } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";

export type MessagesLoaderData = {
	user: {
		hasFilledTwilioCredentials: boolean;
		hasPhoneNumber: boolean;
	};
	conversations: Record<string, Conversation> | undefined;
};

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

const loader: LoaderFunction = async ({ request }) => {
	const { id, organizations } = await requireLoggedIn(request);
	const user = await db.user.findFirst({
		where: { id },
		select: {
			id: true,
			fullName: true,
			email: true,
			role: true,
			memberships: {
				include: {
					organization: {
						include: {
							subscriptions: {
								where: {
									OR: [
										{ status: { not: SubscriptionStatus.deleted } },
										{
											status: SubscriptionStatus.deleted,
											cancellationEffectiveDate: { gt: new Date() },
										},
									],
								},
								orderBy: { lastEventTime: Prisma.SortOrder.desc },
							},
						},
					},
				},
			},
		},
	});
	const organization = user!.memberships[0]!.organization;
	// const hasFilledTwilioCredentials = Boolean(organization?.twilioAccountSid && organization?.twilioAuthToken);
};

export default loader;
