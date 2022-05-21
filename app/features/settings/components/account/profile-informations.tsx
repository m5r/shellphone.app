import type { FunctionComponent } from "react";
import { Form, useActionData, useTransition } from "@remix-run/react";

import type { UpdateUserActionData } from "~/features/settings/actions/account";
import useSession from "~/features/core/hooks/use-session";
import Alert from "~/features/core/components/alert";
import Button from "../button";
import SettingsSection from "../settings-section";

const ProfileInformations: FunctionComponent = () => {
	const { user } = useSession();
	const transition = useTransition();
	const actionData = useActionData<UpdateUserActionData>()?.updateUser;

	const errors = actionData?.errors;
	const topErrorMessage = errors?.general;
	const isError = typeof topErrorMessage !== "undefined";
	const isSuccess = actionData?.submitted;
	const isCurrentFormTransition = transition.submission?.formData.get("_action") === "updateUser";
	const isSubmitting = isCurrentFormTransition && transition.state === "submitting";

	return (
		<Form method="post">
			<SettingsSection
				footer={
					<div className="px-4 py-3 bg-gray-50 text-right text-sm font-medium sm:px-6">
						<Button variant="default" type="submit" isDisabled={isSubmitting}>
							Save
						</Button>
					</div>
				}
			>
				{isError ? (
					<div className="mb-8">
						<Alert title="Oops, there was an issue" message={topErrorMessage} variant="error" />
					</div>
				) : null}

				{isSuccess && (
					<div className="mb-8">
						<Alert title="Saved successfully" message="Your changes have been saved." variant="success" />
					</div>
				)}

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

				<input type="hidden" name="_action" value="updateUser" />
			</SettingsSection>
		</Form>
	);
};

export default ProfileInformations;
