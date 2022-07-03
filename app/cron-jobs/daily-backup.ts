import { CronJob } from "~/utils/queue.server";
import backup from "~/utils/backup-db.server";

export default CronJob("daily db backup", () => backup("daily"), "0 0 * * *");
