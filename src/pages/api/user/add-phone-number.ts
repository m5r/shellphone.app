import Joi from "joi";
import twilio from "twilio";

import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import appLogger from "../../../../lib/logger";
import { createPhoneNumber } from "../../../database/phone-number";
import { findCustomer } from "../../../database/customer";
import fetchMessagesQueue from "../queue/fetch-messages";

const logger = appLogger.child({ route: "/api/user/add-phone-number" });

type Body = {
	phoneNumberSid: string;
}

export default withApiAuthRequired(async function addPhoneNumberHandler(req, res, user) {
	const bodySchema = Joi.object<Body>({
		phoneNumberSid: Joi.string().required(),
	});

	const validationResult = bodySchema.validate(req.body, { stripUnknown: true });
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
	const phoneNumbers = await twilio(customer.accountSid, customer.authToken)
		.incomingPhoneNumbers
		.list();
	const { phoneNumberSid }: Body = validationResult.value;
	const phoneNumber = phoneNumbers.find(phoneNumber => phoneNumber.sid === phoneNumberSid)!;
	await createPhoneNumber({
		customerId,
		phoneNumberSid,
		phoneNumber: phoneNumber.phoneNumber,
	});

	await fetchMessagesQueue.enqueue({ customerId });

	return res.status(200).end();
});
