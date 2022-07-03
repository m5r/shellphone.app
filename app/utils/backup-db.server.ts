import { spawn } from "child_process";
import { PassThrough } from "stream";

import logger from "~/utils/logger.server";
import config from "~/config/config.server";
import { Credentials, S3 } from "aws-sdk";
import sendEmail from "~/utils/mailer.server";

const credentials = new Credentials({
	accessKeyId: config.aws.s3.accessKeyId,
	secretAccessKey: config.aws.s3.secretAccessKey,
});

export const s3 = new S3({ region: config.aws.region, credentials });

export default async function backup(schedule: "daily" | "weekly" | "monthly") {
	const s3Bucket = "shellphone-backups";
	const { database, host, port, user, password } = parseDatabaseUrl(process.env.DATABASE_URL!);
	const fileName = `${schedule}-${database}.sql.gz`;

	console.log(`Dumping database ${database}`);
	const pgDumpChild = spawn("pg_dump", [`-U${user}`, `-d${database}`], {
		env: {
			...process.env,
			PGPASSWORD: password,
			PGHOST: host,
			PGPORT: port.toString(),
		},
		stdio: ["ignore", "pipe", "inherit"],
	});

	console.log(`Compressing dump "${fileName}"`);
	const gzippedDumpStream = new PassThrough();
	const gzipChild = spawn("gzip", { stdio: ["pipe", "pipe", "inherit"] });
	gzipChild.on("exit", (code) => {
		if (code !== 0) {
			return sendEmail({
				text: `${schedule} backup failed: gzip: Bad exit code (${code})`,
				html: `${schedule} backup failed: gzip: Bad exit code (${code})`,
				subject: `${schedule} backup failed: gzip: Bad exit code (${code})`,
				recipients: ["error@shellphone.app"],
			});
		}
	});
	pgDumpChild.stdout.pipe(gzipChild.stdin);
	gzipChild.stdout.pipe(gzippedDumpStream);

	pgDumpChild.on("exit", (code) => {
		if (code !== 0) {
			console.log("pg_dump failed, upload aborted");
			return sendEmail({
				text: `${schedule} backup failed: pg_dump: Bad exit code (${code})`,
				html: `${schedule} backup failed: pg_dump: Bad exit code (${code})`,
				subject: `${schedule} backup failed: pg_dump: Bad exit code (${code})`,
				recipients: ["error@shellphone.app"],
			});
		}

		console.log(`Uploading "${fileName}" to S3 bucket "${s3Bucket}"`);
		const uploadPromise = s3
			.upload({
				Bucket: s3Bucket,
				Key: fileName,
				ACL: "private",
				ContentType: "text/plain",
				ContentEncoding: "gzip",
				Body: gzippedDumpStream,
			})
			.promise();

		uploadPromise
			.then(() => console.log(`Successfully uploaded "${fileName}"`))
			.catch((error) => {
				logger.error(error);
				return sendEmail({
					text: `${schedule} backup failed: ${error}`,
					html: `${schedule} backup failed: ${error}`,
					subject: `${schedule} backup failed: ${error}`,
					recipients: ["error@shellphone.app"],
				});
			});
	});
}

function parseDatabaseUrl(databaseUrl: string) {
	const url = new URL(databaseUrl);

	return {
		user: url.username,
		password: url.password,
		host: url.host,
		port: Number.parseInt(url.port),
		database: url.pathname.replace(/^\//, "").replace(/\/$/, ""),
	} as const;
}
