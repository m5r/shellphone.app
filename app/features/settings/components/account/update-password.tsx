import type { FunctionComponent } from "react";
import { Form, useActionData, useTransition } from "@remix-run/react";

import type { ChangePasswordActionData } from "~/features/settings/actions/account";
import Alert from "~/features/core/components/alert";
import LabeledTextField from "~/features/core/components/labeled-text-field";
import Button from "../button";
import SettingsSection from "../settings-section";

const UpdatePassword: FunctionComponent = () => {
	const transition = useTransition();
	const actionData = useActionData<ChangePasswordActionData>()?.changePassword;

	const topErrorMessage = actionData?.errors?.general;
	const isError = typeof topErrorMessage !== "undefined";
	const isSuccess = actionData?.submitted;
	const isCurrentFormTransition = transition.submission?.formData.get("_action") === "changePassword";
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

				{isSuccess ? (
					<div className="mb-8">
						<Alert title="Saved successfully" message="Your changes have been saved." variant="success" />
					</div>
				) : null}

				<LabeledTextField
					name="currentPassword"
					label="Current password"
					type="password"
					tabIndex={3}
					error={actionData?.errors?.currentPassword}
					disabled={isSubmitting}
				/>

				<LabeledTextField
					name="newPassword"
					label="New password"
					type="password"
					tabIndex={4}
					error={actionData?.errors?.newPassword}
					disabled={isSubmitting}
				/>

				<input type="hidden" name="_action" value="changePassword" />
			</SettingsSection>
		</Form>
	);
};

export default UpdatePassword;
