import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "superjson-remix";

import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import PageTitle from "~/features/core/components/page-title";
import InactiveSubscription from "~/features/core/components/inactive-subscription";
import PhoneCallsList from "~/features/phone-calls/components/phone-calls-list";
import callsLoader, { type PhoneCallsLoaderData } from "~/features/phone-calls/loaders/calls";
import { getSeoMeta } from "~/utils/seo";

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Calls" }),
});

export const loader = callsLoader;

export default function PhoneCalls() {
	const { hasPhoneNumber, hasOngoingSubscription } = useLoaderData<PhoneCallsLoaderData>();

	if (!hasPhoneNumber) {
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
						<PhoneCallsList />
					</section>
				</div>
			</>
		);
	}

	return (
		<>
			<PageTitle className="pl-12" title="Calls" />
			<section className="flex flex-grow flex-col">
				<PhoneCallsList />
			</section>
		</>
	);
}
