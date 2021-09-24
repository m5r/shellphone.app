import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db from "../../../db";
import notifyEmailChangeQueue from "../api/queue/notify-email-change";

const Body = z.object({
	email: z.string().email(),
	name: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ email, name }, ctx) => {
	const user = await db.user.findFirst({ where: { id: ctx.session.userId! } });
	if (!user) throw new NotFoundError();

	const oldEmail = user.email;
	await db.user.update({
		where: { id: user.id },
		data: { email, name },
	});

	if (oldEmail !== email) {
		// await notifyEmailChangeQueue.enqueue({ newEmail: email, oldEmail: user.email });
	}
});
