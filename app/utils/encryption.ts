import crypto from "crypto";

import serverConfig from "~/config/config.server";

const ivLength = 16;
const algorithm = "aes-256-cbc";
const encryptionKey = Buffer.from(serverConfig.app.encryptionKey, "hex");

export function encrypt(text: string) {
	const iv = crypto.randomBytes(ivLength);
	const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string) {
	const [iv, encrypted] = encryptedText.split(":").map((hex) => Buffer.from(hex, "hex"));
	const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

	return decrypted.toString();
}
