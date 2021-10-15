import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import Layout from "app/core/layouts/layout";
import PhoneCallsList from "../components/phone-calls-list";
import MissingTwilioCredentials from "app/core/components/missing-twilio-credentials";
import useCurrentUser from "app/core/hooks/use-current-user";
import PageTitle from "../../core/components/page-title";

const PhoneCalls: BlitzPage = () => {
	const { hasFilledTwilioCredentials } = useCurrentUser();

	if (!hasFilledTwilioCredentials) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm absolute top-0" title="Calls" />
			</>
		);
	}

	return (
		<>
			<PageTitle className="pl-12" title="Calls" />
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
