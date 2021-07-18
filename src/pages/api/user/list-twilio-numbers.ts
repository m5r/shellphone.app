import Joi from "joi";
import twilio from "twilio";

import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import appLogger from "../../../../lib/logger";
import { createPhoneNumber } from "../../../database/phone-number";
import { findCustomer } from "../../../database/customer";

const logger = appLogger.child({ route: "/api/user/list-twilio-numbers" });

export default withApiAuthRequired(async function listTwilioNumbersHandler(req, res, user) {
	const customer = await findCustomer(user.id);
	const phoneNumbers = await twilio(customer.accountSid, customer.authToken)
		.incomingPhoneNumbers
		.list();

	return res.status(200).send({
		phoneNumbers: phoneNumbers.map(({ phoneNumber, sid }) => ({ phoneNumber, sid })),
	});
});
