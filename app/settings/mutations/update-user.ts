import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db from "../../../db";
import notifyEmailChangeQueue from "../api/queue/notify-email-change";

const Body = z.object({
	email: z.string().email(),
	fullName: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ email, fullName }, ctx) => {
	const user = await db.user.findFirst({ where: { id: ctx.session.userId! } });
	if (!user) throw new NotFoundError();

	const oldEmail = user.email;
	await db.user.update({
		where: { id: user.id },
		data: { email, fullName },
	});

	if (oldEmail !== email) {
		// await notifyEmailChangeQueue.enqueue({ newEmail: email, oldEmail: user.email });
	}
});
