import crypto from "crypto";

import serverConfig from "~/config/config.server";

const ivLength = 16;
const algorithm = "aes-256-cbc";
const encryptionKey = serverConfig.app.encryptionKey;

export function encrypt(text: string) {
	const encryptionKeyAsBuffer = Buffer.isBuffer(encryptionKey) ? encryptionKey : Buffer.from(encryptionKey, "hex");
	const iv = crypto.randomBytes(ivLength);
	const cipher = crypto.createCipheriv(algorithm, encryptionKeyAsBuffer, iv);
	const encrypted = cipher.update(text);
	const encryptedBuffer = Buffer.concat([encrypted, cipher.final()]);

	return `${iv.toString("hex")}:${encryptedBuffer.toString("hex")}`;
}

export function decrypt(encryptedHexText: string) {
	const encryptionKeyAsBuffer = Buffer.isBuffer(encryptionKey) ? encryptionKey : Buffer.from(encryptionKey, "hex");
	const [hexIv, hexText] = encryptedHexText.split(":");
	const iv = Buffer.from(hexIv!, "hex");
	const encryptedText = Buffer.from(hexText!, "hex");
	const decipher = crypto.createDecipheriv(algorithm, encryptionKeyAsBuffer, iv);
	const decrypted = decipher.update(encryptedText);
	const decryptedBuffer = Buffer.concat([decrypted, decipher.final()]);

	return decryptedBuffer.toString();
}
