import { CronJob } from "~/utils/queue.server";
import backup from "~/utils/backup-db.server";

export default CronJob("weekly db backup", () => backup("weekly"), "0 0 * * 0");
