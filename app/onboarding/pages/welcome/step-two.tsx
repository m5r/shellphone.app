import type { FunctionComponent } from "react";
import { Suspense, useEffect } from "react";
import type { BlitzPage, GetServerSideProps } from "blitz";
import { getSession, Routes, useMutation, useRouter } from "blitz";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import db from "db";
import setTwilioApiFields from "../../mutations/set-twilio-api-fields";
import OnboardingLayout from "../../components/onboarding-layout";
import useCurrentCustomer from "../../../core/hooks/use-current-customer";

type Form = {
	twilioAccountSid: string;
	twilioAuthToken: string;
};

const StepTwo: BlitzPage = () => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const router = useRouter();
	const { customer } = useCurrentCustomer();
	const [setTwilioApiFieldsMutation] = useMutation(setTwilioApiFields);

	useEffect(() => {
		setValue("twilioAuthToken", customer?.authToken ?? "");
		setValue("twilioAccountSid", customer?.accountSid ?? "");
	}, [setValue, customer?.authToken, customer?.accountSid]);

	const onSubmit = handleSubmit(async ({ twilioAccountSid, twilioAuthToken }) => {
		if (isSubmitting) {
			return;
		}

		await setTwilioApiFieldsMutation({
			twilioAccountSid,
			twilioAuthToken,
		});

		await router.push(Routes.StepThree());
	});

	return (
		<div className="flex flex-col space-y-4 items-center">
			<form onSubmit={onSubmit} className="flex flex-col gap-6">
				<div className="w-full">
					<label
						htmlFor="twilioAccountSid"
						className="block text-sm font-medium text-gray-700"
					>
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
					<label
						htmlFor="twilioAuthToken"
						className="block text-sm font-medium text-gray-700"
					>
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
	);
};

StepTwo.getLayout = (page) => {
	return (
		<Suspense fallback="Silence, ca pousse">
			<StepTwoLayout>{page}</StepTwoLayout>
		</Suspense>
	);
};

const StepTwoLayout: FunctionComponent = ({ children }) => {
	const { customer } = useCurrentCustomer();
	const initialAuthToken = customer?.authToken ?? "";
	const initialAccountSid = customer?.accountSid ?? "";
	const hasTwilioCredentials = initialAccountSid.length > 0 && initialAuthToken.length > 0;

	return (
		<OnboardingLayout
			currentStep={2}
			next={
				hasTwilioCredentials
					? { href: Routes.StepThree().pathname, label: "Next" }
					: undefined
			}
			previous={{ href: Routes.StepOne().pathname, label: "Back" }}
		>
			{children}
		</OnboardingLayout>
	);
};

StepTwo.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getSession(req, res);
	if (!session.userId) {
		await session.$revoke();
		return {
			redirect: {
				destination: Routes.Home().pathname,
				permanent: false,
			},
		};
	}

	const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId: session.userId } });
	if (!phoneNumber) {
		return { props: {} };
	}

	return {
		redirect: {
			destination: Routes.Messages().pathname,
			permanent: false,
		},
	};
};

export default StepTwo;
