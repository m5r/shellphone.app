import { resolver } from "blitz";
import { z } from "zod";
import twilio from "twilio";

import db, { Direction, MessageStatus } from "../../../db";
import getCurrentCustomer from "../../customers/queries/get-current-customer";
import getCustomerPhoneNumber from "../../phone-numbers/queries/get-customer-phone-number";
import { encrypt } from "../../../db/_encryption";
import sendMessageQueue from "../../messages/api/queue/send-message";
import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ mutation: "send-message" });

const Body = z.object({
	content: z.string(),
	to: z.string(),
});

export default resolver.pipe(
	resolver.zod(Body),
	resolver.authorize(),
	async ({ content, to }, context) => {
		const customer = await getCurrentCustomer(null, context);
		try {
			await twilio(customer!.accountSid!, customer!.authToken!)
				.lookups.v1.phoneNumbers(to)
				.fetch();
		} catch (error) {
			logger.error(error);
			return;
		}

		const customerId = customer!.id;
		const customerPhoneNumber = await getCustomerPhoneNumber({ customerId }, context);

		const message = await db.message.create({
			data: {
				customerId,
				to,
				from: customerPhoneNumber!.phoneNumber,
				direction: Direction.Outbound,
				status: MessageStatus.Queued,
				content: encrypt(content, customer!.encryptionKey),
				sentAt: new Date(),
			},
		});

		await sendMessageQueue.enqueue(
			{
				id: message.id,
				customerId,
				to,
				content,
			},
			{
				id: message.id,
			}
		);
	}
);
