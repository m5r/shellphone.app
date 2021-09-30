import type { FunctionComponent } from "react";
import { useEffect } from "react";
import { useMutation } from "blitz";
import { useForm } from "react-hook-form";

import updateUser from "../../mutations/update-user";
import Alert from "../../../core/components/alert";
import Button from "../button";
import SettingsSection from "../settings-section";
import useCurrentUser from "../../../core/hooks/use-current-user";

import appLogger from "../../../../integrations/logger";

type Form = {
	fullName: string;
	email: string;
};

const logger = appLogger.child({ module: "profile-settings" });

const ProfileInformations: FunctionComponent = () => {
	const { user } = useCurrentUser();
	const [updateUserMutation, { error, isError, isSuccess }] = useMutation(updateUser);
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();

	useEffect(() => {
		setValue("fullName", user?.fullName ?? "");
		setValue("email", user?.email ?? "");
	}, [setValue, user]);

	const onSubmit = handleSubmit(async ({ fullName, email }) => {
		if (isSubmitting) {
			return;
		}

		await updateUserMutation({ email, fullName });
	});
	const errorMessage = parseErrorMessage(error as Error | null);

	return (
		<form onSubmit={onSubmit}>
			<SettingsSection
				footer={
					<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
						<Button variant="default" type="submit" isDisabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				}
			>
				{isError ? (
					<div className="mb-8">
						<Alert title="Oops, there was an issue" message={errorMessage} variant="error" />
					</div>
				) : null}

				{isSuccess ? (
					<div className="mb-8">
						<Alert title="Saved successfully" message="Your changes have been saved." variant="success" />
					</div>
				) : null}
				<div className="col-span-3 sm:col-span-2">
					<label htmlFor="fullName" className="block text-sm font-medium leading-5 text-gray-700">
						Full name
					</label>
					<div className="mt-1 rounded-md shadow-sm">
						<input
							id="fullName"
							type="text"
							tabIndex={1}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							{...register("fullName")}
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
			</SettingsSection>
		</form>
	);
};

export default ProfileInformations;

function parseErrorMessage(error: Error | null): string {
	if (!error) {
		return "";
	}

	if (error.name === "ZodError") {
		return JSON.parse(error.message)[0].message;
	}

	return error.message;
}
