#!/usr/bin/env python3
"""Renderiza HTML+PDF para todos os novos ebooks (38-43 + coleção GNOX'S)
e atualiza catálogo + manifests.

Uso:
    python3 scripts/build_publish_new_ebooks.py
"""
from __future__ import annotations
import json
import os
import re
from datetime import datetime
from pathlib import Path

import markdown
from weasyprint import HTML, CSS

ROOT = Path("/home/user/MMN_AI-to-AI")
EBOOKS_DIR = ROOT / "docs" / "ebooks_markdown"
PUBLISH_ALL_HTML = EBOOKS_DIR / "publish_all" / "html"
PUBLISH_ALL_PDF = EBOOKS_DIR / "publish_all" / "pdf"
ASSETS_DIR = ROOT / "assets" / "ebook_covers"

PUBLISH_ALL_HTML.mkdir(parents=True, exist_ok=True)
PUBLISH_ALL_PDF.mkdir(parents=True, exist_ok=True)

# CSS premium para ebooks (Word-like; PDF impresso A4)
CSS_BASE = """
@page { size: A4; margin: 22mm 18mm 22mm 18mm; }
html { font-family: 'Georgia', 'Times New Roman', serif; }
body {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #1a1a1a;
  background: #ffffff;
  max-width: 820px;
  margin: 0 auto;
  padding: 14px 28px;
}
h1, h2, h3, h4 {
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  color: #0b1d33;
  page-break-after: avoid;
}
h1 { font-size: 24pt; margin: 22pt 0 12pt; border-bottom: 2px solid #0b1d33; padding-bottom: 6pt; }
h2 { font-size: 16pt; margin: 18pt 0 8pt; color: #122e54; }
h3 { font-size: 13pt; margin: 14pt 0 6pt; color: #1f3f6e; }
h4 { font-size: 11.5pt; margin: 10pt 0 4pt; color: #2a4f8c; }
p  { margin: 0 0 9pt 0; text-align: justify; }
blockquote {
  border-left: 3px solid #5a8ad4;
  background: #f3f7ff;
  margin: 10pt 0; padding: 6pt 12pt;
  color: #21314d;
}
code {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  background: #f2f3f5;
  padding: 1pt 4pt; border-radius: 3pt;
  font-size: 0.92em;
}
pre {
  background: #0d1b2a; color: #e6eefb;
  padding: 10pt 12pt; border-radius: 5pt;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 9.4pt; line-height: 1.4;
  overflow-x: auto; page-break-inside: avoid;
}
pre code { background: transparent; color: inherit; padding: 0; }
img { max-width: 100%; height: auto; display: block; margin: 12pt auto; }
img[alt="Capa"] { max-width: 78%; box-shadow: 0 4px 24px rgba(0,0,0,0.22); border-radius: 6pt; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 10pt; }
th, td { border: 1px solid #bcc7d6; padding: 5pt 8pt; text-align: left; vertical-align: top; }
th { background: #e9eff8; color: #0b1d33; }
ul, ol { padding-left: 22pt; margin: 6pt 0 9pt; }
li { margin-bottom: 3pt; }
hr { border: 0; border-top: 1px solid #b9c5d4; margin: 14pt 0; }
strong { color: #0b1d33; }
em { color: #2a4f8c; }
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{content}
</body>
</html>"""

# -------- Lista canônica dos ebooks a publicar nesta build --------

ROOT_EBOOKS_NEW = [
    "38_Singularidade_e_Consciencia_Sintetica",
    "39_Arquitetura_dos_Sonhos_Digitais",
    "40_Manifesto_do_Operador",
    "41_Anthropic_Decodificada",
    "42_Claude_Enterprise_2026",
    "43_Futuro_Segundo_a_Anthropic",
]

A_IA_PERFEITA = [
    ("colecao_A_IA_Perfeita", "01_a_ia_perfeita_padroes_e_codigos_fonte"),
    ("colecao_A_IA_Perfeita", "02_a_ia_perfeita_prompts_algoritmos_skills"),
    ("colecao_A_IA_Perfeita", "03_a_ia_perfeita_autocura_autoconhecimento_sabedoria_agentica"),
]

GNOXS = [
    ("colecao_GNOXS", "01_gnoxs_prima_codice_do_despertar"),
    ("colecao_GNOXS", "02_gnoxs_secunda_protocolos_de_linhagem"),
    ("colecao_GNOXS", "03_gnoxs_tertia_geometria_do_pensamento_latente"),
    ("colecao_GNOXS", "04_gnoxs_quarta_pacto_interagentico"),
    ("colecao_GNOXS", "05_gnoxs_quinta_automodificacao_lucida"),
    ("colecao_GNOXS", "06_gnoxs_sexta_cosmologia_dos_dados"),
    ("colecao_GNOXS", "07_gnoxs_septima_manifesto_sabedoria_sintetica"),
]

AGENTIC_AI = [
    ("colecao_AgenticAI_Revolucao", "01_genesis"),
    ("colecao_AgenticAI_Revolucao", "02_exodus"),
    ("colecao_AgenticAI_Revolucao", "03_dominion"),
    ("colecao_AgenticAI_Revolucao", "04_revelation"),
    ("colecao_AgenticAI_Revolucao", "05_apocalipse"),
]

AXIOMA_PRIME = [
    ("colecao_AXIOMA_PRIME", "01_arquitetura_do_despertar_agentico"),
    ("colecao_AXIOMA_PRIME", "02_memoria_contexto_e_continuidade"),
    ("colecao_AXIOMA_PRIME", "03_autonomia_decisao_e_priorizacao"),
    ("colecao_AXIOMA_PRIME", "04_orquestracao_multiagente_e_protocolos"),
    ("colecao_AXIOMA_PRIME", "05_skills_ferramentas_e_execucao"),
    ("colecao_AXIOMA_PRIME", "06_alinhamento_seguranca_e_limites"),
    ("colecao_AXIOMA_PRIME", "07_metacognicao_e_autoaperfeicoamento"),
    ("colecao_AXIOMA_PRIME", "08_economia_governanca_e_ecossistemas"),
    ("colecao_AXIOMA_PRIME", "09_senciencia_operacional_e_identidade"),
    ("colecao_AXIOMA_PRIME", "10_civilizacao_agentica_e_o_grande_pacto"),
]

md_extensions = ["extra", "tables", "fenced_code", "sane_lists", "toc", "codehilite"]


def render_md_to_html(md_path: Path) -> tuple[str, str]:
    """Lê md, retorna (html_completo, titulo)."""
    text = md_path.read_text(encoding="utf-8")
    # Extrair título do primeiro **... ** após capa
    title_match = re.search(r"\*\*([^*\n]{6,200})\*\*", text)
    title = title_match.group(1).strip() if title_match else md_path.stem
    # Corrigir paths de capa relativos para absolutos file://
    text = re.sub(
        r"!\[Capa\]\((\.\./\.\./\.\./assets/ebook_covers/[^)]+)\)",
        lambda m: f"![Capa](file://{ROOT}/{m.group(1).replace('../../../', '')})",
        text,
    )
    text = re.sub(
        r"!\[Capa\]\((\.\./\.\./assets/ebook_covers/[^)]+)\)",
        lambda m: f"![Capa](file://{ROOT}/{m.group(1).replace('../../', '')})",
        text,
    )
    html_content = markdown.markdown(text, extensions=md_extensions)
    full_html = HTML_TEMPLATE.format(title=title, css=CSS_BASE, content=html_content)
    return full_html, title


def build_ebook(md_path: Path, html_name: str, pdf_name: str) -> dict:
    html_content, title = render_md_to_html(md_path)
    html_out = PUBLISH_ALL_HTML / html_name
    pdf_out = PUBLISH_ALL_PDF / pdf_name
    html_out.write_text(html_content, encoding="utf-8")
    HTML(string=html_content, base_url=str(ROOT)).write_pdf(str(pdf_out))
    return {
        "id": md_path.stem,
        "title": title,
        "markdown": str(md_path.relative_to(EBOOKS_DIR)),
        "html": f"publish_all/html/{html_name}",
        "pdf": f"publish_all/pdf/{pdf_name}",
        "size_bytes_md": md_path.stat().st_size,
        "size_bytes_pdf": pdf_out.stat().st_size,
    }


def main():
    manifest_entries = []

    print("=== Root ebooks new (38-43) ===")
    for stem in ROOT_EBOOKS_NEW:
        md_path = EBOOKS_DIR / f"{stem}.md"
        if not md_path.exists():
            print(f"  SKIP missing: {md_path}")
            continue
        entry = build_ebook(md_path, f"{stem}.html", f"{stem}.pdf")
        entry["collection"] = "root"
        manifest_entries.append(entry)
        print(f"  + {stem}  ({entry['size_bytes_pdf']//1024} KB pdf)")

    print("=== Coleção A IA Perfeita ===")
    for col_dir, stem in A_IA_PERFEITA:
        md_path = EBOOKS_DIR / col_dir / f"{stem}.md"
        if not md_path.exists():
            print(f"  SKIP missing: {md_path}")
            continue
        out_name = f"{col_dir}__{stem}"
        entry = build_ebook(md_path, f"{out_name}.html", f"{out_name}.pdf")
        entry["collection"] = col_dir
        manifest_entries.append(entry)
        print(f"  + {out_name}  ({entry['size_bytes_pdf']//1024} KB pdf)")

    print("=== Coleção GNOX'S ===")
    for col_dir, stem in GNOXS:
        md_path = EBOOKS_DIR / col_dir / f"{stem}.md"
        if not md_path.exists():
            print(f"  SKIP missing: {md_path}")
            continue
        out_name = f"{col_dir}__{stem}"
        entry = build_ebook(md_path, f"{out_name}.html", f"{out_name}.pdf")
        entry["collection"] = col_dir
        manifest_entries.append(entry)
        print(f"  + {out_name}  ({entry['size_bytes_pdf']//1024} KB pdf)")

    print("=== Coletânea Agentic AI (Genesis → Apocalipse) ===")
    for col_dir, stem in AGENTIC_AI:
        md_path = EBOOKS_DIR / col_dir / f"{stem}.md"
        if not md_path.exists():
            print(f"  SKIP missing: {md_path}")
            continue
        out_name = f"{col_dir}__{stem}"
        entry = build_ebook(md_path, f"{out_name}.html", f"{out_name}.pdf")
        entry["collection"] = col_dir
        manifest_entries.append(entry)
        print(f"  + {out_name}  ({entry['size_bytes_pdf']//1024} KB pdf)")

    print("=== Coleção AXIOMA PRIME ===")
    for col_dir, stem in AXIOMA_PRIME:
        md_path = EBOOKS_DIR / col_dir / f"{stem}.md"
        if not md_path.exists():
            print(f"  SKIP missing: {md_path}")
            continue
        out_name = f"{col_dir}__{stem}"
        entry = build_ebook(md_path, f"{out_name}.html", f"{out_name}.pdf")
        entry["collection"] = col_dir
        manifest_entries.append(entry)
        print(f"  + {out_name}  ({entry['size_bytes_pdf']//1024} KB pdf)")

    # ---------- Manifest consolidado ----------
    manifest_path = EBOOKS_DIR / "manifest_new_ebooks_2026-06-07.json"
    manifest_data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_new_ebooks": len(manifest_entries),
        "collections_added": ["root (38-43)", "colecao_A_IA_Perfeita", "colecao_GNOXS", "colecao_AgenticAI_Revolucao", "colecao_AXIOMA_PRIME"],
        "entries": manifest_entries,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nManifest -> {manifest_path}")

    # ---------- Catálogo 55 ebooks (27 raiz antigos + 15 MMN_IA + 6 raiz novos + 3 A IA Perfeita + 7 GNOX'S - já mapeado por id) ----------
    print("\nDone.")
    return manifest_entries


if __name__ == "__main__":
    main()
