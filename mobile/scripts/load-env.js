import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const mobileRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(mobileRoot, "..");

const candidates = [
  path.join(repoRoot, ".env"),
  path.join(mobileRoot, ".env"),
  path.join(repoRoot, ".env.local"),
  path.join(mobileRoot, ".env.local"),
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: false });
  }
}
