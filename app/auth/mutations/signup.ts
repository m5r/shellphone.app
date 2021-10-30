import { resolver, SecurePassword } from "blitz";

import db, { GlobalRole, MembershipRole } from "db";
import { Signup } from "../validations";
import { computeEncryptionKey } from "db/_encryption";
import { welcomeMailer } from "mailers/welcome-mailer";

export default resolver.pipe(resolver.zod(Signup), async ({ email, password, fullName }, ctx) => {
	const hashedPassword = await SecurePassword.hash(password.trim());
	const encryptionKey = computeEncryptionKey(email.toLowerCase().trim()).toString("hex");
	const user = await db.user.create({
		data: {
			fullName: fullName.trim(),
			email: email.toLowerCase().trim(),
			hashedPassword,
			role: GlobalRole.CUSTOMER,
			memberships: {
				create: {
					role: MembershipRole.OWNER,
					organization: {
						create: {
							encryptionKey,
						},
					},
				},
			},
		},
		include: { memberships: true },
	});

	await ctx.session.$create({
		userId: user.id,
		roles: [user.role, user.memberships[0]!.role],
		orgId: user.memberships[0]!.organizationId,
		shouldShowWelcomeMessage: true,
	});

	await (
		await welcomeMailer({
			to: user.email,
			userName: user.fullName,
		})
	).send();

	return user;
});
