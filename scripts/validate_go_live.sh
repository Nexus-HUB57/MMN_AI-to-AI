#!/usr/bin/env bash
# ================================================================
# validate_go_live.sh
# Nexus Affil'IA'te / oneverso.com.br
# Suite de validacao end-to-end do Go Live (P0 · Beta 15/07)
# ----------------------------------------------------------------
# Uso:
#   ./scripts/validate_go_live.sh              # roda contra prod
#   BASE=https://oneverso.com.br ./validate_go_live.sh
#   ADMIN_COOKIE="..." ./validate_go_live.sh   # roda testes admin
#
# Saida:
#   codigo 0 = GO
#   codigo 1 = GO COM RESSALVAS (amarelo, sem vermelho)
#   codigo 2 = NO-GO (algum vermelho duro)
# ================================================================

set -o pipefail

BASE="${BASE:-https://oneverso.com.br}"
ADMIN_COOKIE="${ADMIN_COOKIE:-}"
TIMEOUT="${TIMEOUT:-15}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

pass=0; warn=0; fail=0
declare -a REPORT

log_pass() { pass=$((pass+1)); REPORT+=("PASS · $1"); printf "${GREEN}✔${NC} %s\n" "$1"; }
log_warn() { warn=$((warn+1)); REPORT+=("WARN · $1"); printf "${YELLOW}▲${NC} %s\n" "$1"; }
log_fail() { fail=$((fail+1)); REPORT+=("FAIL · $1"); printf "${RED}✖${NC} %s\n" "$1"; }
section()  { printf "\n${BOLD}== %s ==${NC}\n" "$1"; }

# Ferramentas obrigatorias
for bin in curl python3; do
  command -v "$bin" >/dev/null 2>&1 || { echo "ERRO: '$bin' nao encontrado"; exit 2; }
done

http_status() {
  # $1=path  $2=extra_header (opcional)
  local url="$BASE$1"
  if [ -n "$2" ]; then
    curl -sS -o /dev/null --max-time "$TIMEOUT" -w "%{http_code}" -H "$2" "$url"
  else
    curl -sS -o /dev/null --max-time "$TIMEOUT" -w "%{http_code}" "$url"
  fi
}

http_body() {
  local url="$BASE$1"
  if [ -n "$2" ]; then
    curl -sS --max-time "$TIMEOUT" -H "$2" "$url"
  else
    curl -sS --max-time "$TIMEOUT" "$url"
  fi
}

json_get() {
  # $1=json string  $2=jq-like path (ex: .ok  .service  .pending.total)
  echo "$1" | python3 -c "
import json,sys
try:
    d = json.loads(sys.stdin.read())
except Exception:
    print('__PARSE_ERROR__'); sys.exit(0)
path = '''$2'''.strip().lstrip('.')
if not path:
    print(d); sys.exit(0)
cur = d
for key in path.split('.'):
    if isinstance(cur, dict) and key in cur:
        cur = cur[key]
    else:
        cur = None; break
print(cur)
"
}

# ================================================================
section "1 · Rotas publicas (HTTP status)"
# ================================================================
for path in "/" "/login" "/marketplaces" "/academia" "/pix/checkout"; do
  code=$(http_status "$path")
  case "$code" in
    200|301|302) log_pass "GET $path = $code" ;;
    401|403)     log_warn "GET $path = $code (protegido/redirect)" ;;
    *)           log_fail "GET $path = $code" ;;
  esac
done

# ================================================================
section "2 · Health & Observability"
# ================================================================
h=$(http_body "/api/health")
if [ "$(json_get "$h" '.ok')" = "True" ] && [ "$(json_get "$h" '.mode')" = "full" ]; then
  log_pass "/api/health ok=true mode=full"
else
  log_fail "/api/health payload invalido: $h"
fi
commit=$(json_get "$h" '.commit')
if [ "$commit" = "None" ] || [ -z "$commit" ]; then
  log_warn "/api/health commit=null — falta APP_COMMIT_SHA no deploy (issue #82)"
else
  log_pass "/api/health commit=$commit"
fi

hp=$(http_body "/api/health/pix")
if [ "$(json_get "$hp" '.ok')" = "True" ] && [ "$(json_get "$hp" '.mercadopagoConfigured')" = "True" ]; then
  log_pass "/api/health/pix ok + mercadopago configurado"
else
  log_fail "/api/health/pix quebrado: $hp"
fi

# ================================================================
section "3 · Webhooks (introspect GET; POST real fica pro E2E manual)"
# ================================================================
for w in "/api/webhooks/mercadopago" "/api/webhooks/pix"; do
  wb=$(http_body "$w")
  if [ "$(json_get "$wb" '.ok')" = "True" ]; then
    log_pass "GET $w responde payload de introspect"
  else
    log_fail "GET $w falhou: $wb"
  fi
done
# Hotmart e opcional
wh_hotmart=$(http_status "/api/webhooks/hotmart")
if [ "$wh_hotmart" = "200" ]; then
  log_pass "GET /api/webhooks/hotmart = 200"
else
  log_warn "GET /api/webhooks/hotmart = $wh_hotmart (decisao pendente em issue #83)"
fi

# ================================================================
section "4 · Anti-regressao de dados ficticios"
# ================================================================
# Se ADMIN_COOKIE nao veio, so alertamos, nao reprovamos
if [ -n "$ADMIN_COOKIE" ]; then
  # tRPC endpoint publico do getStats — envolve autenticacao admin
  # tenta path canonico do tRPC (batch)
  stats_url="/api/trpc/approvals.getStats"
  code=$(http_status "$stats_url" "Cookie: $ADMIN_COOKIE")
  body=$(http_body "$stats_url" "Cookie: $ADMIN_COOKIE")
  if [ "$code" = "200" ] || [ "$code" = "204" ]; then
    if echo "$body" | grep -Eq '"averageProcessingTime"\s*:\s*4(\.5|,5)|"approvalRate"\s*:\s*0\.85'; then
      log_fail "approvals.getStats ainda retorna MOCK (4.5h / 0.85)"
    else
      log_pass "approvals.getStats sem valores mock canonicos (4.5 / 0.85)"
    fi
    if echo "$body" | grep -Eq '"total"\s*:\s*45'; then
      log_fail "approvals.getStats.pending.total ainda = 45 (mock)"
    else
      log_pass "approvals.getStats.pending.total != 45"
    fi
    if echo "$body" | grep -Eq '"source"\s*:\s*"db_real"|"source"\s*:\s*"db_empty"'; then
      log_pass "approvals.getStats.source declarado (db_real/db_empty)"
    else
      log_warn "approvals.getStats.source ausente — verificar deploy do PR #92"
    fi
  else
    log_warn "approvals.getStats retornou HTTP $code (login admin necessario). Passe ADMIN_COOKIE."
  fi
else
  log_warn "ADMIN_COOKIE nao informado — pulei checagens de /admin/approvals e /admin/network"
fi

# ================================================================
section "5 · UX publica do marketplace"
# ================================================================
mp=$(http_body "/marketplaces")
if echo "$mp" | grep -q '800+'; then
  log_fail "Marketplace publico ainda mostra '800+' e-books (mock)"
else
  log_pass "Marketplace publico NAO exibe mais '800+'"
fi
if echo "$mp" | grep -q '234'; then
  log_pass "Marketplace publico exibe metrica coerente (234)"
else
  log_warn "Marketplace publico nao contem '234' — validar visualmente"
fi

# ================================================================
section "6 · Dashboard (sidebar always-on)"
# ================================================================
# So conseguimos validar HTML shell sem login; procuramos o marker do PR
dash=$(http_body "/dashboard")
if echo "$dash" | grep -q 'data-testid="sidebar-always-on"'; then
  log_pass "Marker data-testid=sidebar-always-on presente no bundle"
else
  # normalmente o wouter/vite so injeta apos JS; nao e falha determinante
  log_warn "Marker sidebar-always-on nao localizado no HTML shell (SPA) — inspecionar via navegador"
fi

# ================================================================
section "7 · Anti-regressao da rota Academia"
# ================================================================
ac=$(http_status "/academia")
case "$ac" in
  200) log_pass "/academia = 200" ;;
  302) log_pass "/academia = 302 (redirect esperado)" ;;
  403) log_fail "/academia = 403 (regressao do fix pos-#77)" ;;
  *)   log_warn "/academia = $ac" ;;
esac

# ================================================================
# Sumario
# ================================================================
printf "\n${BOLD}== SUMARIO ==${NC}\n"
printf "  ${GREEN}PASS${NC}: %d   ${YELLOW}WARN${NC}: %d   ${RED}FAIL${NC}: %d\n" "$pass" "$warn" "$fail"

if [ "$fail" -gt 0 ]; then
  printf "\n${RED}${BOLD}RESULTADO: NO-GO${NC}\n"
  exit 2
elif [ "$warn" -gt 0 ]; then
  printf "\n${YELLOW}${BOLD}RESULTADO: GO COM RESSALVAS${NC}\n"
  exit 1
else
  printf "\n${GREEN}${BOLD}RESULTADO: GO${NC}\n"
  exit 0
fi
