import { CronJob } from "quirrel/blitz";

import backup from "../../../../db/backup";

export default CronJob("api/cron/monthly-backup", "0 0 1 * *", async () => backup("monthly"));
