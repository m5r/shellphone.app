import { useQuery } from "blitz";

import getCurrentPhoneNumber from "../../phone-numbers/queries/get-current-phone-number";
import useCurrentUser from "./use-current-user";

export default function useUserPhoneNumber() {
	const { hasFilledTwilioCredentials } = useCurrentUser();
	const [phoneNumber] = useQuery(getCurrentPhoneNumber, {}, { enabled: hasFilledTwilioCredentials });

	return phoneNumber;
}
