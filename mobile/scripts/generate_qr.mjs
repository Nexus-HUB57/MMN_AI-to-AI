import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const mobileRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(mobileRoot, "assets", "generated");
const outputFile = path.join(outputDir, "dev-qr.png");
const value = process.env.MMN_MOBILE_QR_VALUE || process.env.EXPO_PUBLIC_APP_URL || "https://github.com/Nexus-HUB57/MMN_AI-to-AI";

fs.mkdirSync(outputDir, { recursive: true });
await QRCode.toFile(outputFile, value, {
  margin: 2,
  width: 512,
  color: {
    dark: "#111827",
    light: "#FFFFFFFF",
  },
});

console.log(`QR gerado em: ${outputFile}`);
console.log(`Conteudo: ${value}`);
