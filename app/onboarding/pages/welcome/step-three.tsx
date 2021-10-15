import type { BlitzPage, GetServerSideProps } from "blitz";
import { Routes, getSession, useRouter, useMutation } from "blitz";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import twilio from "twilio";

import db from "../../../../db";
import OnboardingLayout from "../../components/onboarding-layout";
import setPhoneNumber from "../../mutations/set-phone-number";

type PhoneNumber = {
	phoneNumber: string;
	sid: string;
};

type Props = {
	availablePhoneNumbers: PhoneNumber[];
};

type Form = {
	phoneNumberSid: string;
};

const StepThree: BlitzPage<Props> = ({ availablePhoneNumbers }) => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const router = useRouter();
	const [setPhoneNumberMutation] = useMutation(setPhoneNumber);

	useEffect(() => {
		if (availablePhoneNumbers[0]) {
			setValue("phoneNumberSid", availablePhoneNumbers[0].sid);
		}
	});

	const onSubmit = handleSubmit(async ({ phoneNumberSid }) => {
		if (isSubmitting) {
			return;
		}

		await setPhoneNumberMutation({ phoneNumberSid });
		await router.push(Routes.Messages());
	});

	return (
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
						<option value={sid} key={sid}>
							{phoneNumber}
						</option>
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
	);
};

StepThree.getLayout = (page) => (
	<OnboardingLayout currentStep={3} previous={{ href: Routes.StepTwo().pathname, label: "Back" }}>
		{page}
	</OnboardingLayout>
);

StepThree.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const session = await getSession(req, res);
	if (!session.userId) {
		await session.$revoke();
		return {
			redirect: {
				destination: Routes.LandingPage().pathname,
				permanent: false,
			},
		};
	}

	const phoneNumber = await db.phoneNumber.findFirst({ where: { organizationId: session.orgId } });
	if (phoneNumber) {
		return {
			redirect: {
				destination: Routes.Messages().pathname,
				permanent: false,
			},
		};
	}

	const organization = await db.organization.findFirst({ where: { id: session.orgId } });
	if (!organization) {
		return {
			redirect: {
				destination: Routes.StepOne().pathname,
				permanent: false,
			},
		};
	}

	if (!organization.twilioAccountSid || !organization.twilioAuthToken) {
		return {
			redirect: {
				destination: Routes.StepTwo().pathname,
				permanent: false,
			},
		};
	}

	const incomingPhoneNumbers = await twilio(
		organization.twilioAccountSid,
		organization.twilioAuthToken,
	).incomingPhoneNumbers.list();
	const phoneNumbers = incomingPhoneNumbers.map(({ phoneNumber, sid }) => ({ phoneNumber, sid }));

	return {
		props: {
			availablePhoneNumbers: phoneNumbers,
		},
	};
};

export default StepThree;
