import type { FunctionComponent } from "react";
import { useState } from "react";
import { useRouter } from "blitz";
import { useForm } from "react-hook-form";

import Alert from "./alert";
import Button from "./button";
import SettingsSection from "./settings-section";

import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ module: "update-password" });

type Form = {
	newPassword: string;
	newPasswordConfirmation: string;
};

const UpdatePassword: FunctionComponent = () => {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, isSubmitSuccessful },
	} = useForm<Form>();
	const [errorMessage, setErrorMessage] = useState("");

	const onSubmit = handleSubmit(async ({ newPassword, newPasswordConfirmation }) => {
		if (isSubmitting) {
			return;
		}

		if (newPassword !== newPasswordConfirmation) {
			setErrorMessage("New passwords don't match");
			return;
		}

		try {
			// TODO
			// await customer.updateUser({ password: newPassword });
		} catch (error: any) {
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
			title="Update Password"
			description="Make sure you are using a long, random password to stay secure."
		>
			<form onSubmit={onSubmit}>
				{errorMessage ? (
					<div className="mb-8">
						<Alert title="Oops, there was an issue" message={errorMessage} variant="error" />
					</div>
				) : null}

				{isSubmitSuccessful ? (
					<div className="mb-8">
						<Alert title="Saved successfully" message="Your changes have been saved." variant="success" />
					</div>
				) : null}

				<div className="shadow sm:rounded-md sm:overflow-hidden">
					<div className="px-4 py-5 bg-white space-y-6 sm:p-6">
						<div>
							<label
								htmlFor="newPassword"
								className="flex justify-between text-sm font-medium leading-5 text-gray-700"
							>
								<div>New password</div>
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="newPassword"
									type="password"
									tabIndex={3}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("newPassword")}
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="newPasswordConfirmation"
								className="flex justify-between text-sm font-medium leading-5 text-gray-700"
							>
								<div>Confirm new password</div>
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="newPasswordConfirmation"
									type="password"
									tabIndex={4}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("newPasswordConfirmation")}
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

export default UpdatePassword;
