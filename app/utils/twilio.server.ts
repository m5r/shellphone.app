import twilio from "twilio";

import type { Organization } from "@prisma/client";
import serverConfig from "~/config/config.server";

type MinimalOrganization = Pick<Organization, "twilioSubAccountSid" | "twilioAccountSid">;

export default function getTwilioClient(organization: MinimalOrganization): twilio.Twilio {
	if (!organization || !organization.twilioSubAccountSid || !organization.twilioAccountSid) {
		throw new Error("unreachable");
	}

	return twilio(organization.twilioSubAccountSid, serverConfig.twilio.authToken, {
		accountSid: organization.twilioAccountSid,
	});
}
