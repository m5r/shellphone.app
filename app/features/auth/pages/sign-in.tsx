import { Form, Link, useActionData, useLoaderData, useSearchParams, useTransition } from "@remix-run/react";

import type { SignInActionData } from "../actions/sign-in";
import type { SignInLoaderData } from "../loaders/sign-in";
import LabeledTextField from "~/features/core/components/labeled-text-field";
import Alert from "~/features/core/components/alert";
import Button from "~/features/core/components/button";

export default function SignInPage() {
	const [searchParams] = useSearchParams();
	const loaderData = useLoaderData<SignInLoaderData>();
	const actionData = useActionData<SignInActionData>();
	const transition = useTransition();
	const isSubmitting = transition.state === "submitting";
	return (
		<section>
			<header>
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">Welcome back!</h2>
				{/*<p className="mt-2 text-center text-sm leading-5 text-gray-600">
					Need an account?&nbsp;
					<Link
						to="/register"
						prefetch="intent"
						className="font-medium text-primary-600 hover:text-primary-500 focus:underline transition ease-in-out duration-150"
					>
						Create yours for free
					</Link>
				</p>*/}
			</header>

			<Form method="post" action={`./?${searchParams}`} className="mt-8 mx-auto w-full max-w-sm">
				{loaderData?.errors ? (
					<div role="alert" className="mb-8 sm:mx-auto sm:w-full sm:max-w-sm whitespace-pre">
						<Alert title="Oops, there was an issue" message={loaderData.errors.general} variant="error" />
					</div>
				) : null}

				<LabeledTextField
					name="email"
					type="email"
					label="Email"
					disabled={isSubmitting}
					error={actionData?.errors?.email}
					tabIndex={1}
				/>

				<LabeledTextField
					name="password"
					type="password"
					label="Password"
					disabled={isSubmitting}
					error={actionData?.errors?.password}
					tabIndex={2}
					sideLabel={
						<Link
							to="/forgot-password"
							prefetch="intent"
							className="font-medium text-primary-600 hover:text-primary-500 transition ease-in-out duration-150"
						>
							Forgot your password?
						</Link>
					}
				/>

				<Button type="submit" disabled={transition.state === "submitting"} tabIndex={3}>
					Sign in
				</Button>
			</Form>
		</section>
	);
}
