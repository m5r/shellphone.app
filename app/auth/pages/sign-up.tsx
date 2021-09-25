import type { BlitzPage } from "blitz";
import { useRouter, Routes, useMutation, Link } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { AuthForm as Form, FORM_ERROR } from "../components/auth-form";
import { LabeledTextField } from "../components/labeled-text-field";
import signup from "../mutations/signup";
import { Signup } from "../validations";

const SignUp: BlitzPage = () => {
	const router = useRouter();
	const [signupMutation] = useMutation(signup);

	return (
		<Form
			texts={{
				title: "Create your account",
				subtitle: (
					<Link href={Routes.SignIn()}>
						<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
							Already have an account?
						</a>
					</Link>
				),
				submit: "Sign up",
			}}
			schema={Signup}
			initialValues={{ email: "", password: "" }}
			onSubmit={async (values) => {
				try {
					await signupMutation(values);
					router.push(Routes.StepOne());
				} catch (error: any) {
					if (error.code === "P2002" && error.meta?.target?.includes("email")) {
						// This error comes from Prisma
						return { email: "This email is already being used" };
					} else {
						return { [FORM_ERROR]: error.toString() };
					}
				}
			}}
		>
			<LabeledTextField name="name" label="Name" placeholder="Name" type="text" />
			<LabeledTextField name="email" label="Email" placeholder="Email" type="email" />
			<LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
		</Form>
	);
};

SignUp.redirectAuthenticatedTo = Routes.StepOne();

SignUp.getLayout = (page) => <BaseLayout title="Sign Up">{page}</BaseLayout>;

export default SignUp;
