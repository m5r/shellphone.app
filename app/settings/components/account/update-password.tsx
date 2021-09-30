import type { FunctionComponent } from "react";
import { useMutation } from "blitz";
import { useForm } from "react-hook-form";

import Alert from "../../../core/components/alert";
import Button from "../button";
import SettingsSection from "../settings-section";

import appLogger from "../../../../integrations/logger";
import changePassword from "../../mutations/change-password";

const logger = appLogger.child({ module: "update-password" });

type Form = {
	currentPassword: string;
	newPassword: string;
};

const UpdatePassword: FunctionComponent = () => {
	const [changePasswordMutation, { error, isError, isSuccess }] = useMutation(changePassword);
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<Form>();

	const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
		if (isSubmitting) {
			return;
		}

		await changePasswordMutation({ currentPassword, newPassword });
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
				<div>
					<label
						htmlFor="currentPassword"
						className="flex justify-between text-sm font-medium leading-5 text-gray-700"
					>
						<div>Current password</div>
					</label>
					<div className="mt-1 rounded-md shadow-sm">
						<input
							id="currentPassword"
							type="password"
							tabIndex={3}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							{...register("currentPassword")}
							required
						/>
					</div>
				</div>

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
							tabIndex={4}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							{...register("newPassword")}
							required
						/>
					</div>
				</div>
			</SettingsSection>
		</form>
	);
};

export default UpdatePassword;

function parseErrorMessage(error: Error | null): string {
	if (!error) {
		return "";
	}

	if (error.name === "ZodError") {
		return JSON.parse(error.message)[0].message;
	}

	return error.message;
}
