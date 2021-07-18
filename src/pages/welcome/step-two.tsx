import type { InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { withPageAuthRequired } from "../../../lib/session-helpers";
import OnboardingLayout from "../../components/welcome/onboarding-layout";
import clsx from "clsx";
import { findCustomer } from "../../database/customer";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

type Form = {
	twilioAccountSid: string;
	twilioAuthToken: string;
}

const StepTwo: NextPage<Props> = ({ accountSid, authToken }) => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const router = useRouter();

	useEffect(() => {
		setValue("twilioAuthToken", authToken);
		setValue("twilioAccountSid", accountSid);
	});

	const onSubmit = handleSubmit(async ({ twilioAccountSid, twilioAuthToken }) => {
		if (isSubmitting) {
			return;
		}

		await axios.post("/api/user/update-user", {
			twilioAccountSid,
			twilioAuthToken,
		}, { withCredentials: true });
		await router.push("/welcome/step-three");
	});
	const hasTwilioCredentials = accountSid.length > 0 && authToken.length > 0;

	return (
		<OnboardingLayout
			currentStep={2}
			next={hasTwilioCredentials ? { href: "/welcome/step-three", label: "Next" } : undefined}
			previous={{ href: "/welcome/step-one", label: "Back" }}
		>
			<div className="flex flex-col space-y-4 items-center">
				<form onSubmit={onSubmit} className="flex flex-col gap-6">
					<div className="w-full">
						<label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700">
							Twilio Account SID
						</label>
						<input
							type="text"
							id="twilioAccountSid"
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
							{...register("twilioAccountSid", { required: true })}
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
							{...register("twilioAuthToken", { required: true })}
						/>
					</div>

					<button
						type="submit"
						className={clsx(
							"max-w-[240px] mx-auto w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm",
							!isSubmitting && "bg-primary-600 hover:bg-primary-700",
							isSubmitting && "bg-primary-400 cursor-not-allowed",
						)}
					>
						Save
					</button>
				</form>
			</div>
		</OnboardingLayout>
	);
};

export const getServerSideProps = withPageAuthRequired(async (context, user) => {
	const customer = await findCustomer(user.id);

	return {
		props: {
			accountSid: customer.accountSid ?? "",
			authToken: customer.authToken ?? "",
		},
	};
});

export default StepTwo;
