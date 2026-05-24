import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());
const legacyDir = path.join(repoRoot, "legacy");
const outputJson = path.join(repoRoot, "docs", "reports", "legacy-inventory.json");
const outputMd = path.join(repoRoot, "docs", "reports", "legacy-inventory.md");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      const stat = await fs.stat(absolutePath);
      files.push({
        absolutePath,
        relativePath: path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/"),
        sizeBytes: stat.size,
        extension: path.extname(entry.name).toLowerCase() || "[sem-ext]",
      });
    }
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const files = await walk(legacyDir);
  const tracked = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);

  const byTopDirMap = new Map();
  const byExtMap = new Map();

  for (const file of files) {
    const relative = file.relativePath.replace(/^legacy\//, "");
    const topDir = relative.includes("/") ? relative.split("/")[0] : "[root]";

    const topDirStats = byTopDirMap.get(topDir) ?? { files: 0, bytes: 0 };
    topDirStats.files += 1;
    topDirStats.bytes += file.sizeBytes;
    byTopDirMap.set(topDir, topDirStats);

    const extStats = byExtMap.get(file.extension) ?? { files: 0, bytes: 0 };
    extStats.files += 1;
    extStats.bytes += file.sizeBytes;
    byExtMap.set(file.extension, extStats);
  }

  const largestFiles = [...files]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 15)
    .map((file) => ({
      path: file.relativePath,
      sizeBytes: file.sizeBytes,
      size: formatBytes(file.sizeBytes),
      extension: file.extension,
    }));

  const topDirectories = [...byTopDirMap.entries()]
    .map(([name, stats]) => ({ name, files: stats.files, sizeBytes: stats.bytes, size: formatBytes(stats.bytes) }))
    .sort((a, b) => b.sizeBytes - a.sizeBytes);

  const extensions = [...byExtMap.entries()]
    .map(([extension, stats]) => ({ extension, files: stats.files, sizeBytes: stats.bytes, size: formatBytes(stats.bytes) }))
    .sort((a, b) => b.sizeBytes - a.sizeBytes);

  const report = {
    generatedAt: new Date().toISOString(),
    legacyDir: "legacy",
    trackedFiles: tracked,
    totalBytes,
    totalSize: formatBytes(totalBytes),
    topDirectories,
    largestFiles,
    extensions,
    deletionReadiness: [
      "Migrar materiais pesados para storage externo ou AI Drive.",
      "Preservar apenas manifestos leves e mapeamentos funcionais no repositório.",
      "Confirmar que o app moderno não importa nem serve arquivos de legacy/.",
      "Executar git rm --cached -r legacy após a cobertura funcional e o arquivamento externo.",
    ],
  };

  await fs.mkdir(path.dirname(outputJson), { recursive: true });
  await fs.writeFile(outputJson, JSON.stringify(report, null, 2), "utf8");

  const md = [
    "# Inventário do diretório legacy",
    "",
    `- Gerado em: ${report.generatedAt}`,
    `- Arquivos: ${report.trackedFiles}`,
    `- Tamanho total: ${report.totalSize}`,
    "",
    "## Maiores subdiretórios",
    "",
    ...topDirectories.slice(0, 10).map((dir) => `- ${dir.name}: ${dir.size} (${dir.files} arquivos)`),
    "",
    "## Maiores arquivos",
    "",
    ...largestFiles.slice(0, 10).map((file) => `- ${file.path}: ${file.size}`),
    "",
    "## Critérios para exclusão do legacy/ do Git",
    "",
    ...report.deletionReadiness.map((item) => `- ${item}`),
    "",
  ].join("\n");

  await fs.writeFile(outputMd, md, "utf8");

  console.log(`Inventário gerado em ${path.relative(repoRoot, outputJson)}`);
  console.log(`Resumo markdown em ${path.relative(repoRoot, outputMd)}`);
  console.log(`Arquivos: ${tracked} | Tamanho: ${formatBytes(totalBytes)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
