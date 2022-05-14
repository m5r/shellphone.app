import { nanoid } from "nanoid";
import crypto from "crypto";

export function generateToken() {
	return nanoid(32);
}

export function hashToken(token: string) {
	return crypto.createHash("sha256").update(token).digest("hex");
}
