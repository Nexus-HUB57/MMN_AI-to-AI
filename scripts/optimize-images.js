const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const inputDir = process.argv[2]
  ? path.resolve(repoRoot, process.argv[2])
  : path.resolve(repoRoot, "frontend/public/source-images");
const outputDir = process.argv[3]
  ? path.resolve(repoRoot, process.argv[3])
  : path.resolve(repoRoot, "frontend/public/images");

if (!fs.existsSync(inputDir)) {
  console.error(`Diretório de origem não encontrado: ${inputDir}`);
  console.error("Informe um diretório explícito: node scripts/optimize-images.js <origem> <destino>");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach((file) => {
  const inputFile = path.join(inputDir, file);
  const outputFile = path.join(outputDir, `${path.parse(file).name}.webp`);

  if (fs.statSync(inputFile).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
    sharp(inputFile)
      .webp({ quality: 80 })
      .toFile(outputFile)
      .then(() => console.log(`Converted ${file} to WebP`))
      .catch((err) => console.error(`Error converting ${file}:`, err));
  } else if (fs.statSync(inputFile).isFile() && /\.svg$/i.test(file)) {
    fs.copyFileSync(inputFile, path.join(outputDir, file));
    console.log(`Copied SVG ${file}`);
  }
});
