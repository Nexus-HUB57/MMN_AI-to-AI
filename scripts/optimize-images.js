const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./legacy/images123"; // Ou o diretório de assets do frontend
const outputDir = "./frontend/public/images"; // Onde as imagens otimizadas serão salvas

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const inputFile = path.join(inputDir, file);
  const outputFile = path.join(outputDir, `${path.parse(file).name}.webp`);

  if (fs.statSync(inputFile).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
    sharp(inputFile)
      .webp({ quality: 80 })
      .toFile(outputFile)
      .then(() => console.log(`Converted ${file} to WebP`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  } else if (fs.statSync(inputFile).isFile() && /\.svg$/i.test(file)) {
    // Para SVGs, usar SVGO ou otimização manual
    fs.copyFileSync(inputFile, path.join(outputDir, file)); // Apenas copia por enquanto
    console.log(`Copied SVG ${file}`);
  }
});
