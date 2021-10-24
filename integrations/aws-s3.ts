import { Credentials, S3 } from "aws-sdk";
import { getConfig } from "blitz";

const { serverRuntimeConfig } = getConfig();

const credentials = new Credentials({
	accessKeyId: serverRuntimeConfig.awsS3.accessKeyId,
	secretAccessKey: serverRuntimeConfig.awsS3.secretAccessKey,
});

export const s3 = new S3({ region: serverRuntimeConfig.awsS3.region, credentials });
