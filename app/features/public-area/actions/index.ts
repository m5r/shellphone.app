import { type ActionFunction, json } from "@remix-run/node";

import { addSubscriber } from "~/utils/mailchimp.server";
import { executeWebhook } from "~/utils/discord.server";

export type JoinWaitlistActionData = { submitted: true };

const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get("email");
	if (!formData.get("email") || typeof email !== "string") {
		throw new Error("Something wrong happened");
	}

	// await addSubscriber(email);
	const res = await executeWebhook(email);
	console.log(res.status);
	console.log(await res.text());

	return json<JoinWaitlistActionData>({ submitted: true });
};

export default action;
