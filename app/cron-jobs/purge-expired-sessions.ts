import db from "~/utils/db.server";
import { CronJob } from "~/utils/queue.server";

export default CronJob(
	"purge expired sessions",
	async () => {
		await db.session.deleteMany({
			where: {
				expiresAt: { lt: new Date() },
			},
		});
	},
	"0 0 * * *",
);
