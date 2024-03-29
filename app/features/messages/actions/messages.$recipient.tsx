import { type ActionFunction } from "@remix-run/node";
import { json } from "superjson-remix";

import db from "~/utils/db.server";
import getTwilioClient, { translateMessageDirection, translateMessageStatus } from "~/utils/twilio.server";
import { getSession } from "~/utils/session.server";

type NewMessageActionData = {};

const action: ActionFunction = async ({ params, request }) => {
	const session = await getSession(request);
	const twilio = session.get("twilio");
	if (!twilio) {
		throw new Error("unreachable");
	}

	const [phoneNumber, twilioAccount] = await Promise.all([
		db.phoneNumber.findUnique({
			where: { twilioAccountSid_isCurrent: { twilioAccountSid: twilio.accountSid, isCurrent: true } },
		}),
		db.twilioAccount.findUnique({ where: { accountSid: twilio.accountSid } }),
	]);
	if (!phoneNumber || !twilioAccount) {
		throw new Error("unreachable");
	}

	const recipient = decodeURIComponent(params.recipient ?? "");
	const formData = Object.fromEntries(await request.formData());
	const twilioClient = getTwilioClient(twilioAccount);
	try {
		const message = await twilioClient.messages.create({
			body: formData.content.toString(),
			to: recipient,
			from: phoneNumber.number,
		});
		await db.message.create({
			data: {
				phoneNumberId: phoneNumber.id,
				id: message.sid,
				to: message.to,
				recipient: message.to,
				from: message.from,
				status: translateMessageStatus(message.status),
				direction: translateMessageDirection(message.direction),
				sentAt: new Date(message.dateCreated),
				content: message.body,
			},
		});
	} catch (error: any) {
		// TODO: handle twilio error
		console.log(error.code); // 21211
		console.log(error.moreInfo); // https://www.twilio.com/docs/errors/21211
		console.log(JSON.stringify(error));
		throw error;
		/*await db.message.update({
			where: { id },
			data: { status: MessageStatus.Error /!*errorMessage: "Reason: failed because of"*!/ },
		});*/
	}

	return json<NewMessageActionData>({});
};

export default action;
