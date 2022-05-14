import crypto from "crypto";
import { GlobalRole, MembershipRole } from "@prisma/client";

import db from "~/utils/db.server";
import { hashPassword } from "~/utils/auth.server";

async function seed() {
	const email = "remixtape@admin.local";
	const password = crypto.randomBytes(8).toString("hex");

	// cleanup the existing database
	await db.user.delete({ where: { email } }).catch(() => {});

	await db.organization.deleteMany({
		where: {
			memberships: {
				some: { user: { email } },
			},
		},
	}).catch(() => {});

	await db.user.create({
		data: {
			email,
			fullName: "Admin",
			hashedPassword: await hashPassword(password),
			role: GlobalRole.SUPERADMIN,
			memberships: {
				create: {
					role: MembershipRole.OWNER,
					organization: {
						create: {},
					},
				},
			},
		},
	});

	console.log("\nDatabase has been seeded. 🌱");
	console.log("You can log into the newly-seeded admin account with the following credentials:");
	console.log(`\x1B[1m\x1B[4memail\x1B[0m: ${email}`);
	console.log(`\x1B[1m\x1B[4mpassword:\x1B[0m ${password}`);
}

seed()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
