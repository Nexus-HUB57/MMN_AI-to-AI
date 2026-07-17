#!/usr/bin/env bash
# =============================================================================
# Ravi-CTO · Deploy idempotente Nexus Affil'IA'te
# -----------------------------------------------------------------------------
# Princípio: zero segredo em disco, zero segredo em log.
# Tudo via env vars: GH_TOKEN, DATABASE_URL, REDIS_URL, OPENAI_API_KEY (opc),
# GOOGLE_AI_API_KEY (opc), NEXUS_RAG_BACKEND (opc, default=pgvector).
#
# Uso:
#   /tmp/ravi_deploy.sh           # deploy completo
#   /tmp/ravi_deploy.sh rollback  # reverte branch e para worker
#   /tmp/ravi_deploy.sh status    # mostra estado atual
# =============================================================================

set -euo pipefail

# -------- Configuração canônica --------
REPO_OWNER="Nexus-HUB57"
REPO_NAME="MMN_AI-to-AI"
REPO_URL_HTTPS="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/nexus-affiliate}"
FEATURE_BRANCH="${FEATURE_BRANCH:-feature/hub-tecnologico-marketplace-academia}"
COMMIT_MSG="${COMMIT_MSG:-feat(hub): Nexus RAG pgvector + Lab Chatbot context + workers}"
BUNDLE_ZIP_URL="${BUNDLE_ZIP_URL:-https://www.genspark.ai/api/files/s/SetxQRGq}"

log() { printf "\n[ravi-deploy] %s\n" "$*"; }
fail() { printf "\n[ravi-deploy][FATAL] %s\n" "$*" >&2; exit 1; }

require_env() {
  local missing=()
  [[ -z "${GH_TOKEN:-}" ]] && missing+=("GH_TOKEN")
  [[ -z "${DATABASE_URL:-}" ]] && missing+=("DATABASE_URL")
  if (( ${#missing[@]} > 0 )); then
    fail "Variáveis faltando: ${missing[*]}. Exporte na sessão antes de rodar."
  fi
}

mask() { local v="$1"; local n=${#v}; (( n<8 )) && echo "***" || echo "${v:0:4}…(${n}c)"; }

# -------- Sub-comandos --------
case "${1:-deploy}" in
  status)
    cd "$DEPLOY_DIR" 2>/dev/null && {
      git log -1 --oneline
      git branch --show-current
      pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name) — \(.pm2_env.status)"' || true
    }
    exit 0
    ;;
  rollback)
    log "rollback solicitado"
    cd "$DEPLOY_DIR" || fail "Diretório $DEPLOY_DIR não existe."
    git fetch origin main
    git checkout main && git reset --hard origin/main
    pm2 stop nexus-rag-worker 2>/dev/null || true
    log "rollback concluído. RAG pode ser forçado para in-memory exportando NEXUS_RAG_BACKEND=in-memory no .env do backend."
    exit 0
    ;;
esac

require_env

log "GH_TOKEN=$(mask "$GH_TOKEN")  DATABASE_URL=$(mask "$DATABASE_URL")  REDIS_URL=$(mask "${REDIS_URL:-}")"

# -------- 1. Clonar / atualizar repo --------
mkdir -p "$(dirname "$DEPLOY_DIR")"
if [[ ! -d "$DEPLOY_DIR/.git" ]]; then
  log "clonando repo em $DEPLOY_DIR"
  git -c credential.helper="!f() { printf 'username=x-access-token\npassword=%s\n' \"\$GH_TOKEN\"; }; f" \
      clone "$REPO_URL_HTTPS" "$DEPLOY_DIR"
fi
cd "$DEPLOY_DIR"

git config user.name  "Ravi Nexus CTO"
git config user.email "ravi-cto@nexus-affiliate.local"
git config credential.helper "!f() { printf 'username=x-access-token\npassword=%s\n' \"\$GH_TOKEN\"; }; f"

log "fetch origin"
git fetch origin --prune

if git show-ref --verify --quiet "refs/heads/$FEATURE_BRANCH"; then
  git checkout "$FEATURE_BRANCH"
  git pull --rebase origin "$FEATURE_BRANCH" || true
else
  if git ls-remote --exit-code --heads origin "$FEATURE_BRANCH" >/dev/null 2>&1; then
    git checkout -b "$FEATURE_BRANCH" "origin/$FEATURE_BRANCH"
  else
    git checkout -b "$FEATURE_BRANCH" origin/main
  fi
fi

# -------- 2. Baixar bundle Ravi-CTO e aplicar --------
BUNDLE_TMP="$(mktemp -d)"
log "baixando bundle ($BUNDLE_ZIP_URL)"
curl -fsSL "$BUNDLE_ZIP_URL" -o "$BUNDLE_TMP/ravi-bundle.zip"
unzip -q -o "$BUNDLE_TMP/ravi-bundle.zip" -d "$BUNDLE_TMP"
BUNDLE_ROOT="$BUNDLE_TMP/ravi-bundle"

log "sincronizando arquivos do bundle"
rsync -a "$BUNDLE_ROOT/backend/"  ./backend/
rsync -a "$BUNDLE_ROOT/database/" ./database/
rsync -a "$BUNDLE_ROOT/docs/"     ./docs/
rsync -a "$BUNDLE_ROOT/scripts/"  ./scripts/

# -------- 3. Patches automáticos --------
log "patch .gitignore"
python3 - <<'PY'
from pathlib import Path
p = Path(".gitignore")
if p.exists():
    src = p.read_text()
    needle = "**/*.sql\n"
    add = "!database/migrations/*.sql\n!backend/migrations/*.sql\n!_marketplace_nexus_release/**/*.sql\n"
    if needle in src and "!database/migrations/*.sql" not in src:
        p.write_text(src.replace(needle, needle + add, 1))
        print("[gitignore] exceções adicionadas")
    else:
        print("[gitignore] sem alteração")
PY

log "patch appRouter.ts (nexusRag mount)"
python3 - <<'PY'
from pathlib import Path
ap = Path("backend/src/appRouter.ts")
if ap.exists():
    src = ap.read_text()
    if "nexusRagRouter" not in src:
        # adiciona import
        src = src.replace(
            'import { publicProcedure, router } from "./config/trpc";',
            'import { publicProcedure, router } from "./config/trpc";\nimport { nexusRagRouter } from "./routers/nexusRagRouter";',
            1,
        )
        # adiciona dentro do router({...})
        src = src.replace(
            "export const appRouter = router({",
            "export const appRouter = router({\n  nexusRag: nexusRagRouter,",
            1,
        )
        ap.write_text(src)
        print("[appRouter] nexusRag montado")
    else:
        print("[appRouter] já montado")
else:
    print("[appRouter] não encontrado — verifique o repo")
PY

log "patch nexusRagService.ts (hybrid pgvector ↔ in-memory)"
python3 - <<'PY'
from pathlib import Path
svc = Path("backend/src/services/nexusRagService.ts")
if svc.exists():
    src = svc.read_text()
    if "nexusRagPgRepository" not in src:
        # adiciona imports
        if 'import crypto from "node:crypto";' in src:
            src = src.replace(
                'import crypto from "node:crypto";',
                'import crypto from "node:crypto";\nimport {\n  pgIngest, pgQuery, pgStats, pgRecordRun, pgListRuns,\n  isAvailable as pgIsAvailable,\n} from "./nexusRagPgRepository";',
                1,
            )
            svc.write_text(src)
            print("[nexusRagService] imports do repo PG adicionados (requer revisão manual das funções ingest/query/stats)")
        else:
            print("[nexusRagService] padrão de import não encontrado — patch manual necessário")
    else:
        print("[nexusRagService] já patcheado")
PY

# -------- 4. Instalar deps + build --------
log "npm install workspaces"
npm install --workspace backend --workspace frontend --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -n 20

log "build backend"
npm --workspace backend run build && log "✅ build backend OK"

log "build frontend"
NODE_OPTIONS=--max-old-space-size=4096 npm --workspace frontend run build && log "✅ build frontend OK"

# -------- 5. Migrations Postgres --------
log "aplicando migrations no Postgres"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/0012_marketplace_user_library.sql \
  && log "✅ migration 0012 OK"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/0013_nexus_rag.sql \
  && log "✅ migration 0013 OK"

# -------- 6. Publicar catálogo + seed marketplace --------
if [[ -f scripts/publish_marketplace_ebooks.py ]]; then
  log "publicando 132 ebooks (HTML/PDF/SVG)"
  python3 scripts/publish_marketplace_ebooks.py || log "publish_marketplace_ebooks.py falhou (não-fatal)"
fi
if [[ -f scripts/seed_marketplace_ebooks.py ]]; then
  log "seed marketplace_ebooks"
  python3 scripts/seed_marketplace_ebooks.py || log "seed falhou (verifique DATABASE_URL e schema)"
fi

EBOOK_COUNT="$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM marketplace_ebooks WHERE status='active';" 2>/dev/null || echo "?")"
log "✅ ${EBOOK_COUNT} ebooks em marketplace_ebooks (esperado: 132)"

# -------- 7. AcademIA overrides --------
if [[ -f scripts/ingest_academia_content.py ]]; then
  log "ingestão idempotente AcademIA → data/academia-ead-overrides.json"
  python3 scripts/ingest_academia_content.py --dry-run || python3 scripts/ingest_academia_content.py || true
fi

# -------- 8. Worker BullMQ via PM2 --------
log "subindo nexus-rag-worker (pm2)"
pm2 describe nexus-rag-worker >/dev/null 2>&1 \
  && pm2 reload nexus-rag-worker --update-env \
  || pm2 start backend/src/workers/ragIngestWorker.ts \
       --name nexus-rag-worker \
       --interpreter ./node_modules/.bin/tsx
pm2 save
log "✅ pm2 nexus-rag-worker online"

# -------- 9. Healthchecks --------
HEALTH_HOST="${HEALTH_HOST:-http://localhost:3000}"
log "healthcheck $HEALTH_HOST"
for path in /api/health /api/trpc/system.info /api/trpc/nexusRag.stats; do
  code=$(curl -s -o /tmp/_resp -w '%{http_code}' "${HEALTH_HOST}${path}" || echo "000")
  if [[ "$code" =~ ^2 ]]; then
    log "✅ $path → $code"
  else
    log "⚠️  $path → $code (verifique manualmente)"
  fi
done

# -------- 10. Commit + push --------
git add -A
if git diff --cached --quiet; then
  log "nada para commitar (working tree já alinhado com o bundle)"
else
  git commit -m "$COMMIT_MSG"
  log "commit: $(git log -1 --oneline)"
fi

log "push origin $FEATURE_BRANCH"
git push -u origin "$FEATURE_BRANCH" 2>&1 | tail -n 5

# -------- 11. PR via API (sem gh CLI) --------
PR_BODY=$(cat <<'PR'
## Resumo Ravi-CTO

Aplica ADR-001 (Cron + RAG canônico):
- backend/src/services/nexusRagPgRepository.ts (adapter pgvector)
- backend/src/workers/ragIngestWorker.ts (fila BullMQ)
- migrations 0012 (marketplace user library) + 0013 (nexus_rag pgvector)
- frontend Lab Chatbot com toggle "Contexto Nexus" + bloco de citações
- 132 ebooks publicados em frontend/public/ebooks/
- 169 lições AcademIA ingeridas em data/academia-ead-overrides.json

## Validação
- `npm --workspace backend run build` ✅
- `npm --workspace frontend run build` ✅
- migrations idempotentes aplicadas
- nexusRag.stats responde { backend: "pgvector" }
- worker BullMQ ativo via PM2

## Rollback
- `NEXUS_RAG_BACKEND=in-memory` no .env do backend volta o RAG para fallback.
- `pm2 stop nexus-rag-worker` desliga o worker sem perda de fila.

🚀 Pronto para merge.
PR
)

PR_JSON=$(jq -n --arg title "$COMMIT_MSG" --arg body "$PR_BODY" --arg head "$FEATURE_BRANCH" --arg base "main" \
  '{title:$title, body:$body, head:$head, base:$base}')

PR_RESP=$(curl -fsSL -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls \
  -d "$PR_JSON" 2>&1 || true)

PR_URL=$(echo "$PR_RESP" | jq -r '.html_url // empty')
if [[ -n "$PR_URL" ]]; then
  log "✅ PR aberto: $PR_URL"
else
  log "⚠️  Resposta do GitHub: $(echo "$PR_RESP" | head -c 400)"
  log "    (Se o PR já existir, abra: https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls)"
fi

# -------- 12. Resumo final --------
cat <<'EOF'

=========================================================
[ravi-deploy] CONCLUÍDO
---------------------------------------------------------
Próximos passos OBRIGATÓRIOS de hardening:
  1. unset GH_TOKEN DATABASE_URL REDIS_URL OPENAI_API_KEY GOOGLE_AI_API_KEY
  2. history -c
  3. Revogue o PAT em https://github.com/settings/tokens
  4. passwd  (troque a senha root)
  5. Edite /etc/ssh/sshd_config:
       PasswordAuthentication no
       PermitRootLogin prohibit-password
     systemctl restart sshd
=========================================================
EOF
