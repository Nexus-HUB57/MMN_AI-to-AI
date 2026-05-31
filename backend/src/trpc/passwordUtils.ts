import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

export function md5Legacy(password: string): string {
  return crypto.createHash("md5").update(password).digest("hex");
}

export async function verifyLegacyPassword(
  plaintext: string,
  storedHash: string
): Promise<{ valid: boolean; needsMigration: boolean }> {
  if (storedHash.startsWith("$2")) {
    const valid = await verifyPassword(plaintext, storedHash);
    return { valid, needsMigration: false };
  }

  const md5Hash = md5Legacy(plaintext);
  const valid = md5Hash === storedHash;
  return { valid, needsMigration: valid };
}
