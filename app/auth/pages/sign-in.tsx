import type { BlitzPage } from "blitz";
import { useRouter, Routes, AuthenticationError, Link, useMutation } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { AuthForm as Form, FORM_ERROR } from "../components/auth-form";
import { Login } from "../validations";
import { LabeledTextField } from "../components/labeled-text-field";
import login from "../mutations/login";

const SignIn: BlitzPage = () => {
	const router = useRouter();
	const [loginMutation] = useMutation(login);

	return (
		<Form
			texts={{
				title: "Welcome back!",
				subtitle: (
					<>
						Need an account?&nbsp;
						<Link href={Routes.SignUp()}>
							<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
								Create yours for free
							</a>
						</Link>
					</>
				),
				submit: "Sign in",
			}}
			schema={Login}
			initialValues={{ email: "", password: "" }}
			onSubmit={async (values) => {
				try {
					await loginMutation(values);
					const next = router.query.next
						? decodeURIComponent(router.query.next as string)
						: Routes.Messages();
					router.push(next);
				} catch (error: any) {
					if (error instanceof AuthenticationError) {
						return { [FORM_ERROR]: "Sorry, those credentials are invalid" };
					} else {
						return {
							[FORM_ERROR]: "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
						};
					}
				}
			}}
		>
			<LabeledTextField name="email" label="Email" type="email" />
			<LabeledTextField name="password" label="Password" type="password" showForgotPasswordLabel />
		</Form>
	);
};

SignIn.redirectAuthenticatedTo = Routes.Messages();

SignIn.getLayout = (page) => <BaseLayout title="Sign In">{page}</BaseLayout>;

export default SignIn;
