import { Form, Link, useActionData, useLoaderData, useTransition } from "@remix-run/react";

import type { RegisterActionData } from "../actions/register";
import type { RegisterLoaderData } from "../loaders/register";
import LabeledTextField from "~/features/core/components/labeled-text-field";
import Alert from "~/features/core/components/alert";
import Button from "~/features/core/components/button";

export default function RegisterPage() {
	const loaderData = useLoaderData<RegisterLoaderData>();
	const actionData = useActionData<RegisterActionData>();
	const transition = useTransition();
	const isSubmitting = transition.state === "submitting";
	const topErrorMessage = loaderData?.errors?.general || actionData?.errors?.general;

	return (
		<section>
			<header>
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm leading-5 text-gray-600">
					<Link
						to="/sign-in"
						prefetch="intent"
						className="font-medium text-primary-600 hover:text-primary-500 focus:underline transition ease-in-out duration-150"
					>
						Already have an account?
					</Link>
				</p>
			</header>

			<Form method="post" className="mt-8 mx-auto w-full max-w-sm">
				{topErrorMessage ? (
					<div role="alert" className="mb-8 sm:mx-auto sm:w-full sm:max-w-sm whitespace-pre">
						<Alert title="Oops, there was an issue" message={topErrorMessage!} variant="error" />
					</div>
				) : null}

				<LabeledTextField
					name="fullName"
					type="text"
					label="Full name"
					disabled={isSubmitting}
					error={actionData?.errors?.fullName}
					tabIndex={1}
				/>
				<LabeledTextField
					name="email"
					type="email"
					label="Email"
					disabled={isSubmitting}
					error={actionData?.errors?.email}
					tabIndex={2}
				/>
				<LabeledTextField
					name="password"
					type="password"
					label="Password"
					disabled={isSubmitting}
					error={actionData?.errors?.password}
					tabIndex={3}
				/>

				<Button
					type="submit"
					disabled={transition.state === "submitting"}
					tabIndex={4}
				>
					Register
				</Button>
			</Form>
		</section>
	);
}
