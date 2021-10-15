import { NotFoundError, resolver } from "blitz";

import db from "db";
import twilio from "twilio";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
	if (!session.orgId) {
		throw new NotFoundError();
	}

	const organization = await db.organization.findFirst({ where: { id: session.orgId } });
	if (!organization || !organization.twilioAccountSid || !organization.twilioAuthToken) {
		throw new NotFoundError();
	}

	const incomingPhoneNumbers = await twilio(
		organization.twilioAccountSid,
		organization.twilioAuthToken,
	).incomingPhoneNumbers.list();
	return incomingPhoneNumbers.map(({ phoneNumber, sid }) => ({ phoneNumber, sid }));
});
