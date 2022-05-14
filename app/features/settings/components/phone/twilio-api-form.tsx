import { useState } from "react";
import { useTransition } from "@remix-run/react";
import { IoHelpCircle } from "react-icons/io5";

import HelpModal from "./help-modal";
import Button from "../button";
import SettingsSection from "../settings-section";

export default function TwilioApiForm() {
	const transition = useTransition();
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const isSubmitting = transition.state === "submitting";

	const onSubmit = async () => {
		// await setTwilioApiFieldsMutation({ twilioAccountSid, twilioAuthToken }); // TODO
	};

	return (
		<>
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
					<button onClick={() => setIsHelpModalOpen(true)} className="absolute top-2 right-2">
						<IoHelpCircle className="w-6 h-6 text-primary-700" />
					</button>
					<article>
						Shellphone needs some informations about your Twilio account to securely use your phone numbers.
					</article>

					<div className="w-full">
						<label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700">
							Twilio Account SID
						</label>
						<input
							id="twilioAccountSid"
							name="twilioAccountSid"
							type="text"
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
						/>
					</div>
					<div className="w-full">
						<label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700">
							Twilio Auth Token
						</label>
						<input
							id="twilioAuthToken"
							name="twilioAuthToken"
							type="text"
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
						/>
					</div>
				</SettingsSection>
			</form>

			<HelpModal closeModal={() => setIsHelpModalOpen(false)} isHelpModalOpen={isHelpModalOpen} />
		</>
	);
}
