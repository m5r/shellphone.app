import { useEffect, useState } from "react";
import { useMutation } from "blitz";
import { useForm } from "react-hook-form";
import { IoHelpCircle } from "react-icons/io5";

import setTwilioApiFields from "../../mutations/set-twilio-api-fields";
import useCurrentUser from "app/core/hooks/use-current-user";
import HelpModal from "./help-modal";
import Button from "../button";
import SettingsSection from "../settings-section";

type Form = {
	twilioAccountSid: string;
	twilioAuthToken: string;
};

export default function TwilioApiForm() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const { organization, refetch } = useCurrentUser();
	const [setTwilioApiFieldsMutation] = useMutation(setTwilioApiFields);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

	useEffect(() => {
		setValue("twilioAuthToken", organization?.twilioAuthToken ?? "");
		setValue("twilioAccountSid", organization?.twilioAccountSid ?? "");
	}, [setValue, organization?.twilioAuthToken, organization?.twilioAccountSid]);

	const onSubmit = handleSubmit(async ({ twilioAccountSid, twilioAuthToken }) => {
		if (isSubmitting) {
			return;
		}

		await setTwilioApiFieldsMutation({ twilioAccountSid, twilioAuthToken });
		await refetch();
	});

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
							type="text"
							id="twilioAccountSid"
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
							{...register("twilioAccountSid", { required: false })}
						/>
					</div>
					<div className="w-full">
						<label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700">
							Twilio Auth Token
						</label>
						<input
							type="text"
							id="twilioAuthToken"
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
							{...register("twilioAuthToken", { required: false })}
						/>
					</div>
				</SettingsSection>
			</form>

			<HelpModal closeModal={() => setIsHelpModalOpen(false)} isHelpModalOpen={isHelpModalOpen} />
		</>
	);
}
