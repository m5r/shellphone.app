import crypto from "crypto";

import config from "../config";

const ENCRYPTION_KEY = computeEncryptionKey(config.twilio.accountSid);
const IV_LENGTH = 16;
const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
	const encrypted = cipher.update(text);
	const encryptedBuffer = Buffer.concat([encrypted, cipher.final()]);

	return `${iv.toString("hex")}:${encryptedBuffer.toString("hex")}`;
}

export function decrypt(encryptedHexText: string) {
	const [hexIv, hexText] = encryptedHexText.split(":");
	const iv = Buffer.from(hexIv, "hex");
	const encryptedText = Buffer.from(hexText, "hex");
	const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
	const decrypted = decipher.update(encryptedText);
	const decryptedBuffer = Buffer.concat([decrypted, decipher.final()]);

	return decryptedBuffer.toString();
}

function computeEncryptionKey(userIdentifier: string) {
	return crypto.scryptSync(userIdentifier, crypto.randomBytes(16), 32);
}
