import { useEffect } from "react";
import { useMutation, useQuery, withErrorBoundary } from "blitz";
import { useForm } from "react-hook-form";

import setPhoneNumber from "../../mutations/set-phone-number";
import getAvailablePhoneNumbers from "../../queries/get-available-phone-numbers";
import useCurrentUser from "app/core/hooks/use-current-user";
import useUserPhoneNumber from "app/core/hooks/use-current-phone-number";
import Button from "../button";
import SettingsSection from "../settings-section";
import Alert from "app/core/components/alert";

type Form = {
	phoneNumberSid: string;
};

export default withErrorBoundary(
	function PhoneNumberForm() {
		const { organization } = useCurrentUser();
		const currentPhoneNumber = useUserPhoneNumber();
		const {
			register,
			handleSubmit,
			setValue,
			formState: { isSubmitting },
		} = useForm<Form>();
		const [setPhoneNumberMutation, { error, isError, isSuccess }] = useMutation(setPhoneNumber);
		const hasFilledTwilioCredentials = Boolean(organization?.twilioAccountSid && organization?.twilioAuthToken);
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
					{isError ? (
						<div className="mb-8">
							<Alert
								title="Oops, there was an issue"
								message={parseErrorMessage(error as Error | null)}
								variant="error"
							/>
						</div>
					) : null}

					{isSuccess ? (
						<div className="mb-8">
							<Alert
								title="Saved successfully"
								message="Your changes have been saved."
								variant="success"
							/>
						</div>
					) : null}

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
	},
	{
		fallbackRender: ({ error, resetErrorBoundary }) => (
			<Alert
				variant="error"
				title="Authorization error"
				message={
					<>
						<p>
							We failed to fetch your Twilio phone numbers. Make sure both your SID and your auth token
							are valid and that your Twilio account isn&#39;t suspended.
							{error.moreInfo ? <a href={error.moreInfo}>Related Twilio docs</a> : null}
						</p>
						<button className="inline-flex pt-2 text-left" onClick={resetErrorBoundary}>
							<span className="transition-colors duration-150 border-b border-red-200 hover:border-red-500">
								Try again
							</span>
						</button>
					</>
				}
			/>
		),
		onError: (error) => console.log("error", error),
	},
);

function parseErrorMessage(error: Error | null): string {
	if (!error) {
		return "";
	}

	if (error.name === "ZodError") {
		return JSON.parse(error.message)[0].message;
	}

	return error.message;
}
