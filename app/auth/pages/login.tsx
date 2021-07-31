import { useRouter, BlitzPage } from "blitz"

import BaseLayout from "../../core/layouts/base-layout"
import { LoginForm } from "../components/login-form"

const LoginPage: BlitzPage = () => {
	const router = useRouter()

	return (
		<div>
			<LoginForm
				onSuccess={() => {
					const next = router.query.next
						? decodeURIComponent(router.query.next as string)
						: "/"
					router.push(next)
				}}
			/>
		</div>
	)
}

LoginPage.redirectAuthenticatedTo = "/"
LoginPage.getLayout = (page) => <BaseLayout title="Log In">{page}</BaseLayout>

export default LoginPage
