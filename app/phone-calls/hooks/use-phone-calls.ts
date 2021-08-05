import { NotFoundError, useQuery } from "blitz";

import useCurrentPhoneNumber from "../..//core/hooks/use-current-phone-number";
import getPhoneCalls from "../queries/get-phone-calls";

export default function usePhoneCalls() {
	const phoneNumber = useCurrentPhoneNumber();
	if (!phoneNumber) {
		throw new NotFoundError();
	}

	return useQuery(getPhoneCalls, { phoneNumberId: phoneNumber.id });
}
