import { useSession, useQuery } from "blitz";

import getCurrentUser from "../../users/queries/get-current-user";

export default function useCurrentUser() {
	const session = useSession();
	const [user] = useQuery(getCurrentUser, null, { enabled: Boolean(session.userId) });
	const organization = user?.memberships[0]!.organization;
	return {
		user,
		organization,
		hasFilledTwilioCredentials: Boolean(
			organization && organization.twilioAccountSid && organization.twilioAuthToken,
		),
		hasActiveSubscription: organization && organization.subscriptions.length > 0,
	};
}
