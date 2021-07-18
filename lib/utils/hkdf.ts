import hkdf from "futoin-hkdf";

const BYTE_LENGTH = 32;

export function encryption(secret: string) {
	return hkdf(secret, BYTE_LENGTH, { info: "JWE CEK", hash: "SHA-256" });
}
