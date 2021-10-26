import type { BlitzPage, GetServerSideProps } from "blitz";
import { useRouterQuery, Link, useMutation, Routes } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { AuthForm as Form, FORM_ERROR } from "../components/auth-form";
import { LabeledTextField } from "../components/labeled-text-field";
import { ResetPassword } from "../validations";
import resetPassword from "../../auth/mutations/reset-password";

const ResetPasswordPage: BlitzPage = () => {
	const query = useRouterQuery();
	const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword);

	return (
		<Form
			texts={{
				title: isSuccess ? "Password reset successfully" : "Set a new password",
				subtitle: "",
				submit: "Reset password",
			}}
			schema={ResetPassword}
			initialValues={{
				password: "",
				passwordConfirmation: "",
				token: query.token as string,
			}}
			onSubmit={async (values) => {
				try {
					await resetPasswordMutation(values);
				} catch (error: any) {
					if (error.name === "ResetPasswordError") {
						return {
							[FORM_ERROR]: error.message,
						};
					} else {
						return {
							[FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
						};
					}
				}
			}}
		>
			{isSuccess ? (
				<p>
					Go to the <Link href={Routes.LandingPage()}>homepage</Link>
				</p>
			) : (
				<>
					<LabeledTextField name="password" label="New Password" type="password" />
					<LabeledTextField name="passwordConfirmation" label="Confirm New Password" type="password" />
				</>
			)}
		</Form>
	);
};

ResetPasswordPage.redirectAuthenticatedTo = Routes.Messages();

ResetPasswordPage.getLayout = (page) => <BaseLayout title="Reset password">{page}</BaseLayout>;

export const getServerSideProps: GetServerSideProps = async (context) => {
	if (!context.query.token) {
		return {
			redirect: {
				destination: Routes.ForgotPasswordPage().pathname,
				permanent: false,
			},
		};
	}

	return { props: {} };
};

export default ResetPasswordPage;
