import { resolver, SecurePassword } from "blitz";

import db, { Role } from "../../../db";
import { Signup } from "../validations";
import { computeEncryptionKey } from "../../../db/_encryption";

export default resolver.pipe(resolver.zod(Signup), async ({ email, password }, ctx) => {
	const hashedPassword = await SecurePassword.hash(password.trim());
	const user = await db.user.create({
		data: { email: email.toLowerCase().trim(), hashedPassword, role: Role.USER },
		select: { id: true, name: true, email: true, role: true },
	});
	const encryptionKey = computeEncryptionKey(user.id).toString("hex");
	await db.customer.create({ data: { id: user.id, encryptionKey } });

	await ctx.session.$create({ userId: user.id, role: user.role });
	return user;
});
