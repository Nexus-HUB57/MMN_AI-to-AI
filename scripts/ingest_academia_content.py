#!/usr/bin/env python3
"""
ingest_academia_content.py
==========================
Importa o conteúdo MD da pasta `AcademIA/` para a tabela `academia_lessons`
do PostgreSQL.

Mapeamento section_slug:
  cursos/        -> 'curso'
  treinamentos/  -> 'treinamento'
  webinars/      -> 'webinar'
  playbooks/     -> 'playbook'
  tutoriais/     -> 'tutorial'
  Lab-Nexus/     -> 'lab'
  Lib-Nexus/     -> 'lib'
  certificacoes/ -> 'certificacao'
  apostilas/     -> 'apostila'

Heuristica de level (pelo nome do diretorio de trilha):
  fundamental/ -> ('fundamental', 'iniciante')
  agente/      -> ('agente', 'operador')
  master/      -> ('master', 'estrategista')
  elite/       -> ('elite', 'elite')

Modos:
  - Sem DATABASE_URL ou com --dry-run: apenas grava
    data/academia-ead-overrides.json (consumido por academiaEadRouter).
  - Com DATABASE_URL: tambem realiza UPSERT em public.academia_lessons.

Idempotente em ambos os modos.

Uso:
    python3 scripts/ingest_academia_content.py
    DATABASE_URL=postgres://... python3 scripts/ingest_academia_content.py
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(os.environ.get("ROOT_DIR") or Path(__file__).resolve().parents[1])
ACADEMIA = ROOT / "AcademIA"
OVERRIDES_FILE = ROOT / "data" / "academia-ead-overrides.json"

SECTION_BY_DIR = {
    "cursos": "curso",
    "treinamentos": "treinamento",
    "webinars": "webinar",
    "playbooks": "playbook",
    "tutoriais": "tutorial",
    "Lab-Nexus": "lab",
    "Lib-Nexus": "lib",
    "certificacoes": "certificacao",
    "apostilas": "apostila",
}

LEVEL_BY_DIR = {
    "fundamental": ("fundamental", "iniciante"),
    "agente": ("agente", "operador"),
    "master": ("master", "estrategista"),
    "elite": ("elite", "elite"),
}

CONTENT_DIRS = list(SECTION_BY_DIR.keys())


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:128] or "lesson"


def parse_frontmatter(md_text: str):
    if not md_text.startswith("---"):
        return {}, md_text
    end = md_text.find("\n---", 3)
    if end < 0:
        return {}, md_text
    block = md_text[3:end].strip()
    body = md_text[end + 4:].lstrip("\n")
    out = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            value = [p.strip().strip('"').strip("'") for p in inner.split(",")] if inner else []
        out[key] = value
    return out, body


def first_h1(body: str):
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s.lstrip("# ").strip()
    return None


def first_paragraph(body: str, max_len: int = 220):
    for chunk in body.split("\n\n"):
        clean = chunk.strip()
        if not clean or clean.startswith("#") or clean.startswith("|"):
            continue
        clean = re.sub(r"\s+", " ", clean)
        return clean[:max_len]
    return None


def lesson_id_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    digest = hashlib.sha1(rel.encode("utf-8")).hexdigest()[:8]
    base = slugify(path.stem)
    return base + "-" + digest


def discover_lessons():
    lessons = []
    for content_dir in CONTENT_DIRS:
        section_root = ACADEMIA / content_dir
        if not section_root.exists():
            continue
        for md_path in section_root.rglob("*.md"):
            try:
                raw = md_path.read_text(encoding="utf-8")
            except Exception as exc:
                print("[warn] nao foi possivel ler " + str(md_path) + ": " + str(exc), file=sys.stderr)
                continue

            fm, body = parse_frontmatter(raw)
            rel = md_path.relative_to(ROOT).as_posix()

            section_slug = SECTION_BY_DIR.get(content_dir, "curso")
            level = "fundamental"
            required_tier = "iniciante"
            for part in md_path.parts:
                key = part.lower()
                if key in LEVEL_BY_DIR:
                    level, required_tier = LEVEL_BY_DIR[key]
                    break

            title = None
            fm_title = fm.get("title")
            if isinstance(fm_title, str):
                title = fm_title
            if not title:
                title = first_h1(body)
            if not title:
                title = md_path.stem.replace("-", " ").replace("_", " ").title()

            subtitle = None
            fm_desc = fm.get("description")
            if isinstance(fm_desc, str):
                subtitle = fm_desc
            if not subtitle:
                subtitle = first_paragraph(body)

            tags_raw = fm.get("tags")
            tags = tags_raw if isinstance(tags_raw, list) else []

            now = datetime.now(timezone.utc).isoformat()
            lessons.append({
                "lesson_id": lesson_id_for(md_path),
                "section_slug": section_slug,
                "title": title,
                "subtitle": subtitle,
                "level": level,
                "required_tier": required_tier,
                "duration_s": None,
                "video_url": None,
                "md_url": "/" + rel,
                "html_url": None,
                "pdf_url": None,
                "thumbnail_url": None,
                "cover_url": None,
                "youtube_status": None,
                "youtube_channel": None,
                "is_published": True,
                "is_featured": False,
                "sort_order": 1000,
                "published_at": now,
                "tags": tags,
                "updated_at": now,
                "updated_by": "ingest_academia_content",
                "source_md_relpath": rel,
            })
    return lessons


def write_overrides_file(lessons):
    OVERRIDES_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "items": [
            {
                "lessonId": l["lesson_id"],
                "sectionSlug": l["section_slug"],
                "title": l["title"],
                "subtitle": l.get("subtitle"),
                "description": l.get("subtitle"),
                "level": l["level"],
                "requiredTier": l["required_tier"],
                "videoUrl": "",
                "pdfUrl": "",
                "mdPath": l.get("source_md_relpath"),
                "thumbnailUrl": "",
                "tags": l.get("tags", []),
                "isPublished": True,
                "isFeatured": False,
                "sortOrder": 1000,
                "notes": "Importado automaticamente por scripts/ingest_academia_content.py",
                "updatedAt": l["updated_at"],
                "updatedBy": "ingest_academia_content",
            }
            for l in lessons
        ],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    OVERRIDES_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("[ingest] Overrides JSON gerado em " + str(OVERRIDES_FILE.relative_to(ROOT)) + " (" + str(len(lessons)) + " itens)")


def upsert_into_postgres(lessons):
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        print("[ingest] psycopg2 nao instalado - use --dry-run.", file=sys.stderr)
        return 0

    dsn = os.environ["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    sql = (
        "INSERT INTO public.academia_lessons ("
        "  lesson_id, section_slug, title, subtitle, level, required_tier, duration_s,"
        "  video_url, md_url, html_url, pdf_url, thumbnail_url, cover_url,"
        "  youtube_status, youtube_channel, is_published, featured, sort_order,"
        "  published_at, tags, updated_at, updated_by"
        ") VALUES %s "
        "ON CONFLICT (lesson_id) DO UPDATE SET "
        "  section_slug=EXCLUDED.section_slug, title=EXCLUDED.title, subtitle=EXCLUDED.subtitle,"
        "  level=EXCLUDED.level, required_tier=EXCLUDED.required_tier, duration_s=EXCLUDED.duration_s,"
        "  md_url=EXCLUDED.md_url, is_published=EXCLUDED.is_published, featured=EXCLUDED.featured,"
        "  sort_order=EXCLUDED.sort_order, published_at=EXCLUDED.published_at, tags=EXCLUDED.tags,"
        "  updated_at=NOW(), updated_by='ingest_academia_content';"
    )
    rows = [
        (
            l["lesson_id"], l["section_slug"], l["title"], l.get("subtitle"),
            l["level"], l["required_tier"], l.get("duration_s"),
            l.get("video_url"), l.get("md_url"), l.get("html_url"), l.get("pdf_url"),
            l.get("thumbnail_url"), l.get("cover_url"),
            l.get("youtube_status"), l.get("youtube_channel"),
            l["is_published"], l["is_featured"], l["sort_order"],
            l["published_at"], l.get("tags", []),
            l["updated_at"], l["updated_by"],
        )
        for l in lessons
    ]
    try:
        execute_values(cur, sql, rows, page_size=200)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
    return len(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Apenas gera data/academia-ead-overrides.json (sem PostgreSQL).")
    args = parser.parse_args()

    lessons = discover_lessons()
    if not lessons:
        print("[ingest] Nenhum conteudo MD encontrado em AcademIA/.", file=sys.stderr)
        return 1

    print("[ingest] " + str(len(lessons)) + " licoes descobertas.")
    counts = {}
    for l in lessons:
        counts[l["section_slug"]] = counts.get(l["section_slug"], 0) + 1
    for section, count in sorted(counts.items()):
        print("  - " + section + " -> " + str(count))

    write_overrides_file(lessons)

    if args.dry_run or not os.environ.get("DATABASE_URL"):
        print("[ingest] Sem DATABASE_URL ou --dry-run: PostgreSQL nao foi tocado.")
        return 0

    affected = upsert_into_postgres(lessons)
    print("[ingest] " + str(affected) + " linhas upsertadas em public.academia_lessons.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
