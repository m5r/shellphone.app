import { resolver } from "blitz";

import db from "../../../db";

export default resolver.pipe(async () => {
	const [phoneNumbers, smsExchanged, allPhoneCalls] = await Promise.all([
		db.phoneNumber.count(),
		db.message.count(),
		db.phoneCall.findMany(),
	]);
	const secondsCalled = allPhoneCalls.reduce<number>((seconds, phoneCall) => {
		if (!phoneCall.duration) {
			return seconds;
		}

		return seconds + Number.parseInt(phoneCall.duration);
	}, 0);
	const minutesCalled = Math.round(secondsCalled / 60);

	return {
		phoneNumbers,
		smsExchanged,
		minutesCalled,
	};
});
