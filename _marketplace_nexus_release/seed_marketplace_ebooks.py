#!/usr/bin/env python3
"""
Seed dos 132 e-books no banco Postgres a partir de
docs/ebooks_markdown/manifest_marketplace_ebooks.json.

Uso (no servidor de produção):
    DATABASE_URL=postgres://usuario:senha@host:5432/db \
        python3 scripts/seed_marketplace_ebooks.py

Idempotente: usa ON CONFLICT (slug) DO UPDATE em marketplace_ebooks.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import psycopg2  # type: ignore
    from psycopg2.extras import Json  # type: ignore
except ImportError:  # pragma: no cover
    print("Instale psycopg2 antes de rodar: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs" / "ebooks_markdown" / "manifest_marketplace_ebooks.json"

UPSERT_SQL = """
INSERT INTO marketplace_ebooks (
    slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
    pages, category, cover_gradient, html_path, pdf_path, cover_path,
    highlights, source_markdown, unlock_pack_slug, status, updated_at
) VALUES (
    %(slug)s, %(order)s, %(title)s, %(subtitle)s, %(description)s,
    %(cost_cents)s, %(resale_price_cents)s, %(pages)s, %(category)s,
    %(cover_gradient)s, %(html_path)s, %(pdf_path)s, %(cover_path)s,
    %(highlights)s, %(source_markdown)s, %(unlock_pack_slug)s, 'active', NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    "order"            = EXCLUDED."order",
    title              = EXCLUDED.title,
    subtitle           = EXCLUDED.subtitle,
    description        = EXCLUDED.description,
    cost_cents         = EXCLUDED.cost_cents,
    resale_price_cents = EXCLUDED.resale_price_cents,
    pages              = EXCLUDED.pages,
    category           = EXCLUDED.category,
    cover_gradient     = EXCLUDED.cover_gradient,
    html_path          = EXCLUDED.html_path,
    pdf_path           = EXCLUDED.pdf_path,
    cover_path         = EXCLUDED.cover_path,
    highlights         = EXCLUDED.highlights,
    source_markdown    = EXCLUDED.source_markdown,
    unlock_pack_slug   = EXCLUDED.unlock_pack_slug,
    status             = 'active',
    updated_at         = NOW();
"""


def main() -> int:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        print("DATABASE_URL não definido.", file=sys.stderr)
        return 2
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    entries = data["entries"]

    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    inserted = 0
    try:
        for entry in entries:
            params = {
                "slug": entry["slug"],
                "order": entry["order"],
                "title": entry["title"],
                "subtitle": entry.get("subtitle"),
                "description": entry.get("description"),
                "cost_cents": entry["costCents"],
                "resale_price_cents": entry["resalePriceCents"],
                "pages": entry["pages"],
                "category": entry["category"],
                "cover_gradient": entry.get("coverGradient"),
                "html_path": entry["htmlPath"],
                "pdf_path": entry["pdfPath"],
                "cover_path": entry.get("coverPublicPath"),
                "highlights": Json(entry.get("highlights", [])),
                "source_markdown": entry.get("sourceMarkdown"),
                "unlock_pack_slug": entry["unlockPackSlug"],
            }
            cur.execute(UPSERT_SQL, params)
            inserted += 1
        conn.commit()
        print(f"✓ Upsert de {inserted} ebooks concluído.")
    except Exception as exc:  # pragma: no cover
        conn.rollback()
        print(f"Falha no seed: {exc}", file=sys.stderr)
        return 1
    finally:
        cur.close()
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
