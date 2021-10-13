import { Credentials, S3 } from "aws-sdk";
import { getConfig } from "blitz";

const { serverRuntimeConfig } = getConfig();

const credentials = new Credentials({
	accessKeyId: serverRuntimeConfig.awsSes.accessKeyId,
	secretAccessKey: serverRuntimeConfig.awsSes.secretAccessKey,
});

export const s3 = new S3({ region: serverRuntimeConfig.awsS3.region, credentials });
