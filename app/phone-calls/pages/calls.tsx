import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import AppLayout from "app/core/layouts/layout";
import MissingTwilioCredentials from "app/core/components/missing-twilio-credentials";
import useCurrentUser from "app/core/hooks/use-current-user";
import PageTitle from "app/core/components/page-title";
import Spinner from "app/core/components/spinner";
import InactiveSubscription from "app/core/components/inactive-subscription";
import PhoneCallsList from "../components/phone-calls-list";

const PhoneCalls: BlitzPage = () => {
	const { hasFilledTwilioCredentials, hasPhoneNumber, hasOngoingSubscription } = useCurrentUser();

	if (!hasFilledTwilioCredentials || !hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm select-none absolute top-0" title="Calls" />
			</>
		);
	}

	if (!hasOngoingSubscription) {
		return (
			<>
				<InactiveSubscription />
				<div className="filter blur-sm select-none absolute top-0 w-full h-full z-0">
					<PageTitle title="Calls" />
					<section className="relative flex flex-grow flex-col">
						<Suspense fallback={<Spinner />}>
							<PhoneCallsList />
						</Suspense>
					</section>
				</div>
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
