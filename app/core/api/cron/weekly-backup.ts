import { CronJob } from "quirrel/blitz";

import backup from "../../../../db/backup";

export default CronJob("api/cron/weekly-backup", "0 0 * * 0", async () => backup("weekly"));
