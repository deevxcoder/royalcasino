import crypto from "crypto";

const SECRET = process.env.NEXX_SECRET || "67d048e3b071c6e06177054ea7062647"; // exactly 32 chars

/**
 * Encrypts an object into Base64 ciphertext using AES-256-ECB with PKCS7 padding.
 * Matches NexxAPI launch payload encryption specification.
 */
export function encryptPayload(obj: Record<string, any>): string {
  const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(SECRET, "utf8"), null);
  cipher.setAutoPadding(true); // PKCS7
  return Buffer.concat([
    cipher.update(JSON.stringify(obj), "utf8"),
    cipher.final(),
  ]).toString("base64");
}

/**
 * Decrypts a Base64 ciphertext into parsed JSON using AES-256-ECB.
 * Used for encrypted webhook callbacks if enabled.
 */
export function decryptPayload<T = any>(b64Ciphertext: string): T {
  const decipher = crypto.createDecipheriv("aes-256-ecb", Buffer.from(SECRET, "utf8"), null);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(b64Ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decrypted);
}
