import crypto from "crypto";
import { getConfig } from "blitz";

const { serverRuntimeConfig } = getConfig();

const IV_LENGTH = 16;
const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string, encryptionKey: Buffer | string) {
	const encryptionKeyAsBuffer = Buffer.isBuffer(encryptionKey) ? encryptionKey : Buffer.from(encryptionKey, "hex");
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, encryptionKeyAsBuffer, iv);
	const encrypted = cipher.update(text);
	const encryptedBuffer = Buffer.concat([encrypted, cipher.final()]);

	return `${iv.toString("hex")}:${encryptedBuffer.toString("hex")}`;
}

export function decrypt(encryptedHexText: string, encryptionKey: Buffer | string) {
	const encryptionKeyAsBuffer = Buffer.isBuffer(encryptionKey) ? encryptionKey : Buffer.from(encryptionKey, "hex");
	const [hexIv, hexText] = encryptedHexText.split(":");
	const iv = Buffer.from(hexIv!, "hex");
	const encryptedText = Buffer.from(hexText!, "hex");
	const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKeyAsBuffer, iv);
	const decrypted = decipher.update(encryptedText);
	const decryptedBuffer = Buffer.concat([decrypted, decipher.final()]);

	return decryptedBuffer.toString();
}

export function computeEncryptionKey(userIdentifier: string) {
	return crypto.scryptSync(userIdentifier, serverRuntimeConfig.masterEncryptionKey, 32);
}
