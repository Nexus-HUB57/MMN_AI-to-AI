#!/usr/bin/env bash
# Academ'IA · gerador de PDFs profissionais a partir das apostilas .md
# Pipeline: pandoc (md→html5) + weasyprint (html→pdf) com CSS de marca
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/AcademIA/producao/apostilas"
OUT="$ROOT/AcademIA/producao/apostilas-pdf"
CSS="$ROOT/scripts/academia/academia-style.css"

mkdir -p "$OUT"

if [ ! -f "$CSS" ]; then
  cat > "$CSS" <<'CSS'
@page {
  size: A4;
  margin: 22mm 18mm 22mm 18mm;
  @bottom-center {
    content: "Academ'IA · Nexus Affil'IA'te · página " counter(page) " de " counter(pages);
    font-size: 8pt; color: #64748b; font-family: "DejaVu Sans", sans-serif;
  }
  @top-right {
    content: string(doc-title);
    font-size: 8pt; color: #8B5CF6; font-family: "DejaVu Sans", sans-serif;
    letter-spacing: 2px; text-transform: uppercase;
  }
}
body { font-family: "DejaVu Sans","Helvetica",sans-serif; color: #0b1220; font-size: 11pt; line-height: 1.6; }
h1 { string-set: doc-title content(); color: #0b1220; border-bottom: 4px solid #00E5FF; padding-bottom: 10px; font-size: 26pt; margin-top: 0; }
h1::before { content: "ACADEM'IA · NEXUS"; display: block; color: #8B5CF6; font-size: 9pt; letter-spacing: 3px; margin-bottom: 6px; font-weight: bold; }
h2 { color: #1a2540; border-left: 5px solid #8B5CF6; padding-left: 12px; font-size: 16pt; margin-top: 28px; page-break-after: avoid; }
h3 { color: #1a2540; font-size: 12pt; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 14px 0; page-break-inside: avoid; }
th { background: #0b1220; color: #ffffff; padding: 9px 10px; text-align: left; font-size: 10pt; }
td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10pt; vertical-align: top; }
tr:nth-child(even) td { background: #f8fafc; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: "DejaVu Sans Mono",monospace; font-size: 9.5pt; color: #1a2540; }
blockquote { border-left: 4px solid #00E5FF; background: #f8fafc; padding: 12px 16px; color: #1a2540; margin: 12px 0; border-radius: 0 6px 6px 0; }
ul, ol { padding-left: 22px; }
ul li, ol li { margin: 5px 0; }
hr { border: none; border-top: 2px solid #cbd5e1; margin: 28px 0; }
strong { color: #0b1220; }
a { color: #8B5CF6; text-decoration: none; }
CSS
fi

count_ok=0
count_fail=0
total=$(find "$SRC" -name '*.md' | wc -l)
echo "=== Convertendo $total apostilas para PDF ==="

while IFS= read -r md; do
  rel="${md#$SRC/}"
  out_pdf="$OUT/${rel%.md}.pdf"
  mkdir -p "$(dirname "$out_pdf")"
  html="${out_pdf%.pdf}.html"

  if pandoc "$md" -f markdown -t html5 \
       --standalone \
       --metadata title="" \
       -c "$CSS" \
       -o "$html" 2>/dev/null \
     && weasyprint "$html" "$out_pdf" 2>/dev/null \
     && [ -s "$out_pdf" ]; then
    count_ok=$((count_ok+1))
    rm -f "$html"
  else
    count_fail=$((count_fail+1))
    echo "  ✘ falhou: $rel"
    rm -f "$html"
  fi
done < <(find "$SRC" -name '*.md' -type f | sort)

echo ""
echo "=== Concluído ==="
echo "OK:    $count_ok"
echo "FAIL:  $count_fail"
echo "Total: $total"
echo "Saída: $OUT"
