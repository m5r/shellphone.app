import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db, { Direction, MessageStatus, SubscriptionStatus } from "../../../db";
import { encrypt } from "../../../db/_encryption";
import sendMessageQueue from "../../messages/api/queue/send-message";
import appLogger from "../../../integrations/logger";
import getTwilioClient from "../../../integrations/twilio";

const logger = appLogger.child({ mutation: "send-message" });

const Body = z.object({
	content: z.string(),
	to: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ content, to }, context) => {
	const organizationId = context.session.orgId;
	const organization = await db.organization.findFirst({
		where: { id: organizationId },
		include: { phoneNumbers: true },
	});
	if (!organization) {
		throw new NotFoundError();
	}

	const twilioClient = getTwilioClient(organization);
	try {
		await twilioClient.lookups.v1.phoneNumbers(to).fetch();
	} catch (error: any) {
		logger.error(error);
		return;
	}

	const phoneNumber = organization.phoneNumbers[0]; // TODO: use the active number, not the first one
	if (!phoneNumber) {
		throw new NotFoundError();
	}

	const subscription = await db.subscription.findFirst({
		where: {
			organizationId,
			OR: [
				{ status: { not: SubscriptionStatus.deleted } },
				{ status: SubscriptionStatus.deleted, cancellationEffectiveDate: { gt: new Date() } },
			],
		},
	});

	const hasOngoingSubscription = Boolean(subscription);
	const messageBody = hasOngoingSubscription
		? content
		: content + "\n\nSent from Shellphone (https://www.shellphone.app)";
	const phoneNumberId = phoneNumber.id;
	const message = await db.message.create({
		data: {
			organizationId,
			phoneNumberId,
			to,
			from: phoneNumber.number,
			direction: Direction.Outbound,
			status: MessageStatus.Queued,
			content: encrypt(messageBody, organization.encryptionKey),
			sentAt: new Date(),
		},
	});

	await sendMessageQueue.enqueue(
		{
			id: message.id,
			organizationId,
			phoneNumberId,
			to,
			content: messageBody,
		},
		{
			id: `insert-${message.id}-${organizationId}-${phoneNumberId}`,
		},
	);
});
