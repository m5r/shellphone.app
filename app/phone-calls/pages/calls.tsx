import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import Layout from "../../core/layouts/layout";
import PhoneCallsList from "../components/phone-calls-list";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";

const PhoneCalls: BlitzPage = () => {
	useRequireOnboarding();

	return (
		<>
			<div className="flex flex-col space-y-6 p-6">
				<h2 className="text-3xl font-bold">Calls</h2>
			</div>
			<Suspense fallback="Loading...">
				<PhoneCallsList />
			</Suspense>
		</>
	);
};

PhoneCalls.getLayout = (page) => <Layout title="Calls">{page}</Layout>;

PhoneCalls.authenticate = { redirectTo: Routes.SignIn() };

export default PhoneCalls;
