#!/bin/bash
# Sync Academia files -> academia_lessons DB
# Onda 20 - preenchimento inicial pos-meeting

set -e
DB_URL=$(grep '^DATABASE_URL=' /var/www/oneverso/current/.env | cut -d= -f2- | tr -d '"')

echo '=== Sync Academia -> academia_lessons ==='
COUNT=0
for md in $(find /var/www/oneverso/current/AcademIA -type f -name '*.md' | grep -v '/node_modules/' | grep -v 'README' | grep -v 'CHANGELOG' | grep -v 'INDEX'); do
  TITLE=$(head -5 "$md" | grep -m1 -oP '(?<=title: ")[^"]+' || basename "$md" .md)
  SLUG=$(basename "$md" .md | tr '[:upper:]' '[:lower:]')
  REL=${md#/var/www/oneverso/current/AcademIA/}
  CATEGORY=$(echo "$REL" | cut -d/ -f1)
  psql "$DB_URL" -q -c "INSERT INTO academia_lessons (id, title, md_url, is_published, tags, sort_order) VALUES ('$SLUG', '$TITLE', '/academia/$REL', true, ARRAY['$CATEGORY'], 100) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, md_url=EXCLUDED.md_url, updated_at=NOW();" 2>/dev/null && ((COUNT++)) || true
done
echo "Sincronizados: $COUNT arquivos"
psql "$DB_URL" -c 'SELECT COUNT(*) AS academia_lessons_total FROM academia_lessons;'
