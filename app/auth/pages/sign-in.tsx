import type { BlitzPage } from "blitz";
import { useRouter, Routes } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import { LoginForm } from "../components/login-form";

const SignIn: BlitzPage = () => {
	const router = useRouter();

	return (
		<div>
			<LoginForm
				onSuccess={() => {
					const next = router.query.next
						? decodeURIComponent(router.query.next as string)
						: Routes.Messages();
					router.push(next);
				}}
			/>
		</div>
	);
};

SignIn.redirectAuthenticatedTo = Routes.Messages();

SignIn.getLayout = (page) => <BaseLayout title="Sign In">{page}</BaseLayout>;

export default SignIn;
