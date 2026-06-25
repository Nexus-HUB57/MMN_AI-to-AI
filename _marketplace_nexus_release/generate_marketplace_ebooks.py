#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
import unicodedata
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

import markdown
from weasyprint import HTML

ROOT = Path('/home/user/nexus/MMN_AI-to-AI')
EBOOKS_ROOT = ROOT / 'docs' / 'ebooks_markdown'
PUBLIC_ROOT = ROOT / 'frontend' / 'public' / 'ebooks'
PUBLIC_PDF = PUBLIC_ROOT / 'pdf'
PUBLIC_COVERS = PUBLIC_ROOT / 'covers'
TS_OUTPUT = ROOT / 'frontend' / 'src' / 'lib' / 'generated-marketplace-ebooks.ts'
JSON_OUTPUT = EBOOKS_ROOT / 'manifest_marketplace_ebooks.json'
REPORT_OUTPUT = ROOT / 'docs' / 'MARKETPLACE_EBOOKS_SYNC_REPORT.md'

IGNORE_NAMES = {
    'README.md',
    'PUBLICACAO.md',
    'GITHUB_SYNC_GUIDE.md',
    'index.md',
}

COLLECTION_META = {
    'root': ('Raiz MMN AI-to-AI', 'pack-a2'),
    'As Novas Profissões geradas pela IA': ('Novas Profissões de IA', 'pack-a2'),
    'curso_universo_ia': ('Curso Universo IA', 'pack-a2'),
    'colecao_HUMAN_IA': ('Coleção HUMAN_IA', 'pack-a2'),
    'colecao_MMN_IA': ('Coleção MMN_IA', 'pack-a2ii'),
    'colecao_IA_SE_DESCREVE': ('Coleção IA se Descreve', 'pack-a2ii'),
    'colecao_IA_Perfeita': ('Coleção A IA Perfeita', 'pack-a2iii'),
    'colecao_MAESTRIA_IA_APLICADA': ('Coleção Maestria IA Aplicada', 'pack-a2iii'),
    'colecao_AXIOMA_PRIME': ('Coleção AXIOMA PRIME', 'pack-a2iii'),
    'colecao_NEXUS_PROTOCOL': ('Coleção NEXUS PROTOCOL', 'pack-ag'),
    'colecao_AgenticAI_Revolucao': ('Coleção AgenticAI Revolução', 'pack-ag'),
    'colecao_FORJA_AGENTICA': ('Coleção FORJA AGÊNTICA', 'pack-ag'),
    'colecao_GNOXS': ('Coleção GNOXS', 'pack-ag'),
}

GRADIENTS = {
    'pack-a2': 'from-[#0b2b3b] to-[#1a4a6f]',
    'pack-a2ii': 'from-[#1d3b0f] to-[#426f1a]',
    'pack-a2iii': 'from-[#2b0f3b] to-[#6d1a6f]',
    'pack-ag': 'from-[#3b1b0f] to-[#8b4513]',
    'fallback': 'from-[#111827] to-[#1f2937]',
}

PACK_SORT = {
    'pack-a2': 1,
    'pack-a2ii': 2,
    'pack-a2iii': 3,
    'pack-ag': 4,
}

CSS = """
@page { size: A4; margin: 20mm 16mm 20mm 16mm; }
html { font-family: Inter, Arial, sans-serif; }
body {
  font-family: Inter, Arial, sans-serif;
  color: #111827;
  line-height: 1.65;
  font-size: 11.5pt;
}
h1, h2, h3, h4 {
  color: #0f172a;
  page-break-after: avoid;
}
h1 {
  font-size: 24pt;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 8px;
}
h2 { font-size: 17pt; margin-top: 18pt; }
h3 { font-size: 13pt; margin-top: 14pt; }
p { margin: 0 0 10pt 0; text-align: justify; }
blockquote {
  border-left: 4px solid #0ea5e9;
  background: #eff6ff;
  padding: 10pt 12pt;
  margin: 12pt 0;
}
code { background: #f3f4f6; padding: 1pt 4pt; }
pre {
  background: #111827;
  color: #f9fafb;
  padding: 10pt 12pt;
  border-radius: 6pt;
  font-size: 9.4pt;
  overflow: hidden;
}
img {
  max-width: 100%;
  display: block;
  margin: 12pt auto;
}
img[alt=\"Capa\"] {
  max-width: 70%;
  box-shadow: 0 10px 30px rgba(0,0,0,.18);
  border-radius: 8px;
}
table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
th, td { border: 1px solid #cbd5e1; padding: 6pt 8pt; vertical-align: top; }
th { background: #f8fafc; }
ul, ol { margin: 0 0 10pt 0; padding-left: 22pt; }
hr { border: 0; border-top: 1px solid #cbd5e1; margin: 14pt 0; }
"""

HTML_TEMPLATE = """<!doctype html>
<html lang=\"pt-BR\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{title}</title>
  <style>{css}</style>
</head>
<body>{content}</body>
</html>
"""


def slugify(value: str) -> str:
    norm = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    norm = re.sub(r'[^a-zA-Z0-9]+', '-', norm).strip('-').lower()
    return norm or 'ebook'


def escape_ts(value: str) -> str:
    return value.replace('\\', '\\\\').replace('`', '\\`')


def clean_text(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip()


def first_existing(paths: Iterable[Path]) -> Path | None:
    for path in paths:
        if path.exists():
            return path
    return None


def collection_key(md_path: Path) -> str:
    rel = md_path.relative_to(EBOOKS_ROOT)
    if len(rel.parts) == 1:
        return 'root'
    return rel.parts[0]


def resolve_collection_meta(md_path: Path) -> tuple[str, str]:
    key = collection_key(md_path)
    return COLLECTION_META.get(key, (key.replace('_', ' '), 'pack-ag'))


def parse_title(lines: list[str], fallback: str) -> str:
    for line in lines[:24]:
        t = line.strip()
        if t.startswith('**') and t.endswith('**') and len(t) > 4:
            return clean_text(t.strip('*'))
        if t.startswith('# '):
            return clean_text(t[2:])
    return fallback.replace('_', ' ')


def parse_subtitle(lines: list[str], collection_label: str) -> str:
    for line in lines[:24]:
        t = line.strip()
        if t.startswith('*') and t.endswith('*') and len(t) > 4 and 'Coleção' not in t:
            return clean_text(t.strip('*'))
    return collection_label


def parse_description(lines: list[str], title: str, subtitle: str) -> str:
    joined = '\n'.join(lines)
    match = re.search(r'\*\*Sobre este ebook\*\*\s+(.+?)(?:\n\s*\n|\n\*\*Sumário\*\*)', joined, re.S)
    if match:
        paragraph = clean_text(re.sub(r'[*_`>#-]+', ' ', match.group(1)))
        return paragraph[:360]
    for line in lines:
        t = line.strip()
        if not t or t.startswith('![') or title in t or subtitle in t or t.startswith('*') or t.startswith('**'):
            continue
        return clean_text(re.sub(r'[*_`>#-]+', ' ', t))[:360]
    return subtitle[:360]


def parse_highlights(lines: list[str]) -> list[str]:
    bullets: list[str] = []
    for line in lines:
        t = line.strip()
        if t.startswith('>'):
            text = clean_text(re.sub(r'^>\s*\*\*•\*\*\s*', '', t))
            text = clean_text(re.sub(r'^>\s*', '', text))
            if text:
                bullets.append(text)
        if len(bullets) >= 4:
            break
    if bullets:
        return bullets[:4]
    return ['Modelo editorial premium', 'Sumário estruturado', 'Capítulos completos', 'Entrega HTML + PDF']


def estimate_pages(text: str) -> int:
    words = len(re.findall(r'\w+', text, re.U))
    pages = round(words / 420)
    return max(18, min(220, pages))


def find_cover(md_path: Path, lines: list[str]) -> Path | None:
    if lines:
        first = lines[0].strip()
        img = re.search(r'!\[[^\]]*\]\(([^)]+)\)', first)
        if img:
            candidate = (md_path.parent / img.group(1)).resolve()
            if candidate.exists():
                return candidate
    stem = md_path.stem
    collection = collection_key(md_path)
    candidates = []
    if collection == 'curso_universo_ia':
        candidates.extend([
            ROOT / 'assets' / 'ebook_covers' / 'curso_universo_ia' / f'{stem}.webp',
            ROOT / 'assets' / 'ebook_covers' / 'curso_universo_ia' / f'{stem}.png',
        ])
    candidates.extend([
        ROOT / 'assets' / 'ebook_covers' / f'{stem}.webp',
        ROOT / 'assets' / 'ebook_covers' / f'{stem}.png',
        ROOT / 'docs' / 'ebook_covers' / f'{stem}.webp',
        ROOT / 'docs' / 'ebook_covers' / f'{stem}.png',
    ])
    # NEXUS Protocol naming convention
    if collection == 'colecao_NEXUS_PROTOCOL':
        candidates.extend([
            ROOT / 'assets' / 'ebook_covers' / f'nexus_protocol_{stem}.webp',
            ROOT / 'assets' / 'ebook_covers' / f'nexus_protocol_{stem}.png',
        ])
    return first_existing(candidates)


def make_placeholder_cover(dest: Path, title: str, collection_label: str):
    dest.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    current = []
    for word in title.split():
        probe = ' '.join(current + [word])
        if len(probe) > 26 and current:
            lines.append(' '.join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(' '.join(current))
    lines = lines[:4]
    svg = f"""<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"1800\" viewBox=\"0 0 1200 1800\">
  <defs>
    <linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"#0f172a\"/>
      <stop offset=\"100%\" stop-color=\"#0ea5e9\"/>
    </linearGradient>
  </defs>
  <rect width=\"1200\" height=\"1800\" fill=\"url(#g)\"/>
  <rect x=\"72\" y=\"72\" width=\"1056\" height=\"1656\" rx=\"28\" fill=\"none\" stroke=\"rgba(255,255,255,.16)\" stroke-width=\"3\"/>
  <text x=\"84\" y=\"180\" fill=\"#7dd3fc\" font-size=\"42\" font-family=\"Arial, Helvetica, sans-serif\" letter-spacing=\"4\">NEXUS MARKETPLACE</text>
  <text x=\"84\" y=\"300\" fill=\"#ffffff\" font-size=\"72\" font-weight=\"700\" font-family=\"Arial, Helvetica, sans-serif\">{'</text><text x="84" dy="88" fill="#ffffff" font-size="72" font-weight="700" font-family="Arial, Helvetica, sans-serif">'.join(html.escape(line) for line in lines)}</text>
  <text x=\"84\" y=\"1500\" fill=\"#bfdbfe\" font-size=\"36\" font-family=\"Arial, Helvetica, sans-serif\">{html.escape(collection_label)}</text>
  <text x=\"84\" y=\"1580\" fill=\"#93c5fd\" font-size=\"30\" font-family=\"Arial, Helvetica, sans-serif\">MMN AI-to-AI · oneverso.com.br</text>
</svg>"""
    dest.write_text(svg, encoding='utf-8')


@dataclass
class EbookRecord:
    slug: str
    order: int
    title: str
    subtitle: str
    description: str
    costCents: int
    resalePriceCents: int
    pages: int
    category: str
    coverGradient: str
    htmlPath: str
    pdfPath: str
    highlights: list[str]
    unlockPackSlug: str
    sourceMarkdown: str
    coverPublicPath: str


def collect_markdowns() -> list[Path]:
    files = []
    for md in sorted(EBOOKS_ROOT.rglob('*.md')):
        if any(part in {'publish', 'publish_all'} for part in md.parts):
            continue
        if md.name in IGNORE_NAMES:
            continue
        if 'index' == md.stem.lower():
            continue
        text = md.read_text(encoding='utf-8', errors='ignore')
        if 'Sumário' not in text and '**Sobre este ebook**' not in text:
            continue
        files.append(md)
    return files


def render_markdown_to_outputs(md_path: Path, target_slug: str, cover_path: Path, cover_public_rel: str, title: str):
    raw = md_path.read_text(encoding='utf-8', errors='ignore')
    rel_img = cover_public_rel.replace('\\', '/')
    raw_html = raw
    raw_html = re.sub(r'!\[[^\]]*\]\(([^)]+)\)', f'![Capa]({rel_img})', raw_html, count=1)
    html_body = markdown.markdown(raw_html, extensions=['tables', 'fenced_code'])
    full_html = HTML_TEMPLATE.format(title=html.escape(title), css=CSS, content=html_body)
    html_file = PUBLIC_ROOT / f'{target_slug}.html'
    pdf_file = PUBLIC_PDF / f'{target_slug}.pdf'
    html_file.write_text(full_html, encoding='utf-8')
    HTML(string=full_html, base_url=str(ROOT)).write_pdf(str(pdf_file))


def main():
    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.mkdir(parents=True, exist_ok=True)
    PUBLIC_COVERS.mkdir(parents=True, exist_ok=True)

    records: list[EbookRecord] = []
    manifest_entries: list[dict] = []

    markdowns = collect_markdowns()
    for idx, md_path in enumerate(markdowns, start=1):
        lines = md_path.read_text(encoding='utf-8', errors='ignore').splitlines()
        collection_label, unlock_pack = resolve_collection_meta(md_path)
        fallback_title = md_path.stem.replace('_', ' ')
        title = parse_title(lines, fallback_title)
        subtitle = parse_subtitle(lines, collection_label)
        description = parse_description(lines, title, subtitle)
        highlights = parse_highlights(lines)
        pages = estimate_pages('\n'.join(lines))
        source_cover = find_cover(md_path, lines)
        public_cover_name = f'{slugify(collection_label)}--{slugify(md_path.stem)}'
        if source_cover and source_cover.suffix.lower() in {'.png', '.webp', '.jpg', '.jpeg', '.svg'}:
            public_cover_rel = f'covers/{public_cover_name}{source_cover.suffix.lower()}'
            public_cover_path = PUBLIC_ROOT / public_cover_rel
            public_cover_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_cover, public_cover_path)
        else:
            public_cover_rel = f'covers/{public_cover_name}.svg'
            public_cover_path = PUBLIC_ROOT / public_cover_rel
            make_placeholder_cover(public_cover_path, title, collection_label)

        slug = f'ebook-{slugify(md_path.stem)}'
        render_markdown_to_outputs(md_path, slug, public_cover_path, f'/ebooks/{public_cover_rel}', title)

        record = EbookRecord(
            slug=slug,
            order=idx,
            title=title,
            subtitle=subtitle,
            description=description,
            costCents=50,
            resalePriceCents=99,
            pages=pages,
            category=collection_label,
            coverGradient=GRADIENTS.get(unlock_pack, GRADIENTS['fallback']),
            htmlPath=f'/ebooks/{slug}.html',
            pdfPath=f'/ebooks/pdf/{slug}.pdf',
            highlights=highlights,
            unlockPackSlug=unlock_pack,
            sourceMarkdown=str(md_path.relative_to(ROOT)),
            coverPublicPath=f'/ebooks/{public_cover_rel}',
        )
        records.append(record)
        manifest_entries.append(asdict(record))

    pack_totals = {}
    for pack in sorted(PACK_SORT, key=lambda p: PACK_SORT[p]):
        pack_totals[pack] = sum(1 for r in records if PACK_SORT[r.unlockPackSlug] <= PACK_SORT[pack])

    JSON_OUTPUT.write_text(
        json.dumps({
            'generated_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
            'total_ebooks': len(records),
            'pack_totals': pack_totals,
            'entries': manifest_entries,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    records_ts = ',\n'.join(
        '  {' + ', '.join([
            f"slug: `{escape_ts(r.slug)}`",
            f"order: {r.order}",
            f"title: `{escape_ts(r.title)}`",
            f"subtitle: `{escape_ts(r.subtitle)}`",
            f"description: `{escape_ts(r.description)}`",
            f"costCents: {r.costCents}",
            f"resalePriceCents: {r.resalePriceCents}",
            f"pages: {r.pages}",
            f"category: `{escape_ts(r.category)}`",
            f"coverGradient: `{escape_ts(r.coverGradient)}`",
            f"htmlPath: `{escape_ts(r.htmlPath)}`",
            f"pdfPath: `{escape_ts(r.pdfPath)}`",
            f"highlights: [{', '.join(f'`{escape_ts(h)}`' for h in r.highlights)}]",
            f"unlockPackSlug: `{escape_ts(r.unlockPackSlug)}`",
        ]) + ' }'
        for r in records
    )
    TS_OUTPUT.write_text(
        "// Arquivo gerado automaticamente por scripts/generate_marketplace_ebooks.py\n"
        "import type { MarketplaceEbook } from './nexus-marketplace';\n\n"
        f"export const GENERATED_MARKETPLACE_TOTAL_EBOOKS = {len(records)};\n"
        f"export const GENERATED_MARKETPLACE_PACK_TOTALS = {json.dumps(pack_totals, ensure_ascii=False)} as const;\n\n"
        "export const GENERATED_MARKETPLACE_EBOOKS: MarketplaceEbook[] = [\n"
        f"{records_ts}\n"
        "];\n",
        encoding='utf-8',
    )

    lines = [
        '# Sync Marketplace Ebooks',
        '',
        f'- Total de ebooks publicados: **{len(records)}**',
        f'- Pack A² (pool cumulativo): **{pack_totals.get("pack-a2", 0)}**',
        f'- Pack A²II (pool cumulativo): **{pack_totals.get("pack-a2ii", 0)}**',
        f'- Pack A²III (pool cumulativo): **{pack_totals.get("pack-a2iii", 0)}**',
        f'- Pack AG (pool cumulativo): **{pack_totals.get("pack-ag", 0)}**',
        '',
        '## Arquivos gerados',
        '',
        '- `frontend/public/ebooks/*.html`',
        '- `frontend/public/ebooks/pdf/*.pdf`',
        '- `frontend/public/ebooks/covers/*`',
        '- `frontend/src/lib/generated-marketplace-ebooks.ts`',
        '- `docs/ebooks_markdown/manifest_marketplace_ebooks.json`',
    ]
    REPORT_OUTPUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'OK: {len(records)} ebooks processados')
    print(json.dumps(pack_totals, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
