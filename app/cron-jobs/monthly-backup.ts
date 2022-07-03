import { CronJob } from "~/utils/queue.server";
import backup from "~/utils/backup-db.server";

export default CronJob("monthly db backup", () => backup("monthly"), "0 0 1 * *");
