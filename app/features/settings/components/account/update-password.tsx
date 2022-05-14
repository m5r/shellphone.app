import type { FunctionComponent } from "react";

import Alert from "~/features/core/components/alert";
import Button from "../button";
import SettingsSection from "../settings-section";
import { useActionData, useTransition } from "@remix-run/react";

const UpdatePassword: FunctionComponent = () => {
	const transition = useTransition();
	const actionData = useActionData();

	const isSubmitting = transition.state === "submitting";
	const isSuccess = actionData?.submitted === true;
	const error = actionData?.error;
	const isError = !!error;

	const onSubmit = async () => {
		// await changePasswordMutation({ currentPassword, newPassword }); // TODO
	};

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
						<Alert title="Oops, there was an issue" message={error} variant="error" />
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
							name="currentPassword"
							type="password"
							tabIndex={3}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
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
							name="newPassword"
							type="password"
							tabIndex={4}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							required
						/>
					</div>
				</div>
			</SettingsSection>
		</form>
	);
};

export default UpdatePassword;
