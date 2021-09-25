import type { FunctionComponent } from "react";
import { useEffect, useState } from "react";
import { useMutation } from "blitz";
import { useForm } from "react-hook-form";

import updateUser from "../mutations/update-user";
import Alert from "../../core/components/alert";
import Button from "./button";
import SettingsSection from "./settings-section";
import useCurrentUser from "../../core/hooks/use-current-user";

import appLogger from "../../../integrations/logger";

type Form = {
	name: string;
	email: string;
};

const logger = appLogger.child({ module: "profile-settings" });

const ProfileInformations: FunctionComponent = () => {
	const { user } = useCurrentUser();
	const updateUserMutation = useMutation(updateUser)[0];
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting, isSubmitSuccessful },
	} = useForm<Form>();
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		setValue("name", user?.name ?? "");
		setValue("email", user?.email ?? "");
	}, [setValue, user]);

	const onSubmit = handleSubmit(async ({ name, email }) => {
		if (isSubmitting) {
			return;
		}

		try {
			await updateUserMutation({ email, name });
		} catch (error: any) {
			logger.error(error.response, "error updating user infos");
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
						<div className="col-span-3 sm:col-span-2">
							<label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
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
							<label htmlFor="email" className="block text-sm font-medium leading-5 text-gray-700">
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
