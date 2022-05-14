import type { FunctionComponent } from "react";
import { useActionData, useTransition } from "@remix-run/react";

import Alert from "../../../core/components/alert";
import Button from "../button";
import SettingsSection from "../settings-section";
import useSession from "~/features/core/hooks/use-session";

const ProfileInformations: FunctionComponent = () => {
	const user = useSession();
	const transition = useTransition();
	const actionData = useActionData();

	const isSubmitting = transition.state === "submitting";
	const isSuccess = actionData?.submitted === true;
	const error = actionData?.error;
	const isError = !!error;

	const onSubmit = async () => {
		// await updateUserMutation({ email, fullName }); // TODO
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
				<div className="col-span-3 sm:col-span-2">
					<label htmlFor="fullName" className="block text-sm font-medium leading-5 text-gray-700">
						Full name
					</label>
					<div className="mt-1 rounded-md shadow-sm">
						<input
							id="fullName"
							name="fullName"
							type="text"
							tabIndex={1}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							defaultValue={user.fullName}
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
							name="email"
							type="email"
							tabIndex={2}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
							defaultValue={user.email}
							required
						/>
					</div>
				</div>
			</SettingsSection>
		</form>
	);
};

export default ProfileInformations;
