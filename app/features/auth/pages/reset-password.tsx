import { Form, useActionData, useSearchParams, useTransition } from "@remix-run/react";
import clsx from "clsx";

import type { ResetPasswordActionData } from "../actions/reset-password";
import LabeledTextField from "~/features/core/components/labeled-text-field";

export default function ForgotPasswordPage() {
	const [searchParams] = useSearchParams();
	const actionData = useActionData<ResetPasswordActionData>();
	const transition = useTransition();
	const isSubmitting = transition.state === "submitting";

	return (
		<section>
			<header>
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">Set a new password</h2>
			</header>

			<Form method="post" action={`./?${searchParams}`} className="mt-8 mx-auto w-full max-w-sm">
				<LabeledTextField
					name="password"
					label="New Password"
					type="password"
					disabled={isSubmitting}
					error={actionData?.errors?.password}
					tabIndex={1}
				/>

				<LabeledTextField
					name="passwordConfirmation"
					label="Confirm New Password"
					type="password"
					disabled={isSubmitting}
					error={actionData?.errors?.passwordConfirmation}
					tabIndex={2}
				/>

				<button
					type="submit"
					disabled={transition.state === "submitting"}
					className={clsx(
						"w-full flex justify-center py-2 px-4 border border-transparent text-base font-medium rounded-md text-white focus:outline-none focus:border-primary-700 focus:shadow-outline-primary transition duration-150 ease-in-out",
						{
							"bg-primary-400 cursor-not-allowed": isSubmitting,
							"bg-primary-600 hover:bg-primary-700": !isSubmitting,
						},
					)}
					tabIndex={3}
				>
					Reset password
				</button>
			</Form>
		</section>
	);
}
