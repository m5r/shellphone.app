import { AuthenticationError, Link, useMutation, Routes } from "blitz";

import { LabeledTextField } from "../../core/components/labeled-text-field";
import { Form, FORM_ERROR } from "../../core/components/form";
import login from "../../../app/auth/mutations/login";
import { Login } from "../validations";

type LoginFormProps = {
	onSuccess?: () => void;
};

export const LoginForm = (props: LoginFormProps) => {
	const [loginMutation] = useMutation(login);

	return (
		<div>
			<h1>Login</h1>

			<Form
				submitText="Login"
				schema={Login}
				initialValues={{ email: "", password: "" }}
				onSubmit={async (values) => {
					try {
						await loginMutation(values);
						props.onSuccess?.();
					} catch (error) {
						if (error instanceof AuthenticationError) {
							return { [FORM_ERROR]: "Sorry, those credentials are invalid" };
						} else {
							return {
								[FORM_ERROR]:
									"Sorry, we had an unexpected error. Please try again. - " +
									error.toString(),
							};
						}
					}
				}}
			>
				<LabeledTextField name="email" label="Email" placeholder="Email" />
				<LabeledTextField
					name="password"
					label="Password"
					placeholder="Password"
					type="password"
				/>
				<div>
					<Link href={Routes.ForgotPasswordPage()}>
						<a>Forgot your password?</a>
					</Link>
				</div>
			</Form>

			<div style={{ marginTop: "1rem" }}>
				Or <Link href={Routes.SignUp()}>Sign Up</Link>
			</div>
		</div>
	);
};

export default LoginForm;
