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
			<div className="flex flex-col space-y-6 py-3 pl-12">
				<h2 className="text-3xl font-bold">Calls</h2>
			</div>
			<section className="flex flex-grow flex-col">
				<Suspense fallback="Loading...">
					<PhoneCallsList />
				</Suspense>
			</section>
		</>
	);
};

PhoneCalls.getLayout = (page) => <Layout title="Calls">{page}</Layout>;

PhoneCalls.authenticate = { redirectTo: Routes.SignIn() };

export default PhoneCalls;
