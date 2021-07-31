import type { FunctionComponent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "blitz";
import { useForm } from "react-hook-form";

import Alert from "./alert";
import Button from "./button";
import SettingsSection from "./settings-section";
import useCurrentCustomer from "../../core/hooks/use-current-customer";

import appLogger from "../../../integrations/logger";

type Form = {
	name: string;
	email: string;
};

const logger = appLogger.child({ module: "profile-settings" });

const ProfileInformations: FunctionComponent = () => {
	const { customer } = useCurrentCustomer();
	const router = useRouter();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting, isSubmitSuccessful },
	} = useForm<Form>();
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		setValue("name", customer?.user.name ?? "");
		setValue("email", customer?.user.email ?? "");
	}, [setValue, customer]);

	const onSubmit = handleSubmit(async ({ name, email }) => {
		if (isSubmitting) {
			return;
		}

		try {
			// TODO
			// await customer.updateUser({ email, data: { name } });
		} catch (error) {
			logger.error(error.response, "error updating user infos");

			if (error.response.status === 401) {
				logger.error("session expired, redirecting to sign in page");
				return router.push("/auth/sign-in");
			}

			setErrorMessage(error.response.data.errorMessage);
		}
	});

	return (
		<SettingsSection
			title="Profile Information"
			description="Update your account's profile information and email address."
		>
			<form onSubmit={onSubmit}>
				{errorMessage ? (
					<div className="mb-8">
						<Alert
							title="Oops, there was an issue"
							message={errorMessage}
							variant="error"
						/>
					</div>
				) : null}

				{isSubmitSuccessful ? (
					<div className="mb-8">
						<Alert
							title="Saved successfully"
							message="Your changes have been saved."
							variant="success"
						/>
					</div>
				) : null}

				<div className="shadow sm:rounded-md sm:overflow-hidden">
					<div className="px-4 py-5 bg-white space-y-6 sm:p-6">
						<div className="col-span-3 sm:col-span-2">
							<label
								htmlFor="name"
								className="block text-sm font-medium leading-5 text-gray-700"
							>
								Name
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="name"
									type="text"
									tabIndex={1}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("name")}
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-5 text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="email"
									type="email"
									tabIndex={2}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("email")}
									required
								/>
							</div>
						</div>
					</div>

					<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
						<Button variant="default" type="submit" isDisabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>
			</form>
		</SettingsSection>
	);
};

export default ProfileInformations;
