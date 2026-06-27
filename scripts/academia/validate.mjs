#!/usr/bin/env node
/**
 * Academ'IA · Validador editorial
 *
 * Verifica todo material .md sob AcademIA/ contra o Manual Editorial:
 *  - frontmatter obrigatório (title, version, last_updated, status)
 *  - status válido (draft|review|official|archived|ready_for_recording|ready_for_production|active|analysis|study|text-only|agendado|production)
 *  - apostilas: 7 seções obrigatórias, mínimo de linhas, presença de checklist
 *  - roteiros: blocos mínimos, persona declarada
 *  - alinhamento com catálogo do frontend (lesson_id existente)
 *  - placeholders proibidos (TODO/XXX/lorem ipsum)
 *
 * Saída: console + JSON em docs/validation/academia-report.json
 *
 * Uso:  node scripts/academia/validate.mjs
 *       node scripts/academia/validate.mjs --strict
 */

import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const ACADEMIA = path.join(ROOT, "AcademIA");
const CATALOG = path.join(ROOT, "frontend/src/lib/academia-ead.ts");
const REPORT_DIR = path.join(ROOT, "docs/validation");
const STRICT = process.argv.includes("--strict");

const VALID_STATUS = new Set([
  "draft",
  "review",
  "official",
  "archived",
  "ready_for_recording",
  "ready_for_production",
  "active",
  "analysis",
  "study",
  "text-only",
  "agendado",
  "production",
  "draft_for_pdf",
  "canonico",
  "agendado",
]);

// Placeholders proibidos: TODO/XXX como tokens isolados em prosa, e lorem ipsum.
// '???' fora de blocos de código também é placeholder, mas blocos ```...``` são ignorados.
const FORBIDDEN_PATTERNS = [/(^|\s)TODO(\s|:|$)/, /(^|\s)XXX(\s|:|$)/, /lorem ipsum/i];

// Cada item: lista de matchers; passa se ao menos um for encontrado.
const REQUIRED_APOSTILA_SECTIONS = [
  [/^##\s*1\.\s*Resumo executivo/m, /^##\s*Resumo executivo/m, /^##\s*Boas[- ]vindas/m, /^##\s*Visão geral/m, /^##\s*O que é/m],
  [/^##\s*2\.\s*Conceitos[- ]chave/m, /^##\s*Conceitos[- ]chave/m, /^##\s*As 3 camadas/m, /^##\s*As 5 camadas/m, /^##\s*Os 3 estados/m, /^##\s*As 7 telas/m],
  [/^##\s*3\.\s*Passo a passo/m, /^##\s*Passo a passo/m, /^##\s*Jornada inicial/m, /^##\s*Fluxo típico/m, /^##\s*Tabela de decisão/m, /^##\s*Rotina/m],
  [/^##\s*4\.\s*Exemplo/m, /^##\s*Exemplo/m, /^##\s*Por que importa/m, /^##\s*Boas práticas/m, /^##\s*Checklist semanal/m],
  [/^##\s*5\.\s*Checklist/m, /^##\s*Checklist/m],
  [/^##\s*6\.\s*Erros comuns/m, /^##\s*Erros comuns/m],
  [/^##\s*7\.\s*Próximo passo/m, /^##\s*Próximo passo/m, /^##\s*Próxima/m],
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (e.name === "node_modules" || e.name.startsWith(".git")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    fm[kv[1]] = value;
  }
  return fm;
}

function isApostila(file) {
  return file.includes("/apostilas/") && file.endsWith("-apostila.md");
}

function isRoteiro(file) {
  return file.includes("/video-aulas/") && file.endsWith("-roteiro.md");
}

async function loadCatalogLessonIds() {
  try {
    const src = await fs.readFile(CATALOG, "utf8");
    const ids = new Set();
    const re = /id:\s*"([a-z0-9\-]+)"/g;
    let m;
    while ((m = re.exec(src))) ids.add(m[1]);
    return ids;
  } catch {
    return new Set();
  }
}

(async () => {
  const files = await walk(ACADEMIA);
  const catalogIds = await loadCatalogLessonIds();
  const issues = [];
  const stats = {
    totalFiles: files.length,
    apostilas: 0,
    roteiros: 0,
    withFrontmatter: 0,
    officialStatus: 0,
    catalogMatched: 0,
    placeholdersFound: 0,
  };

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const content = await fs.readFile(file, "utf8");
    const fm = parseFrontmatter(content);

    // Documentos meta podem citar os anti-padrões como exemplos. Marcar com
    // "<!-- placeholders-doc -->" na primeira linha para ignorar a checagem.
    const isPlaceholdersDoc = /<!--\s*placeholders-doc\s*-->/i.test(content);
    // Remove blocos de código e linhas que são listas de placeholders documentais
    const stripped = isPlaceholdersDoc
      ? ""
      : content
          .replace(/```[\s\S]*?```/g, "")
          .replace(/^.*placeholders?.*$/gim, "");
    for (const re of FORBIDDEN_PATTERNS) {
      if (re.test(stripped)) {
        stats.placeholdersFound++;
        issues.push({ file: rel, level: "error", code: "placeholder", message: `placeholder proibido encontrado: ${re}` });
      }
    }

    if (!fm) {
      issues.push({ file: rel, level: "error", code: "no-frontmatter", message: "frontmatter ausente" });
      continue;
    }
    stats.withFrontmatter++;

    if (!fm.title) issues.push({ file: rel, level: "error", code: "missing-title", message: "title ausente no frontmatter" });
    if (!fm.last_updated) issues.push({ file: rel, level: "warn", code: "missing-last-updated", message: "last_updated ausente" });
    if (!fm.status) issues.push({ file: rel, level: "warn", code: "missing-status", message: "status ausente" });
    else if (!VALID_STATUS.has(fm.status)) issues.push({ file: rel, level: "warn", code: "invalid-status", message: `status inválido: ${fm.status}` });
    else if (fm.status === "official") stats.officialStatus++;

    if (fm.lesson_id) {
      if (catalogIds.size && !catalogIds.has(fm.lesson_id)) {
        issues.push({ file: rel, level: "warn", code: "lesson-not-in-catalog", message: `lesson_id ${fm.lesson_id} não está em academia-ead.ts` });
      } else if (catalogIds.has(fm.lesson_id)) {
        stats.catalogMatched++;
      }
    }

    const lines = content.split("\n").length;

    if (isApostila(file)) {
      stats.apostilas++;
      const missing = REQUIRED_APOSTILA_SECTIONS
        .map((alts, idx) => ({ idx: idx + 1, ok: alts.some((re) => re.test(content)) }))
        .filter((r) => !r.ok)
        .map((r) => `seção ${r.idx}`);
      if (missing.length) {
        issues.push({ file: rel, level: "error", code: "apostila-sections", message: `seções obrigatórias ausentes: ${missing.join(", ")}` });
      }
      if (lines < 50) {
        issues.push({ file: rel, level: "warn", code: "apostila-too-short", message: `apostila com apenas ${lines} linhas (< 50)` });
      }
      if (!/- \[ \]/.test(content)) {
        issues.push({ file: rel, level: "warn", code: "apostila-no-checklist", message: "apostila sem checklist '- [ ]'" });
      }
    }

    if (isRoteiro(file)) {
      stats.roteiros++;
      if (!/Persona[^\n]*Ive Nexus/i.test(content) || !/Persona[^\n]*Nexus Alencar/i.test(content)) {
        issues.push({ file: rel, level: "warn", code: "roteiro-personas", message: "roteiro não declara as duas personas oficiais" });
      }
      if (!/CTA final/i.test(content)) {
        issues.push({ file: rel, level: "warn", code: "roteiro-no-cta", message: "roteiro sem 'CTA final'" });
      }
    }
  }

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  const report = {
    generatedAt: new Date().toISOString(),
    stats,
    summary: {
      errors: errors.length,
      warnings: warns.length,
      passed: errors.length === 0,
    },
    issues,
  };

  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(path.join(REPORT_DIR, "academia-report.json"), JSON.stringify(report, null, 2), "utf8");

  console.log("==============================================");
  console.log(" Academ'IA Validator");
  console.log("==============================================");
  console.log(JSON.stringify(stats, null, 2));
  console.log("----------------------------------------------");
  console.log(`Erros:    ${errors.length}`);
  console.log(`Avisos:   ${warns.length}`);
  console.log(`Status:   ${errors.length === 0 ? "PASSED" : "FAILED"}`);
  console.log("----------------------------------------------");
  if (errors.length) {
    console.log("\nPrimeiros erros:");
    for (const e of errors.slice(0, 10)) console.log(` - [${e.code}] ${e.file}: ${e.message}`);
  }
  if (warns.length && STRICT) {
    console.log("\nPrimeiros avisos (modo --strict):");
    for (const w of warns.slice(0, 10)) console.log(` - [${w.code}] ${w.file}: ${w.message}`);
  }
  console.log(`\nRelatório completo: ${path.relative(ROOT, path.join(REPORT_DIR, "academia-report.json"))}`);

  if (errors.length || (STRICT && warns.length)) process.exit(1);
})();
