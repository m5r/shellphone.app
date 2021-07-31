import { resolver } from "blitz";

import db from "db";
import getCurrentCustomer from "../../customers/queries/get-current-customer";

export default resolver.pipe(resolver.authorize(), async (_ = null, context) => {
	const customer = await getCurrentCustomer(null, context);
	return db.phoneNumber.findFirst({
		where: { customerId: customer!.id },
		select: {
			id: true,
			phoneNumber: true,
			phoneNumberSid: true,
		},
	});
});
