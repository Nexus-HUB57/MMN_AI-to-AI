#!/bin/bash
# Sync AcademIA -> /public/academia (não sobrescreve arquivos mod* legado)
set -e
cd /var/www/oneverso/current

mkdir -p /var/www/oneverso/public/academia/videos
mkdir -p /var/www/oneverso/public/academia/pdf

# Sincronizar novos videos (skip se já existe com nome mod*)
for mp4 in AcademIA/videos/*.mp4; do
  [ -f "$mp4" ] || continue
  fname=$(basename "$mp4")
  # Não copiar se for um nome que colide com mod* legado
  if [[ "$fname" == mod* ]]; then
    continue
  fi
  cp "$mp4" "/var/www/oneverso/public/academia/videos/$fname"
done

# PDFs
for pdf in AcademIA/pdf/academia-curso-*.pdf AcademIA/pdfs/academia-curso-*.pdf; do
  [ -f "$pdf" ] || continue
  cp "$pdf" "/var/www/oneverso/public/academia/pdf/"
done

echo "Sync completo"
