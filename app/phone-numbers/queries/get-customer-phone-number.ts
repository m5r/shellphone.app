import { resolver } from "blitz";
import db from "db";
import { z } from "zod";

const GetCustomerPhoneNumber = z.object({
	// This accepts type of undefined, but is required at runtime
	customerId: z.string().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(resolver.zod(GetCustomerPhoneNumber), async ({ customerId }) =>
	db.phoneNumber.findFirst({
		where: { customerId },
		select: {
			id: true,
			phoneNumber: true,
			phoneNumberSid: true,
		},
	}),
);
