import { NotFoundError, resolver } from "blitz";

import db from "../../../db";
import logout from "../../auth/mutations/logout";
import deleteUserData from "../api/queue/delete-user-data";

export default resolver.pipe(resolver.authorize(), async (_ = null, ctx) => {
	const user = await db.user.findFirst({ where: { id: ctx.session.userId! } });
	if (!user) throw new NotFoundError();

	await db.user.update({ where: { id: user.id }, data: { hashedPassword: "pending deletion" } });
	await deleteUserData.enqueue({ userId: user.id });
	await logout(null, ctx);
});
