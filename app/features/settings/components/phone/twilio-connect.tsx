import { useState } from "react";
import { IoHelpCircle } from "react-icons/io5";

import HelpModal from "./help-modal";
import SettingsSection from "../settings-section";
import useSession from "~/features/core/hooks/use-session";

export default function TwilioConnect() {
	const { currentOrganization } = useSession();
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

	return (
		<>
			<SettingsSection className="flex flex-col relative">
				<section>
					<button onClick={() => setIsHelpModalOpen(true)} className="absolute top-2 right-2">
						<IoHelpCircle className="w-6 h-6 text-primary-700" />
					</button>
					<article className="mb-6">
						Shellphone needs to connect to your Twilio account to securely use your phone numbers.
					</article>

					{currentOrganization.twilioAccountSid === null ? (
						<a
							href="https://www.twilio.com/authorize/CN01675d385a9ee79e6aa58adf54abe3b3"
							rel="noopener noreferrer"
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
						>
							Connect Twilio account
						</a>
					) : (
						<p className="text-green-700">✓ Your Twilio account is connected to Shellphone.</p>
					)}
				</section>
			</SettingsSection>

			<HelpModal closeModal={() => setIsHelpModalOpen(false)} isHelpModalOpen={isHelpModalOpen} />
		</>
	);
}
