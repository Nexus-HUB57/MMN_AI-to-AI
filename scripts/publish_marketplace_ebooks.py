#!/usr/bin/env python3
"""
publish_marketplace_ebooks.py
=============================
Publicador autossuficiente do catálogo Marketplace Nexus.

Diferente de `generate_marketplace_ebooks.py` (que depende de WeasyPrint para
gerar PDF), este script só precisa do **Python stdlib**.

Ele lê o `manifest_marketplace_ebooks.json` já gerado e:

  1) Materializa um HTML responsivo para cada um dos 132 ebooks em
     `frontend/public/ebooks/<slug>.html`.
  2) Materializa um arquivo SVG-cover por ebook em
     `frontend/public/ebooks/covers/<slug>.svg` (usado como fallback quando
     a capa webp ainda não está disponível).
  3) Cria placeholders PDF (`<slug>.pdf` com conteúdo mínimo) só se a opção
     `--with-pdf-placeholder` for passada — assim, mesmo sem WeasyPrint,
     `pdfPath` declarado no catálogo nunca quebra com 404.
  4) Atualiza `frontend/src/lib/generated-marketplace-ebooks.ts`
     mantendo paridade com o manifesto.
  5) Reescreve `docs/MARKETPLACE_EBOOKS_SYNC_REPORT.md` com a contagem
     publicada.

Idempotente: pode ser rodado várias vezes sem efeitos colaterais.

Uso:
    python3 scripts/publish_marketplace_ebooks.py
    python3 scripts/publish_marketplace_ebooks.py --with-pdf-placeholder
    ROOT_DIR=/srv/oneverso python3 scripts/publish_marketplace_ebooks.py
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import html
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(os.environ.get("ROOT_DIR") or Path(__file__).resolve().parents[1])
MANIFEST = ROOT / "_marketplace_nexus_release" / "manifest_marketplace_ebooks.json"
FALLBACK_MANIFEST = ROOT / "docs" / "ebooks_markdown" / "manifest_marketplace_ebooks.json"
PUBLIC_ROOT = ROOT / "frontend" / "public" / "ebooks"
PUBLIC_PDF = PUBLIC_ROOT / "pdf"
PUBLIC_COVERS = PUBLIC_ROOT / "covers"
EBOOK_COVERS_SOURCE = ROOT / "assets" / "ebook_covers"
TS_OUTPUT = ROOT / "frontend" / "src" / "lib" / "generated-marketplace-ebooks.ts"
REPORT = ROOT / "docs" / "MARKETPLACE_EBOOKS_SYNC_REPORT.md"

HTML_TEMPLATE = """<!doctype html>
<html lang=\"pt-BR\">
<head>
<meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
<title>{title}</title>
<meta name=\"description\" content=\"{description}\">
<style>
  :root {{ color-scheme: dark; }}
  body {{
    font-family: 'Inter', system-ui, sans-serif;
    background: #0b1220;
    color: #e5e7eb;
    margin: 0;
    line-height: 1.6;
  }}
  main {{
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px 96px;
  }}
  header {{
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    padding-bottom: 24px;
    margin-bottom: 32px;
  }}
  .badge {{
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    font-size: 12px;
    margin-bottom: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }}
  h1 {{
    font-size: 32px;
    margin: 0 0 12px;
    color: #f8fafc;
  }}
  h2 {{
    color: #cbd5f5;
    margin-top: 32px;
  }}
  p.subtitle {{
    color: #94a3b8;
    margin: 0;
  }}
  ul.highlights li {{
    margin-bottom: 8px;
  }}
  footer {{
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    font-size: 13px;
    color: #64748b;
  }}
  a {{ color: #38bdf8; }}
</style>
</head>
<body>
  <main>
    <header>
      <span class=\"badge\">{category}</span>
      <h1>{title}</h1>
      <p class=\"subtitle\">{subtitle}</p>
    </header>
    <section>
      <h2>Sobre este e-book</h2>
      <p>{description}</p>
    </section>
    <section>
      <h2>Capítulos principais</h2>
      <ul class=\"highlights\">{highlights_html}</ul>
    </section>
    <footer>
      Marketplace Nexus · Nexus Affil'IA'te · Pack: {pack}
    </footer>
  </main>
</body>
</html>
"""

SVG_COVER_TEMPLATE = """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 600\" preserveAspectRatio=\"xMidYMid slice\">
  <defs>
    <linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"{c1}\"/>
      <stop offset=\"100%\" stop-color=\"{c2}\"/>
    </linearGradient>
  </defs>
  <rect width=\"400\" height=\"600\" fill=\"url(#g)\"/>
  <text x=\"200\" y=\"280\" text-anchor=\"middle\" font-family=\"Inter, sans-serif\" font-size=\"22\" fill=\"#fff\" font-weight=\"700\">{title}</text>
  <text x=\"200\" y=\"320\" text-anchor=\"middle\" font-family=\"Inter, sans-serif\" font-size=\"14\" fill=\"rgba(255,255,255,0.78)\">{pack}</text>
  <text x=\"200\" y=\"560\" text-anchor=\"middle\" font-family=\"Inter, sans-serif\" font-size=\"12\" fill=\"rgba(255,255,255,0.6)\">Marketplace Nexus</text>
</svg>
"""

GRADIENT_PRESETS = {
    "pack-a2":    ("#0b2b3b", "#1a4a6f"),
    "pack-a2ii":  ("#1d3b0f", "#426f1a"),
    "pack-a2iii": ("#2b0f3b", "#6d1a6f"),
    "pack-ag":    ("#3b1b0f", "#8b4513"),
}

DEFAULT_GRADIENT = ("#111827", "#1f2937")


def load_manifest() -> dict:
    target = MANIFEST if MANIFEST.exists() else FALLBACK_MANIFEST
    if not target.exists():
        print(f"[publish] manifest não encontrado: {MANIFEST} nem {FALLBACK_MANIFEST}", file=sys.stderr)
        sys.exit(1)
    return json.loads(target.read_text(encoding="utf-8"))


def render_ebook_html(entry: dict) -> str:
    highlights = entry.get("highlights") or []
    highlights_html = "".join(f"<li>{html.escape(str(h))}</li>" for h in highlights) or "<li>Conteúdo completo no PDF.</li>"
    return HTML_TEMPLATE.format(
        title=html.escape(entry.get("title", "")),
        subtitle=html.escape(entry.get("subtitle") or ""),
        description=html.escape((entry.get("description") or "")[:480]),
        category=html.escape(entry.get("category") or "Raiz MMN AI-to-AI"),
        highlights_html=highlights_html,
        pack=html.escape(entry.get("unlockPackSlug") or "pack-a2"),
    )


def render_svg_cover(entry: dict) -> str:
    pack = entry.get("unlockPackSlug") or "pack-a2"
    c1, c2 = GRADIENT_PRESETS.get(pack, DEFAULT_GRADIENT)
    title_lines = (entry.get("title") or entry.get("slug") or "")[:60]
    return SVG_COVER_TEMPLATE.format(c1=c1, c2=c2, title=html.escape(title_lines), pack=html.escape(pack))


def serialize_ts_value(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        body = ", ".join(serialize_ts_value(v) for v in value)
        return f"[{body}]"
    if isinstance(value, dict):
        body = ", ".join(f"{json.dumps(k)}: {serialize_ts_value(v)}" for k, v in value.items())
        return f"{{ {body} }}"
    text = str(value)
    return json.dumps(text, ensure_ascii=False)


def render_ts(manifest: dict) -> str:
    total = manifest.get("total_ebooks", len(manifest.get("entries", [])))
    pack_totals = manifest.get("pack_totals", {})
    entries = manifest.get("entries", [])
    lines = [
        "// Arquivo gerado automaticamente por scripts/publish_marketplace_ebooks.py",
        "// NÃO editar manualmente — rode o script para regenerar.",
        "import type { MarketplaceEbook } from './nexus-marketplace';",
        "",
        f"export const GENERATED_MARKETPLACE_TOTAL_EBOOKS = {total};",
        f"export const GENERATED_MARKETPLACE_PACK_TOTALS = {json.dumps(pack_totals, ensure_ascii=False)} as const;",
        "",
        "export const GENERATED_MARKETPLACE_EBOOKS: MarketplaceEbook[] = [",
    ]
    for entry in entries:
        body = ", ".join(
            f"{k}: {serialize_ts_value(v)}"
            for k, v in entry.items()
            if k not in {"source_markdown"}
        )
        lines.append(f"  {{ {body} }},")
    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--with-pdf-placeholder", action="store_true",
                        help="Cria PDFs placeholder (1KB) para evitar 404 no catálogo enquanto WeasyPrint roda em outra etapa.")
    args = parser.parse_args()

    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.mkdir(parents=True, exist_ok=True)
    PUBLIC_COVERS.mkdir(parents=True, exist_ok=True)

    manifest = load_manifest()
    entries = manifest.get("entries", [])

    html_count = 0
    cover_count = 0
    pdf_placeholder_count = 0
    cover_webp_copies = 0

    for entry in entries:
        slug = entry["slug"]
        # 1) HTML
        (PUBLIC_ROOT / f"{slug}.html").write_text(render_ebook_html(entry), encoding="utf-8")
        html_count += 1

        # 2) Cover SVG fallback
        (PUBLIC_COVERS / f"{slug}.svg").write_text(render_svg_cover(entry), encoding="utf-8")
        cover_count += 1

        # 2b) Se existe capa webp em assets/, copiar para covers/
        order_str = str(entry.get("order", "")).zfill(2)
        candidate_webps = [
            EBOOK_COVERS_SOURCE / f"{order_str}_{slug.split('-', 2)[-1].replace('-', '_')}.webp",
        ]
        for candidate in candidate_webps:
            if candidate.exists():
                (PUBLIC_COVERS / f"{slug}.webp").write_bytes(candidate.read_bytes())
                cover_webp_copies += 1
                break

        # 3) PDF placeholder opcional
        if args.with_pdf_placeholder:
            pdf_path = PUBLIC_PDF / f"{slug}.pdf"
            if not pdf_path.exists():
                pdf_path.write_bytes(
                    b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<<>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<>>\nstartxref\n0\n%%EOF\n"
                )
                pdf_placeholder_count += 1

    # 4) TS export
    TS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUTPUT.write_text(render_ts(manifest), encoding="utf-8")

    # 5) Sync report
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    REPORT.write_text(
        "# Marketplace Nexus · Sync Report\n\n"
        f"- Gerado em: `{ts}`\n"
        f"- Total de ebooks no catálogo: **{len(entries)}**\n"
        f"- HTML publicados em `frontend/public/ebooks/`: **{html_count}**\n"
        f"- Capas SVG (fallback) em `frontend/public/ebooks/covers/`: **{cover_count}**\n"
        f"- Capas WebP copiadas de `assets/ebook_covers/`: **{cover_webp_copies}**\n"
        f"- PDFs placeholder gerados: **{pdf_placeholder_count}**\n\n"
        "Artefatos:\n\n"
        "- `frontend/public/ebooks/<slug>.html`\n"
        "- `frontend/public/ebooks/pdf/<slug>.pdf` (placeholder se WeasyPrint não rodou)\n"
        "- `frontend/public/ebooks/covers/<slug>.svg` (fallback)\n"
        "- `frontend/public/ebooks/covers/<slug>.webp` (quando há master em `assets/ebook_covers/`)\n"
        "- `frontend/src/lib/generated-marketplace-ebooks.ts`\n"
        "- `_marketplace_nexus_release/manifest_marketplace_ebooks.json`\n",
        encoding="utf-8",
    )

    print(f"[publish] HTMLs gerados: {html_count}")
    print(f"[publish] Capas SVG: {cover_count}  ·  Capas WebP copiadas: {cover_webp_copies}")
    print(f"[publish] PDFs placeholder: {pdf_placeholder_count}")
    print(f"[publish] TS export: {TS_OUTPUT.relative_to(ROOT)}")
    print(f"[publish] Sync report: {REPORT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
