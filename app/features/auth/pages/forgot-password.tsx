import { Form, useActionData, useTransition } from "@remix-run/react";

import type { ForgotPasswordActionData } from "../actions/forgot-password";
import LabeledTextField from "~/features/core/components/labeled-text-field";
import Button from "~/features/core/components/button";

export default function ForgotPasswordPage() {
	const actionData = useActionData<ForgotPasswordActionData>();
	const transition = useTransition();
	const isSubmitting = transition.state === "submitting";

	return (
		<section>
			<header>
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
					Forgot your password?
				</h2>
			</header>

			<Form method="post" className="mt-8 mx-auto w-full max-w-sm">
				{actionData?.submitted ? (
					<p className="text-center">
						If your email is in our system, you will receive instructions to reset your password shortly.
					</p>
				) : (
					<>
						<LabeledTextField
							name="email"
							type="email"
							label="Email"
							disabled={isSubmitting}
							error={actionData?.errors?.email}
							tabIndex={1}
						/>

						<Button
							type="submit"
							disabled={transition.state === "submitting"}
							tabIndex={2}
							className="w-full flex justify-center py-2 px-4 text-base font-medium"
						>
							Send reset password link
						</Button>
					</>
				)}
			</Form>
		</section>
	);
}
