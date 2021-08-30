import { getConfig, NotFoundError } from "blitz";
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

const { serverRuntimeConfig } = getConfig();

export const smsUrl = `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`;

export const voiceUrl = `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/call`;

export function getTwiMLName() {
	switch (serverRuntimeConfig.app.baseUrl) {
		case "local.shellphone.app":
			return "Shellphone LOCAL";
		case "dev.shellphone.app":
			return "Shellphone DEV";
		case "www.shellphone.app":
			return "Shellphone";
	}
}
