import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db, { Direction, MessageStatus } from "../../../db";
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

	const phoneNumber = organization.phoneNumbers[0];
	if (!phoneNumber) {
		return;
	}

	const phoneNumberId = phoneNumber.id;
	const message = await db.message.create({
		data: {
			organizationId,
			phoneNumberId,
			to,
			from: phoneNumber.number,
			direction: Direction.Outbound,
			status: MessageStatus.Queued,
			content: encrypt(content, organization.encryptionKey),
			sentAt: new Date(),
		},
	});

	await sendMessageQueue.enqueue(
		{
			id: message.id,
			organizationId,
			phoneNumberId,
			to,
			content,
		},
		{
			id: `insert-${message.id}-${organizationId}-${phoneNumberId}`,
		},
	);
});
