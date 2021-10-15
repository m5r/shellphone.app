import { useEffect } from "react";
import { useMutation, useQuery } from "blitz";
import { useForm } from "react-hook-form";

import setPhoneNumber from "../../mutations/set-phone-number";
import getAvailablePhoneNumbers from "../../queries/get-available-phone-numbers";
import useCurrentUser from "app/core/hooks/use-current-user";
import useUserPhoneNumber from "app/core/hooks/use-current-phone-number";
import Button from "../button";
import SettingsSection from "../settings-section";

type Form = {
	phoneNumberSid: string;
};

export default function PhoneNumberForm() {
	const { hasFilledTwilioCredentials } = useCurrentUser();
	const currentPhoneNumber = useUserPhoneNumber();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const [setPhoneNumberMutation] = useMutation(setPhoneNumber);
	const [availablePhoneNumbers] = useQuery(getAvailablePhoneNumbers, {}, { enabled: hasFilledTwilioCredentials });

	useEffect(() => {
		if (currentPhoneNumber) {
			setValue("phoneNumberSid", currentPhoneNumber.id);
		}
	}, [currentPhoneNumber]);

	const onSubmit = handleSubmit(async ({ phoneNumberSid }) => {
		if (isSubmitting) {
			return;
		}

		await setPhoneNumberMutation({ phoneNumberSid });
	});

	if (!hasFilledTwilioCredentials) {
		return null;
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6">
			<SettingsSection
				className="relative"
				footer={
					<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
						<Button variant="default" type="submit" isDisabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				}
			>
				<label htmlFor="phoneNumberSid" className="block text-sm font-medium text-gray-700">
					Phone number
				</label>
				<select
					id="phoneNumberSid"
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
					{...register("phoneNumberSid")}
				>
					<option value="none" />
					{availablePhoneNumbers?.map(({ sid, phoneNumber }) => (
						<option value={sid} key={sid}>
							{phoneNumber}
						</option>
					))}
				</select>
			</SettingsSection>
		</form>
	);
}
