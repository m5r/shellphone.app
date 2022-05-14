import TwilioApiForm from "~/features/settings/components/phone/twilio-api-form";
import PhoneNumberForm from "~/features/settings/components/phone/phone-number-form";

function PhoneSettings() {
	return (
		<div className="flex flex-col space-y-6">
			<TwilioApiForm />
			<PhoneNumberForm />
		</div>
	);
}

export default PhoneSettings;
