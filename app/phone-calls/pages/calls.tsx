import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import AppLayout from "app/core/layouts/layout";
import PhoneCallsList from "../components/phone-calls-list";
import MissingTwilioCredentials from "app/core/components/missing-twilio-credentials";
import useCurrentUser from "app/core/hooks/use-current-user";
import PageTitle from "../../core/components/page-title";
import Spinner from "../../core/components/spinner";

const PhoneCalls: BlitzPage = () => {
	const { hasFilledTwilioCredentials, hasPhoneNumber } = useCurrentUser();

	if (!hasFilledTwilioCredentials || !hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm select-none absolute top-0" title="Calls" />
			</>
		);
	}

	return (
		<>
			<PageTitle className="pl-12" title="Calls" />
			<section className="flex flex-grow flex-col">
				<Suspense fallback={<Spinner />}>
					{/* TODO: skeleton phone calls list */}
					<PhoneCallsList />
				</Suspense>
			</section>
		</>
	);
};

PhoneCalls.getLayout = (page) => <AppLayout title="Calls">{page}</AppLayout>;

PhoneCalls.authenticate = { redirectTo: Routes.SignIn() };

export default PhoneCalls;
