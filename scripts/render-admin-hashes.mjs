#!/usr/bin/env node
import crypto from "node:crypto";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Uso: node scripts/render-admin-hashes.mjs <email> <senha>");
  process.exit(1);
}

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

console.log(`ADMIN_EMAIL_SHA256=${sha256(email.trim().toLowerCase())}`);
console.log(`ADMIN_PASSWORD_SHA256=${sha256(password)}`);
