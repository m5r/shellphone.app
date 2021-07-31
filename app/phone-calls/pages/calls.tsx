import { Suspense } from "react"
import type { BlitzPage } from "blitz"

import Layout from "../../core/layouts/layout"
import PhoneCallsList from "../components/phone-calls-list"
import useRequireOnboarding from "../../core/hooks/use-require-onboarding"

const PhoneCalls: BlitzPage = () => {
	useRequireOnboarding()

	return (
		<Layout title="Calls">
			<div className="flex flex-col space-y-6 p-6">
				<p>PhoneCalls page</p>
			</div>
			<Suspense fallback="Loading...">
				<PhoneCallsList />
			</Suspense>
		</Layout>
	)
}

PhoneCalls.authenticate = true

export default PhoneCalls
