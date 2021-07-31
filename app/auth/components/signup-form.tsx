import { useMutation } from "blitz";

import { LabeledTextField } from "../../core/components/labeled-text-field";
import { Form, FORM_ERROR } from "../../core/components/form";
import signup from "../../auth/mutations/signup";
import { Signup } from "../validations";

type SignupFormProps = {
	onSuccess?: () => void;
};

export const SignupForm = (props: SignupFormProps) => {
	const [signupMutation] = useMutation(signup);

	return (
		<div>
			<h1>Create an Account</h1>

			<Form
				submitText="Create Account"
				schema={Signup}
				initialValues={{ email: "", password: "" }}
				onSubmit={async (values) => {
					try {
						await signupMutation(values);
						props.onSuccess?.();
					} catch (error) {
						if (error.code === "P2002" && error.meta?.target?.includes("email")) {
							// This error comes from Prisma
							return { email: "This email is already being used" };
						} else {
							return { [FORM_ERROR]: error.toString() };
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
			</Form>
		</div>
	);
};

export default SignupForm;