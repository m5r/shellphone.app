import type { InferGetServerSidePropsType, NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import twilio from "twilio";
import { useForm } from "react-hook-form";
import axios from "axios";

import { withPageAuthRequired } from "../../../lib/session-helpers";

import OnboardingLayout from "../../components/welcome/onboarding-layout";
import { findCustomer } from "../../database/customer";
import clsx from "clsx";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

type Form = {
	phoneNumberSid: string;
}

const StepThree: NextPage<Props> = ({ hasTwilioCredentials, availablePhoneNumbers }) => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const router = useRouter();

	useEffect(() => {
		setValue("phoneNumberSid", availablePhoneNumbers[0].sid);
	});

	const onSubmit = handleSubmit(async ({ phoneNumberSid }) => {
		if (isSubmitting) {
			return;
		}

		await axios.post("/api/user/add-phone-number", { phoneNumberSid }, { withCredentials: true });
		await router.push("/messages");
	});

	if (!hasTwilioCredentials) {
		return (
			<OnboardingLayout
				currentStep={3}
				previous={{ href: "/welcome/step-two", label: "Back" }}
			>
				<div className="flex flex-col space-y-4 items-center">
					<span>You don&#39;t have any phone number, fill your Twilio credentials first</span>
				</div>
			</OnboardingLayout>
		)
	}

	return (
		<OnboardingLayout
			currentStep={3}
			previous={{ href: "/welcome/step-two", label: "Back" }}
		>
			<div className="flex flex-col space-y-4 items-center">
				<form onSubmit={onSubmit}>
					<label htmlFor="phoneNumberSid" className="block text-sm font-medium text-gray-700">
						Phone number
					</label>
					<select
						id="phoneNumberSid"
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
						{...register("phoneNumberSid")}
					>
						{availablePhoneNumbers.map(({ sid, phoneNumber }) => (
							<option value={sid} key={sid}>{phoneNumber}</option>
						))}
					</select>

					<button
						type="submit"
						className={clsx(
							"max-w-[240px] mt-6 mx-auto w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm",
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
	const hasTwilioCredentials = customer.accountSid?.length && customer.authToken?.length;
	const incomingPhoneNumbers = await twilio(customer.accountSid, customer.authToken)
		.incomingPhoneNumbers
		.list();
	const phoneNumbers = incomingPhoneNumbers.map(({ phoneNumber, sid }) => ({ phoneNumber, sid }));

	return {
		props: {
			hasTwilioCredentials,
			availablePhoneNumbers: phoneNumbers,
		},
	};
});

export default StepThree;
