import { Form, useActionData, useCatch, useFetcher, useLoaderData, useTransition } from "@remix-run/react";
import { IoReloadOutline } from "react-icons/io5";

import Button from "../button";
import SettingsSection from "../settings-section";
import Alert from "~/features/core/components/alert";
import useSession from "~/features/core/hooks/use-session";
import type loader from "~/features/settings/loaders/phone";
import type { SetPhoneNumberActionData } from "~/features/settings/actions/phone";
import clsx from "clsx";

export default function PhoneNumberForm() {
	const { twilio } = useSession();
	const fetcher = useFetcher();
	const transition = useTransition();
	const actionData = useActionData<any>()?.setPhoneNumber;
	const availablePhoneNumbers = useLoaderData<typeof loader>().phoneNumbers;

	const actionSubmitted = transition.submission?.formData.get("_action");
	const isCurrentFormTransition =
		!!actionSubmitted && ["setPhoneNumber", "refreshPhoneNumbers"].includes(actionSubmitted.toString());
	const isSubmitting = isCurrentFormTransition && transition.state === "submitting";
	const isSuccess = actionData?.submitted === true;
	const errors = actionData?.errors;
	const topErrorMessage = errors?.general ?? errors?.phoneNumberSid;
	const isError = typeof topErrorMessage !== "undefined";
	const currentPhoneNumber = availablePhoneNumbers.find((phoneNumber) => phoneNumber.isCurrent === true);
	const hasFilledTwilioCredentials = twilio != null;

	if (!hasFilledTwilioCredentials) {
		return null;
	}

	return (
		<section className="relative">
			<button
				className={clsx("absolute top-2 right-2 z-10", { "animate-spin": fetcher.submission })}
				onClick={() => fetcher.submit({ _action: "refreshPhoneNumbers" }, { method: "post" })}
				disabled={!!fetcher.submission}
				title="Refresh the list of phone numbers from Twilio"
				aria-label="Refresh the list of phone numbers from Twilio"
			>
				<IoReloadOutline className="w-5 h-5 text-primary-700" aria-hidden="true" />
			</button>

			<Form method="post" className="flex flex-col gap-6">
				<SettingsSection
					className="relative"
					footer={
						<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
							<Button variant="default" type="submit" isDisabled={isSubmitting}>
								Save
							</Button>
						</div>
					}
				>
					{isError ? (
						<div className="mb-8">
							<Alert title="Oops, there was an issue" message={topErrorMessage} variant="error" />
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
						name="phoneNumberSid"
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
						defaultValue={currentPhoneNumber?.id}
					>
						<option value="none" />
						{availablePhoneNumbers.map(({ id, number }) => (
							<option value={id} key={id}>
								{number}
							</option>
						))}
					</select>

					<input type="hidden" name="_action" value="setPhoneNumber" />
				</SettingsSection>
			</Form>
		</section>
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
