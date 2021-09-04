import { resolver, NotFoundError } from "blitz";
import Twilio from "twilio";

import db from "db";
import getCurrentPhoneNumber from "../../phone-numbers/queries/get-current-phone-number";

export default resolver.pipe(resolver.authorize(), async (_ = null, context) => {
	const phoneNumber = await getCurrentPhoneNumber({}, context);
	if (!phoneNumber) {
		throw new NotFoundError();
	}

	const organization = await db.organization.findFirst({
		where: { id: phoneNumber.organizationId },
	});
	if (
		!organization ||
		!organization.twilioAccountSid ||
		!organization.twilioAuthToken ||
		!organization.twilioApiKey ||
		!organization.twilioApiSecret ||
		!organization.twimlAppSid
	) {
		throw new NotFoundError();
	}

	const accessToken = new Twilio.jwt.AccessToken(
		organization.twilioAccountSid,
		organization.twilioApiKey,
		organization.twilioApiSecret,
		{ identity: `${context.session.orgId}__${context.session.userId}`, ttl: 3600 },
	);
	const grant = new Twilio.jwt.AccessToken.VoiceGrant({
		outgoingApplicationSid: organization.twimlAppSid,
		incomingAllow: true,
	});
	accessToken.addGrant(grant);

	return accessToken.toJwt();
});
