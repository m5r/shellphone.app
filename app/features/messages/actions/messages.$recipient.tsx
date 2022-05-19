import { type ActionFunction } from "@remix-run/node";
import { json } from "superjson-remix";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";
import getTwilioClient, { translateMessageDirection, translateMessageStatus } from "~/utils/twilio.server";

export type NewMessageActionData = {};

const action: ActionFunction = async ({ params, request }) => {
	const user = await requireLoggedIn(request);
	const organization = user.organizations[0];
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { organizationId_isCurrent: { organizationId: user.organizations[0].id, isCurrent: true } },
	});
	const recipient = decodeURIComponent(params.recipient ?? "");
	const formData = Object.fromEntries(await request.formData());

	const { twilioAccountSid, twilioSubAccountSid } = organization;
	// const twilioClient = getTwilioClient({ twilioSubAccountSid, twilioAccountSid });
	const twilioClient = getTwilioClient({ twilioSubAccountSid: twilioAccountSid, twilioAccountSid });
	try {
		console.log({ twilioAccountSid, twilioSubAccountSid });
		console.log({
			body: formData.content.toString(),
			to: recipient,
			from: phoneNumber!.number,
		});
		const message = await twilioClient.messages.create({
			body: formData.content.toString(),
			to: recipient,
			from: phoneNumber!.number,
		});
		await db.message.create({
			data: {
				phoneNumberId: phoneNumber!.id,
				id: message.sid,
				to: message.to,
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
