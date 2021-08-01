import type { BlitzPage } from "blitz";
import { useRouterQuery, Link, useMutation, Routes } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { LabeledTextField } from "../../core/components/labeled-text-field";
import { Form, FORM_ERROR } from "../../core/components/form";
import { ResetPassword } from "../validations";
import resetPassword from "../../auth/mutations/reset-password";

const ResetPasswordPage: BlitzPage = () => {
	const query = useRouterQuery();
	const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword);

	return (
		<div>
			<h1>Set a New Password</h1>

			{isSuccess ? (
				<div>
					<h2>Password Reset Successfully</h2>
					<p>
						Go to the <Link href={Routes.Home()}>homepage</Link>
					</p>
				</div>
			) : (
				<Form
					submitText="Reset Password"
					schema={ResetPassword}
					initialValues={{
						password: "",
						passwordConfirmation: "",
						token: query.token as string,
					}}
					onSubmit={async (values) => {
						try {
							await resetPasswordMutation(values);
						} catch (error) {
							if (error.name === "ResetPasswordError") {
								return {
									[FORM_ERROR]: error.message,
								};
							} else {
								return {
									[FORM_ERROR]:
										"Sorry, we had an unexpected error. Please try again.",
								};
							}
						}
					}}
				>
					<LabeledTextField name="password" label="New Password" type="password" />
					<LabeledTextField
						name="passwordConfirmation"
						label="Confirm New Password"
						type="password"
					/>
				</Form>
			)}
		</div>
	);
};

ResetPasswordPage.redirectAuthenticatedTo = Routes.Messages();

ResetPasswordPage.getLayout = (page) => <BaseLayout title="Reset Your Password">{page}</BaseLayout>;

export default ResetPasswordPage;
