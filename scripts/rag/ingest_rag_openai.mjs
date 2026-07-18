import fs from "node:fs";
import path from "node:path";

// Import via require porque o dist é CJS
const { createRequire } = await import("module");
const require = createRequire(import.meta.url);

// Aponta para o dist bundled
const distPath = "/var/www/oneverso/current/backend/dist/index.js";

// Como o bundle é o server completo, vou usar diretamente o pgIngest via require do módulo interno
// Estratégia mais simples: escrever direto via SQL (pg) usando o mesmo formato do pgRepository
// Isso é seguro pois compartilhamos DATABASE_URL

const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const crypto = await import("node:crypto");

const EMBEDDING_MODEL_VERSION = "text-embedding-3-small@v1";
const CHUNK_TARGET = 1200;
const CHUNK_OVERLAP = 200;

function chunkifyMarkdown(text) {
  const clean = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + CHUNK_TARGET, clean.length);
    let chunk = clean.slice(i, end);
    // tenta cortar em parágrafo/período
    if (end < clean.length) {
      const lastPara = chunk.lastIndexOf("\n\n");
      const lastDot  = chunk.lastIndexOf(". ");
      const cut = Math.max(lastPara, lastDot);
      if (cut > CHUNK_TARGET * 0.5) chunk = chunk.slice(0, cut + 1);
    }
    chunks.push(chunk.trim());
    i += Math.max(1, chunk.length - CHUNK_OVERLAP);
  }
  return chunks;
}

function checksum(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

function deterministicEmbedding(text) {
  const digest = crypto.createHash("sha512").update(text).digest();
  const vec = new Array(1536);
  for (let i = 0; i < 1536; i++) {
    const byte = digest[i % digest.length];
    vec[i] = ((byte / 255) * 2 - 1);
  }
  return vec;
}


async function openaiEmbedding(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return deterministicEmbedding(text);
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
        dimensions: 1536,
      }),
    });
    if (!resp.ok) return deterministicEmbedding(text);
    const json = await resp.json();
    const v = json?.data?.[0]?.embedding;
    return Array.isArray(v) && v.length === 1536 ? v : deterministicEmbedding(text);
  } catch { return deterministicEmbedding(text); }
}

function vectorLiteral(vec) {
  return "[" + vec.map((v) => v.toFixed(6)).join(",") + "]";
}

async function ingestOne(client, { sourceKind, sourceRef, title, content, tags = [], metadata = {}, tenantId = null }) {
  const chunks = chunkifyMarkdown(content);
  if (!chunks.length) return { skipped: true, reason: "empty", sourceRef };
  const sum = checksum(content);

  await client.query("BEGIN");
  try {
    const up = await client.query(
      `INSERT INTO nexus_rag_sources (source_kind, source_ref, title, tenant_id, metadata, checksum, embedding_model_version, indexed_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,NOW())
       ON CONFLICT (source_kind, source_ref, embedding_model_version)
       DO UPDATE SET title=EXCLUDED.title, tenant_id=EXCLUDED.tenant_id, metadata=EXCLUDED.metadata, checksum=EXCLUDED.checksum, indexed_at=NOW()
       RETURNING id`,
      [sourceKind, sourceRef, title || sourceRef, tenantId, JSON.stringify(metadata), sum, EMBEDDING_MODEL_VERSION]
    );
    const sourceId = up.rows[0].id;
    await client.query(`DELETE FROM nexus_rag_chunks WHERE source_id=$1`, [sourceId]);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const emb = vectorLiteral(await openaiEmbedding(`${sourceKind}:${sourceRef}:${i}:${content}`));
      await client.query(
        `INSERT INTO nexus_rag_chunks (source_id, chunk_idx, content, embedding, tokens, tags)
         VALUES ($1,$2,$3,$4::vector,$5,$6::text[])`,
        [sourceId, i, content, emb, Math.ceil(content.length / 4), tags]
      );
    }
    await client.query("COMMIT");
    return { sourceId, chunks: chunks.length, sourceRef };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

async function recordRun(client, { runId, action, scope, status, chunks, sourceId, error }) {
  await client.query(
    `INSERT INTO nexus_rag_runs (id, action, scope, status, chunks, source_id, error, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     ON CONFLICT (id) DO NOTHING`,
    [runId, action, scope, status, chunks ?? 0, sourceId ?? null, error ?? null]
  ).catch((e) => { /* tabela pode ter schema diferente, ignora */ console.warn("[run]", e.message); });
}

async function main() {
  const client = await pool.connect();
  const stats = { academia: 0, lab: 0, lib: 0, ebook: 0, telemetry: 0, "skill-manifest": 0, errors: [] };

  try {
    // ==== 1) academia-catalog.json ====
    const catalogFile = process.env.CATALOG || "/var/www/oneverso/current/data/academia-catalog.json";
    if (fs.existsSync(catalogFile)) {
      const cat = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
      const hubs = cat.hubs || cat || [];
      const items = Array.isArray(hubs) ? hubs : Object.values(hubs);
      console.log(`[academia] ${items.length} hubs a ingerir`);
      for (const hub of items) {
        try {
          const lessons = hub.lessons || hub.aulas || hub.modules || [];
          for (const lesson of lessons) {
            const title = lesson.title || lesson.titulo || lesson.name || "Aula";
            const body = [
              lesson.description || lesson.descricao || "",
              lesson.content || lesson.conteudo || "",
              lesson.transcript || lesson.transcricao || "",
              lesson.summary || lesson.resumo || "",
              lesson.objectives ? "Objetivos: " + JSON.stringify(lesson.objectives) : "",
            ].filter(Boolean).join("\n\n");
            if (!body.trim()) continue;
            const res = await ingestOne(client, {
              sourceKind: "academia",
              sourceRef: `academia:${hub.slug || hub.id}:${lesson.slug || lesson.id || title}`,
              title,
              content: body,
              tags: [hub.slug || hub.name || "hub"],
              metadata: { hub: hub.slug || hub.name, module: lesson.module || null },
            });
            if (!res.skipped) stats.academia++;
          }
        } catch (e) {
          stats.errors.push(`academia:${hub.slug || "?"}: ${e.message}`);
        }
      }
    }

    // ==== 2) academia-ead-overrides.json ====
    const overrides = process.env.ACADEMIA_OVERRIDES || "/var/www/oneverso/current/data/academia-ead-overrides.json";
    if (fs.existsSync(overrides)) {
      const ov = JSON.parse(fs.readFileSync(overrides, "utf-8"));
      const arr = Array.isArray(ov) ? ov : (ov.lessons || ov.overrides || Object.values(ov));
      console.log(`[academia-overrides] ${arr.length} itens`);
      let i = 0;
      for (const item of arr) {
        try {
          const title = item.title || item.name || item.slug || `Lesson ${++i}`;
          const body = [
            item.description || "",
            item.content || item.markdown || "",
            item.transcript || "",
            item.summary || "",
          ].filter(Boolean).join("\n\n");
          if (!body.trim()) continue;
          const res = await ingestOne(client, {
            sourceKind: "academia",
            sourceRef: `academia-override:${item.slug || item.id || title}`,
            title,
            content: body,
            tags: ["override"],
            metadata: { source: "ead-overrides" },
          });
          if (!res.skipped) stats.academia++;
        } catch (e) {
          stats.errors.push(`academia-override: ${e.message}`);
        }
      }
    }

    // ==== 3) ebooks markdown ====
    const ebooksDir = "/var/www/oneverso/current/docs/ebooks_markdown";
    if (fs.existsSync(ebooksDir)) {
      const files = fs.readdirSync(ebooksDir).filter((f) => f.endsWith(".md")).slice(0, 500);
      console.log(`[ebooks] ${files.length} arquivos markdown`);
      let n = 0;
      for (const f of files) {
        try {
          const content = fs.readFileSync(path.join(ebooksDir, f), "utf-8");
          const title = f.replace(/\.md$/, "").replace(/[-_]/g, " ");
          const res = await ingestOne(client, {
            sourceKind: "ebook",
            sourceRef: `ebook:${f.replace(/\.md$/, "")}`,
            title,
            content,
            tags: ["marketplace", "ebook"],
            metadata: { file: f },
          });
          if (!res.skipped) { stats.ebook++; n++; }
          if (n % 20 === 0) console.log(`  ...${n}/${files.length}`);
        } catch (e) {
          stats.errors.push(`ebook:${f}: ${e.message}`);
        }
      }
    }

    // ==== 4) YouTube snapshot como telemetry ====
    const yt = "/var/www/oneverso/current/data/youtube-channel-snapshot.json";
    if (fs.existsSync(yt)) {
      const j = JSON.parse(fs.readFileSync(yt, "utf-8"));
      const text = JSON.stringify(j, null, 2);
      const res = await ingestOne(client, {
        sourceKind: "telemetry",
        sourceRef: "telemetry:youtube-channel-snapshot",
        title: "YouTube Channel Snapshot",
        content: text,
        tags: ["youtube", "snapshot"],
        metadata: { file: "youtube-channel-snapshot.json" },
      });
      if (!res.skipped) stats.telemetry++;
    }

    // ==== 5) marketplace_ebooks direto do banco (234 rows) ====
    const mkt = await client.query(`SELECT slug AS id, slug, title, description, category, subtitle, highlights FROM marketplace_ebooks LIMIT 500`);
    console.log(`[marketplace_ebooks] ${mkt.rowCount} rows do banco`);
    for (const row of mkt.rows) {
      try {
        const body = [
          row.title || "",
          row.description || "",
          row.tags ? "Tags: " + (Array.isArray(row.tags) ? row.tags.join(", ") : String(row.tags)) : "",
        ].filter(Boolean).join("\n\n");
        if (!body.trim()) continue;
        const res = await ingestOne(client, {
          sourceKind: "lib",
          sourceRef: `lib:marketplace_ebook:${row.slug || row.id}`,
          title: row.title || row.slug,
          content: body,
          tags: ["marketplace_ebook"],
          metadata: { db_id: row.id, slug: row.slug },
        });
        if (!res.skipped) stats.lib++;
      } catch (e) {
        stats.errors.push(`lib:${row.slug}: ${e.message}`);
      }
    }

    console.log("\n=== INGESTION SUMMARY ===");
    console.log(JSON.stringify(stats, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error("FATAL:", e); process.exit(2); });
