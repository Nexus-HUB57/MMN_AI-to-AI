#!/usr/bin/env bash
# =============================================================================
# Ravi-CTO Bundle Applier · Nexus Affil'IA'te
# -----------------------------------------------------------------------------
# Aplica o conteúdo deste bundle em cima de um clone do repo
# Nexus-HUB57/MMN_AI-to-AI, cria branch dedicada e abre o caminho para o PR.
#
# Uso:
#   bash scripts/apply_bundle.sh /caminho/para/clone/MMN_AI-to-AI
# =============================================================================

set -euo pipefail

TARGET_REPO="${1:-}"
BUNDLE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "$TARGET_REPO" || ! -d "$TARGET_REPO/.git" ]]; then
  echo "ERRO: forneça o caminho do clone Git do MMN_AI-to-AI"
  echo "Exemplo: bash scripts/apply_bundle.sh ~/code/MMN_AI-to-AI"
  exit 1
fi

cd "$TARGET_REPO"

BRANCH="feature/hub-tecnologico-marketplace-academia"
git fetch origin
if git show-ref --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH" origin/main
fi

echo "==> Sincronizando arquivos do bundle..."
rsync -av "$BUNDLE_ROOT/backend/"  ./backend/
rsync -av "$BUNDLE_ROOT/database/" ./database/
rsync -av "$BUNDLE_ROOT/docs/"     ./docs/

echo "==> Verificando .gitignore (regra **/*.sql)..."
if grep -qE '^\*\*/\*\.sql$' .gitignore && ! grep -q '!database/migrations/\*\.sql' .gitignore; then
  python3 - <<'PY'
from pathlib import Path
p = Path(".gitignore")
src = p.read_text()
needle = "**/*.sql\n"
patch = needle + "!database/migrations/*.sql\n!backend/migrations/*.sql\n!_marketplace_nexus_release/**/*.sql\n"
if needle in src and "!database/migrations/*.sql" not in src:
    p.write_text(src.replace(needle, patch, 1))
    print("[gitignore] exceções adicionadas")
PY
fi

echo "==> Verificando se nexusRagRouter já está montado no appRouter..."
if ! grep -q "nexusRagRouter" backend/src/appRouter.ts; then
  echo "AVISO: backend/src/appRouter.ts ainda não importa nexusRagRouter."
  echo "  Adicione manualmente:"
  echo "    import { nexusRagRouter } from './routers/nexusRagRouter';"
  echo "    // dentro de router({ ... }):"
  echo "    nexusRag: nexusRagRouter,"
fi

echo "==> Validando staging..."
git status --short

cat <<'TXT'

------------------------------------------------------------
Bundle aplicado com sucesso.
Próximos passos (faça você mesmo no ambiente com acesso ao GitHub):

  npm install --workspace backend --workspace frontend --legacy-peer-deps --no-audit --no-fund
  npm --workspace backend  run build
  npm --workspace frontend run build

  git add -A
  git commit -m "feat(hub): Nexus RAG pgvector + Lab Chatbot context + workers"
  git push -u origin feature/hub-tecnologico-marketplace-academia
  gh pr create --title "feat(hub): Nexus RAG pgvector + Lab Chatbot context + workers" \
               --body  "Aplica ADR-001 (Cron+RAG), migrations 0012/0013, worker BullMQ e UI Contexto Nexus."
------------------------------------------------------------
TXT
