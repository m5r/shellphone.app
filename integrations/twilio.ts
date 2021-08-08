import { NotFoundError } from "blitz";
import twilio from "twilio";

import type { Organization } from "db";

type MinimalOrganization = Pick<Organization, "twilioAccountSid" | "twilioApiKey" | "twilioApiSecret">;

export default function getTwilioClient(organization: MinimalOrganization | null): twilio.Twilio {
	if (
		!organization ||
		!organization.twilioAccountSid ||
		!organization.twilioApiKey ||
		!organization.twilioApiSecret
	) {
		throw new NotFoundError();
	}

	return twilio(organization.twilioApiKey, organization.twilioApiSecret, {
		accountSid: organization.twilioAccountSid,
	});
}
