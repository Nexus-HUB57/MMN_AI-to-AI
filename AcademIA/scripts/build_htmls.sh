#!/bin/bash
# build_htmls_v3.sh — Versão final (roda pandoc do dir do .md)
set -e

ACAD="/workspace/MMN_AI-to-AI/AcademIA"
HTML_DIR="$ACAD/html"
APOSTILAS_DIR="$ACAD/apostilas"
WEBINARS_DIR="$ACAD/webinars"
HTML_APOSTILAS="$HTML_DIR/apostilas"
HTML_WEBINARS="$HTML_DIR/webinars"
CSS_PATH="$HTML_DIR/acad-style.css"

# === Função para gerar HTML ===
gen_html() {
  local src=$1      # absolute path
  local out=$2      # absolute path
  local workdir=$3  # diretório de trabalho (do .md)
  
  if [ -f "$out" ]; then
    echo "  ⏭️  $(basename $out) (já existe, pulando)"
    return
  fi
  
  cd "$workdir"
  pandoc -f markdown -t html5 \
    --standalone \
    --self-contained \
    --metadata=lang:pt-BR \
    --css="$CSS_PATH" \
    -o "$out" "$src" 2>&1 | grep -vE "^File.*not found|not found in resource" | head -3
  cd - >/dev/null
  
  if [ -f "$out" ]; then
    echo "  ✅ $(basename $out) ($(wc -c < $out | awk '{printf "%.0f KB", $1/1024}'))"
  else
    echo "  ❌ Falhou: $(basename $src)"
  fi
}

# === Função para injetar enhance.js ===
inject_enhance() {
  local f=$1
  local relpath=$2
  if [ -f "$f" ] && ! grep -q "enhance.js" "$f"; then
    sed -i "s|</body>|<script src=\"$relpath\"></script>\n</body>|" "$f"
  fi
}

# === Apostilas 11-30 ===
echo "📚 Gerando HTMLs das apostilas 11-30..."
mkdir -p "$HTML_APOSTILAS"

for src in $APOSTILAS_DIR/[1-3]*.md; do
  fname=$(basename "$src" .md)
  # Apostilas 1-10 já têm HTML
  if [[ "$fname" =~ ^0[1-9] ]] || [[ "$fname" =~ ^10 ]]; then
    continue
  fi
  gen_html "$src" "$HTML_APOSTILAS/$fname.html" "$APOSTILAS_DIR"
  inject_enhance "$HTML_APOSTILAS/$fname.html" "../enhance.js"
done

# === Webinars 04-11 ===
echo ""
echo "🎥 Gerando HTMLs dos webinars 04-11..."
mkdir -p "$HTML_WEBINARS"

for src in $WEBINARS_DIR/WB-2026-*.md; do
  fname=$(basename "$src" .md)
  # WB 01-03 já têm HTML
  if [[ "$fname" =~ WB-2026-0[1-3] ]]; then
    continue
  fi
  gen_html "$src" "$HTML_WEBINARS/$fname.html" "$WEBINARS_DIR"
  inject_enhance "$HTML_WEBINARS/$fname.html" "../enhance.js"
done

echo ""
echo "✅ BUILD CONCLUÍDO"
echo ""
echo "📊 Resumo final:"
echo "  Apostilas .md: $(ls $APOSTILAS_DIR/[0-9]*.md 2>/dev/null | wc -l)"
echo "  Webinars .md: $(ls $WEBINARS_DIR/WB-2026-*.md 2>/dev/null | wc -l)"
echo "  HTMLs apostilas: $(ls $HTML_APOSTILAS/[0-9]*.html 2>/dev/null | wc -l)"
echo "  HTMLs webinars: $(ls $HTML_WEBINARS/WB-2026-*.html 2>/dev/null | wc -l)"
echo "  PDFs apostilas: $(ls $ACAD/pdfs/[0-9]*.pdf 2>/dev/null | wc -l)"
echo "  PDFs webinars: $(ls $ACAD/pdfs/webinar-*.pdf 2>/dev/null | wc -l)"
