import { useRouter, BlitzPage, Routes } from "blitz"

import BaseLayout from "../../core/layouts/base-layout"
import { SignupForm } from "../components/signup-form"

const SignupPage: BlitzPage = () => {
	const router = useRouter()

	return (
		<div>
			<SignupForm onSuccess={() => router.push(Routes.Home())} />
		</div>
	)
}

SignupPage.redirectAuthenticatedTo = "/"
SignupPage.getLayout = (page) => <BaseLayout title="Sign Up">{page}</BaseLayout>

export default SignupPage
