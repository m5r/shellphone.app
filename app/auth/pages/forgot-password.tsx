import type { BlitzPage } from "blitz";
import { Routes, useMutation } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { AuthForm as Form, FORM_ERROR } from "../components/auth-form";
import { LabeledTextField } from "../components/labeled-text-field";
import { ForgotPassword } from "../validations";
import forgotPassword from "../../auth/mutations/forgot-password";

const ForgotPasswordPage: BlitzPage = () => {
	const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword);

	return (
		<Form
			texts={{
				title: isSuccess ? "Request submitted" : "Forgot your password?",
				subtitle: "",
				submit: isSuccess ? "" : "Send reset password instructions",
			}}
			schema={ForgotPassword}
			initialValues={{ email: "" }}
			onSubmit={async (values) => {
				try {
					await forgotPasswordMutation(values);
				} catch (error: any) {
					return {
						[FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
					};
				}
			}}
		>
			{isSuccess ? (
				<p>If your email is in our system, you will receive instructions to reset your password shortly.</p>
			) : (
				<LabeledTextField name="email" label="Email" />
			)}
		</Form>
	);
};

ForgotPasswordPage.redirectAuthenticatedTo = Routes.Messages();

ForgotPasswordPage.getLayout = (page) => <BaseLayout title="Forgot Your Password?">{page}</BaseLayout>;

export default ForgotPasswordPage;
