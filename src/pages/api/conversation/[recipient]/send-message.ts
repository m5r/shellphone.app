import Joi from "joi";

import { withApiAuthRequired } from "../../../../../lib/session-helpers";
import { insertMessage } from "../../../../database/message";
import type { ApiError } from "../../_types";
import appLogger from "../../../../../lib/logger";
import { findCustomerPhoneNumber } from "../../../../database/phone-number";
import { encrypt } from "../../../../database/_encryption";
import { findCustomer } from "../../../../database/customer";
import sendMessageQueue from "../../queue/send-message";

const logger = appLogger.child({ route: "/api/conversation" });

type Body = {
	to: string;
	content: string;
}

const querySchema = Joi.object<Body>({
	to: Joi.string().required(),
	content: Joi.string().required(),
});

export default withApiAuthRequired(async function sendMessageHandler(
	req,
	res,
	user,
) {
	if (req.method !== "POST") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["POST"]);
		res.status(statusCode).send(apiError);
		return;
	}

	const validationResult = querySchema.validate(req.body, { stripUnknown: true });
	const validationError = validationResult.error;
	if (validationError) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		};
		logger.error(validationError);

		res.status(statusCode).send(apiError);
		return;
	}

	const customerId = user.id;
	const customer = await findCustomer(customerId);
	const { phoneNumber } = await findCustomerPhoneNumber(customerId);
	const body: Body = validationResult.value;

	const sms = await insertMessage({
		from: phoneNumber,
		customerId: customerId,
		sentAt: new Date().toISOString(),
		direction: "outbound",
		status: "queued",
		content: encrypt(body.content, customer.encryptionKey),
		to: body.to,
	});
	await sendMessageQueue.enqueue({
		id: sms.id,
		customerId,
		to: body.to,
		content: body.content,
	}, {
		id: sms.id,
	});

	return res.status(200).end();
});
