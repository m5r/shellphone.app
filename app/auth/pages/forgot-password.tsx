import { BlitzPage, useMutation } from "blitz"

import BaseLayout from "../../core/layouts/base-layout"
import { LabeledTextField } from "../../core/components/labeled-text-field"
import { Form, FORM_ERROR } from "../../core/components/form"
import { ForgotPassword } from "../validations"
import forgotPassword from "../../auth/mutations/forgot-password"

const ForgotPasswordPage: BlitzPage = () => {
	const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

	return (
		<div>
			<h1>Forgot your password?</h1>

			{isSuccess ? (
				<div>
					<h2>Request Submitted</h2>
					<p>
						If your email is in our system, you will receive instructions to reset your
						password shortly.
					</p>
				</div>
			) : (
				<Form
					submitText="Send Reset Password Instructions"
					schema={ForgotPassword}
					initialValues={{ email: "" }}
					onSubmit={async (values) => {
						try {
							await forgotPasswordMutation(values)
						} catch (error) {
							return {
								[FORM_ERROR]:
									"Sorry, we had an unexpected error. Please try again.",
							}
						}
					}}
				>
					<LabeledTextField name="email" label="Email" placeholder="Email" />
				</Form>
			)}
		</div>
	)
}

ForgotPasswordPage.redirectAuthenticatedTo = "/"
ForgotPasswordPage.getLayout = (page) => (
	<BaseLayout title="Forgot Your Password?">{page}</BaseLayout>
)

export default ForgotPasswordPage
