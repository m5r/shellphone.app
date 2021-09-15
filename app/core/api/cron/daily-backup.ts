import { CronJob } from "quirrel/blitz";

import backup from "../../../../db/backup";

export default CronJob("api/cron/daily-backup", "0 0 * * *", async () => backup("daily"));
