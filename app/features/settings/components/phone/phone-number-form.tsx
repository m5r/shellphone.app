import { useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";

import Button from "../button";
import SettingsSection from "../settings-section";
import Alert from "~/features/core/components/alert";
import useSession from "~/features/core/hooks/use-session";
import { PhoneSettingsLoaderData } from "~/routes/__app/settings/phone";

export default function PhoneNumberForm() {
	const transition = useTransition();
	const actionData = useActionData();
	const { currentOrganization } = useSession();

	const isSubmitting = transition.state === "submitting";
	const isSuccess = actionData?.submitted === true;
	const error = actionData?.error;
	const isError = !!error;

	const hasFilledTwilioCredentials = Boolean(currentOrganization.twilioAccountSid)
	const availablePhoneNumbers = useLoaderData<PhoneSettingsLoaderData>().phoneNumbers;

	const onSubmit = async () => {
		// await setPhoneNumberMutation({ phoneNumberSid }); // TODO
	};

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
						<Alert title="Oops, there was an issue" message={error} variant="error" />
					</div>
				) : null}

				{isSuccess ? (
					<div className="mb-8">
						<Alert title="Saved successfully" message="Your changes have been saved." variant="success" />
					</div>
				) : null}

				<label htmlFor="phoneNumberSid" className="block text-sm font-medium text-gray-700">
					Phone number
				</label>
				<select
					id="phoneNumberSid"
					name="phoneNumberSid"
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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

export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Alert
			variant="error"
			title="Authorization error"
			message={
				<>
					<p>
						We failed to fetch your Twilio phone numbers. Make sure both your SID and your auth token are
						valid and that your Twilio account isn&#39;t suspended.
						{caught.data ? <a href={caught.data.moreInfo}>Related Twilio docs</a> : null}
					</p>
					<button className="inline-flex pt-2 text-left" onClick={window.location.reload}>
						<span className="transition-colors duration-150 border-b border-red-200 hover:border-red-500">
							Try again
						</span>
					</button>
				</>
			}
		/>
	);
}
