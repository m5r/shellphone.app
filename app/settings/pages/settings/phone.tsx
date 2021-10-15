import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes, dynamic } from "blitz";

import SettingsLayout from "../../components/settings-layout";
import PhoneNumberForm from "../../components/phone/phone-number-form";

const PhoneSettings: BlitzPage = () => {
	return (
		<div className="flex flex-col space-y-6">
			<Suspense fallback="Loading...">
				<TwilioApiForm />
				<PhoneNumberForm />
			</Suspense>
		</div>
	);
};

const TwilioApiForm = dynamic(() => import("../../components/phone/twilio-api-form"), {
	ssr: false,
	loading: () => null,
});

PhoneSettings.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

PhoneSettings.authenticate = { redirectTo: Routes.SignIn() };

export default PhoneSettings;
