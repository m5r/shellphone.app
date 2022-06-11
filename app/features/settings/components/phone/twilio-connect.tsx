import { useState } from "react";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { IoHelpCircle } from "react-icons/io5";

import type { PhoneSettingsLoaderData } from "~/features/settings/loaders/phone";
import type { SetTwilioCredentialsActionData } from "~/features/settings/actions/phone";
import HelpModal from "./help-modal";
import SettingsSection from "../settings-section";
import useSession from "~/features/core/hooks/use-session";
import Alert from "~/features/core/components/alert";
import LabeledTextField from "~/features/core/components/labeled-text-field";
import Button from "~/features/settings/components/button";

export default function TwilioConnect() {
	const { twilio } = useSession();
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const transition = useTransition();
	const actionData = useActionData<SetTwilioCredentialsActionData>()?.setTwilioCredentials;
	const { accountSid, authToken } = useLoaderData<PhoneSettingsLoaderData>();

	const topErrorMessage = actionData?.errors?.general;
	const isError = typeof topErrorMessage !== "undefined";
	const isCurrentFormTransition = transition.submission?.formData.get("_action") === "setTwilioCredentials";
	const isSubmitting = isCurrentFormTransition && transition.state === "submitting";

	return (
		<>
			<Form method="post">
				<SettingsSection
					className="flex flex-col relative"
					footer={
						<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
							<Button tabIndex={3} variant="default" type="submit" isDisabled={isSubmitting}>
								Save
							</Button>
						</div>
					}
				>
					<button onClick={() => setIsHelpModalOpen(true)} className="absolute top-2 right-2">
						<IoHelpCircle className="w-6 h-6 text-primary-700" />
					</button>
					<article className="mb-6">
						Shellphone needs some informations about your Twilio account to securely use your phone numbers.
					</article>

					{twilio !== null ? (
						<p className="text-green-700">✓ Your Twilio account is connected to Shellphone.</p>
					) : null}

					{isError ? (
						<div className="mb-8">
							<Alert title="Oops, there was an issue" message={topErrorMessage} variant="error" />
						</div>
					) : null}

					<LabeledTextField
						name="twilioAccountSid"
						label="Account SID"
						type="text"
						tabIndex={1}
						error={actionData?.errors?.twilioAccountSid}
						disabled={isSubmitting}
						defaultValue={accountSid}
					/>

					<LabeledTextField
						name="twilioAuthToken"
						label="Auth Token"
						type="password"
						tabIndex={2}
						error={actionData?.errors?.twilioAuthToken}
						disabled={isSubmitting}
						autoComplete="off"
						defaultValue={authToken}
					/>

					<input type="hidden" name="_action" value="setTwilioCredentials" />
				</SettingsSection>
			</Form>

			<HelpModal closeModal={() => setIsHelpModalOpen(false)} isHelpModalOpen={isHelpModalOpen} />
		</>
	);
}
