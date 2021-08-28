import { resolver } from "blitz";
import db from "../../../db";

export default resolver.pipe(async () => {
	const phoneNumbers = await db.phoneNumber.count();
	const smsExchanged = await db.message.count();
	const allPhoneCalls = await db.phoneCall.findMany();
	const secondsCalled = allPhoneCalls.reduce<number>((minutes, phoneCall) => {
		if (!phoneCall.duration) {
			return minutes;
		}

		return minutes + Number.parseInt(phoneCall.duration);
	}, 0);
	const minutesCalled = Math.round(secondsCalled / 60);

	return {
		phoneNumbers,
		smsExchanged,
		minutesCalled,
	};
});
