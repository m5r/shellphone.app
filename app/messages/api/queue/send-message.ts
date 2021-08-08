import { Queue } from "quirrel/blitz";

import db, { MessageStatus } from "../../../../db";
import getTwilioClient from "../../../../integrations/twilio";

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
		if (!organization || !phoneNumber) {
			return;
		}

		const twilioClient = getTwilioClient(organization);
		try {
			const message = await twilioClient.messages.create({
				body: content,
				to,
				from: phoneNumber.number,
			});
			await db.message.update({
				where: { organizationId_phoneNumberId_id: { id, organizationId, phoneNumberId } },
				data: { id: message.sid },
			});
		} catch (error) {
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
