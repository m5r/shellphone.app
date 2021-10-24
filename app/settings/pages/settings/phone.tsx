import type { BlitzPage } from "blitz";
import { dynamic } from "blitz";

import SettingsLayout from "../../components/settings-layout";
import PhoneNumberForm from "../../components/phone/phone-number-form";

const PhoneSettings: BlitzPage = () => {
	return (
		<div className="flex flex-col space-y-6">
			<TwilioApiForm />
			<PhoneNumberForm />
		</div>
	);
};

const TwilioApiForm = dynamic(() => import("../../components/phone/twilio-api-form"), {
	ssr: false,
	loading: () => null,
});

PhoneSettings.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default PhoneSettings;
