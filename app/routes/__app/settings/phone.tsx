import settingsPhoneAction from "~/features/settings/actions/phone";
import settingsPhoneLoader from "~/features/settings/loaders/phone";
import TwilioConnect from "~/features/settings/components/phone/twilio-connect";
import PhoneNumberForm from "~/features/settings/components/phone/phone-number-form";

export const loader = settingsPhoneLoader;

export const action = settingsPhoneAction;

function PhoneSettings() {
	return (
		<div className="flex flex-col space-y-6">
			<TwilioConnect />
			<PhoneNumberForm />
		</div>
	);
}

export default PhoneSettings;
