import type { BlitzPage } from "blitz";
import { useRouter, Routes } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { SignupForm } from "../components/signup-form";

const SignUp: BlitzPage = () => {
	const router = useRouter();

	return (
		<div>
			<SignupForm onSuccess={() => router.push(Routes.StepOne())} />
		</div>
	);
};

SignUp.redirectAuthenticatedTo = Routes.StepOne();

SignUp.getLayout = (page) => <BaseLayout title="Sign Up">{page}</BaseLayout>;

export default SignUp;
