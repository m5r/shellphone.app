import { useSession, useQuery } from "blitz";

import getCurrentUser from "../../users/queries/get-current-user";
import getCurrentPhoneNumber from "../../phone-numbers/queries/get-current-phone-number";

export default function useCurrentUser() {
	const session = useSession();
	const [user, userQuery] = useQuery(getCurrentUser, null, { enabled: Boolean(session.userId) });
	const organization = user?.memberships[0]!.organization;
	const hasFilledTwilioCredentials = Boolean(organization?.twilioAccountSid && organization?.twilioAuthToken);
	const [phoneNumber] = useQuery(getCurrentPhoneNumber, {}, { enabled: hasFilledTwilioCredentials });

	return {
		user,
		organization,
		hasFilledTwilioCredentials,
		hasPhoneNumber: Boolean(phoneNumber),
		hasOngoingSubscription: organization && organization.subscriptions.length > 0,
		refetch: userQuery.refetch,
	};
}
