import { paginate, resolver } from "blitz";
import db, { Prisma, Customer } from "db";

interface GetPhoneCallsInput
	extends Pick<Prisma.PhoneCallFindManyArgs, "where" | "orderBy" | "skip" | "take"> {
	customerId: Customer["id"];
}

export default resolver.pipe(
	resolver.authorize(),
	async ({ where, orderBy, skip = 0, take = 100 }: GetPhoneCallsInput) => {
		// TODO: in multi-tenant app, you must add validation to ensure correct tenant
		const {
			items: phoneCalls,
			hasMore,
			nextPage,
			count,
		} = await paginate({
			skip,
			take,
			count: () => db.phoneCall.count({ where }),
			query: (paginateArgs) => db.phoneCall.findMany({ ...paginateArgs, where, orderBy }),
		});

		return {
			phoneCalls,
			nextPage,
			hasMore,
			count,
		};
	},
);
