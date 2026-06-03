#!/usr/bin/env bash
# =============================================================================
# Verificação cirúrgica pós-deploy do frontend publicado
# Confirma: HTML correto, asset JS servido como JS, CSS servido como CSS,
# 404 explícito para asset ausente, /login no SPA fallback retornando HTML.
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_HTML="$ROOT_DIR/frontend/dist/index.html"
BASE_URL="${1:-https://oneverso.com.br}"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
ACCEPT="text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

if [[ ! -f "$DIST_HTML" ]]; then
  fail "frontend/dist/index.html não encontrado. Rode npm run build:frontend antes."
  exit 2
fi

EXPECTED_ASSET="$(grep -oE 'src="/assets/index-[A-Za-z0-9_-]+\.js"' "$DIST_HTML" | head -1 | sed 's/src="//; s/"//')"
EXPECTED_CSS="$(grep -oE 'href="/assets/[A-Za-z0-9_-]+\.css"' "$DIST_HTML" | head -1 | sed 's/href="//; s/"//')"

if [[ -z "$EXPECTED_ASSET" || -z "$EXPECTED_CSS" ]]; then
  fail "não foi possível detectar asset JS/CSS esperados no dist"
  exit 2
fi

echo "BASE_URL=$BASE_URL"
echo "EXPECTED_ASSET=$EXPECTED_ASSET"
echo "EXPECTED_CSS=$EXPECTED_CSS"
echo

ERRORS=0

# 1. HTML da home referencia o asset esperado?
TMP_HTML="$(mktemp)"; trap 'rm -f "$TMP_HTML"' EXIT
curl -fsSL -A "$UA" -H "Accept: $ACCEPT" "$BASE_URL/" -o "$TMP_HTML"
CURRENT_ASSET="$(grep -oE 'src="/assets/index-[A-Za-z0-9_-]+\.js"' "$TMP_HTML" | head -1 | sed 's/src="//; s/"//')"
if [[ "$CURRENT_ASSET" == "$EXPECTED_ASSET" ]]; then
  ok "HTML publicado referencia o asset esperado ($EXPECTED_ASSET)"
else
  fail "HTML publicado referencia asset antigo: ${CURRENT_ASSET:-<none>}"
  ERRORS=$((ERRORS+1))
fi

# 2. Asset JS retorna text/javascript?
JS_CT="$(curl -fsSI -A "$UA" "$BASE_URL$EXPECTED_ASSET" | awk -F': ' 'tolower($1)=="content-type" {print tolower($2)}' | tr -d '\r' | head -1 || true)"
if [[ "$JS_CT" == text/javascript* || "$JS_CT" == application/javascript* ]]; then
  ok "asset JS servido com Content-Type correto ($JS_CT)"
else
  fail "asset JS servido com Content-Type errado: ${JS_CT:-<unknown>} (esperado text/javascript)"
  ERRORS=$((ERRORS+1))
fi

# 3. Asset CSS retorna text/css?
CSS_CT="$(curl -fsSI -A "$UA" "$BASE_URL$EXPECTED_CSS" | awk -F': ' 'tolower($1)=="content-type" {print tolower($2)}' | tr -d '\r' | head -1 || true)"
if [[ "$CSS_CT" == text/css* ]]; then
  ok "asset CSS servido com Content-Type correto ($CSS_CT)"
else
  fail "asset CSS servido com Content-Type errado: ${CSS_CT:-<unknown>} (esperado text/css)"
  ERRORS=$((ERRORS+1))
fi

# 4. Asset inexistente retorna 404 (e não HTML 200 do SPA fallback)?
MISSING_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/assets/this-asset-should-not-exist-xyz123.js")"
if [[ "$MISSING_STATUS" == "404" ]]; then
  ok "asset ausente retorna 404 explícito (htaccess endurecido funcionando)"
else
  warn "asset ausente retorna $MISSING_STATUS (esperado 404 após endurecimento do htaccess)"
fi

# 5. SPA fallback ativo em /login?
LOGIN_STATUS="$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" -H "Accept: $ACCEPT" "$BASE_URL/login")"
LOGIN_CT="$(curl -fsSI -A "$UA" "$BASE_URL/login" | awk -F': ' 'tolower($1)=="content-type" {print tolower($2)}' | tr -d '\r' | head -1 || true)"
if [[ "$LOGIN_STATUS" == "200" && "$LOGIN_CT" == text/html* ]]; then
  ok "SPA fallback /login retorna HTML 200 ($LOGIN_CT)"
else
  fail "SPA fallback /login falhou: status=$LOGIN_STATUS ct=$LOGIN_CT"
  ERRORS=$((ERRORS+1))
fi

echo
if [[ $ERRORS -eq 0 ]]; then
  ok "verificação pós-deploy do frontend concluída sem falhas"
  echo "STATUS=OK_FRONTEND_PUBLISHED"
  exit 0
else
  fail "$ERRORS falha(s) detectada(s) na verificação pós-deploy"
  echo "STATUS=FAIL_FRONTEND_PUBLISHED"
  exit 1
fi
