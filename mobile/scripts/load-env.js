const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const candidateFiles = [
  path.resolve(__dirname, "../.env.local"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env.local"),
  path.resolve(__dirname, "../../.env"),
];

for (const filePath of candidateFiles) {
  if (!fs.existsSync(filePath)) continue;
  dotenv.config({ path: filePath, override: false });
}
