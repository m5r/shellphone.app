import { type LoaderFunction, json } from "@remix-run/node";

import TwilioConnect from "~/features/settings/components/phone/twilio-connect";
import PhoneNumberForm from "~/features/settings/components/phone/phone-number-form";
import { requireLoggedIn } from "~/utils/auth.server";
import getTwilioClient from "~/utils/twilio.server";

export type PhoneSettingsLoaderData = {
	phoneNumbers: {
		phoneNumber: string;
		sid: string;
	}[];
}

export const loader: LoaderFunction = async ({ request }) => {
	const { organizations } = await requireLoggedIn(request);
	const organization = organizations[0];
	if (!organization.twilioAccountSid) {
		throw new Error("Twilio account is not connected");
	}

	const twilioClient = getTwilioClient(organization);
	const incomingPhoneNumbers = await twilioClient.incomingPhoneNumbers.list();
	const phoneNumbers = incomingPhoneNumbers.map(({ phoneNumber, sid }) => ({ phoneNumber, sid }));

	return json<PhoneSettingsLoaderData>({ phoneNumbers });
};

function PhoneSettings() {
	return (
		<div className="flex flex-col space-y-6">
			<TwilioConnect />
			<PhoneNumberForm />
		</div>
	);
}

export default PhoneSettings;
