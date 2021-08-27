import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db, { MessageStatus } from "../../../../db";

type Payload = {
	id: string;
	organizationId: string;
	phoneNumberId: string;
	to: string;
	content: string;
};

const sendMessageQueue = Queue<Payload>(
	"api/queue/send-message",
	async ({ id, organizationId, phoneNumberId, to, content }) => {
		const organization = await db.organization.findFirst({
			where: { id: organizationId },
			include: { phoneNumbers: true },
		});
		const phoneNumber = organization?.phoneNumbers.find((phoneNumber) => phoneNumber.id === phoneNumberId);
		if (!organization || !organization.twilioAccountSid || !organization.twilioAuthToken || !phoneNumber) {
			return;
		}

		try {
			const message = await twilio(organization.twilioAccountSid, organization.twilioAuthToken).messages.create({
				body: content,
				to,
				from: phoneNumber.number,
			});
			await db.message.update({
				where: { organizationId_phoneNumberId_id: { id, organizationId, phoneNumberId } },
				data: { id: message.sid },
			});
		} catch (error: any) {
			// TODO: handle twilio error
			console.log(error.code); // 21211
			console.log(error.moreInfo); // https://www.twilio.com/docs/errors/21211
			await db.message.update({
				where: { id },
				data: { status: MessageStatus.Error /*errorMessage: "Reason: failed because of"*/ },
			});
		}
	},
	{
		retry: ["1min"],
	},
);

export default sendMessageQueue;
