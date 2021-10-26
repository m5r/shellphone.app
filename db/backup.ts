import url from "url";
import querystring from "querystring";
import { spawn } from "child_process";
import { PassThrough } from "stream";

import { sendEmail } from "integrations/aws-ses";
import { s3 } from "integrations/aws-s3";
import appLogger from "../integrations/logger";

const logger = appLogger.child({ module: "backup" });

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

type DatabaseUrl = {
	readonly user: string;
	readonly password: string;
	readonly host: string;
	readonly port: number;
	readonly database: string;
};

function parseDatabaseUrl(databaseUrl: string): DatabaseUrl {
	const parsedUrl = url.parse(databaseUrl, false, true);
	const config = querystring.parse(parsedUrl.query!);

	if (parsedUrl.auth) {
		const userPassword = parsedUrl.auth.split(":", 2);
		config.user = userPassword[0];
		if (userPassword.length > 1) {
			config.password = userPassword[1];
		}
	}

	if (parsedUrl.pathname) {
		config.database = parsedUrl.pathname.replace(/^\//, "").replace(/\/$/, "");
	}

	if (parsedUrl.hostname) {
		config.host = parsedUrl.hostname;
	}

	if (parsedUrl.port) {
		config.port = parsedUrl.port;
	}

	return {
		user: config.user as string,
		password: config.password as string,
		host: config.host as string,
		port: Number.parseInt(config.port as string, 10),
		database: config.database as string,
	};
}
