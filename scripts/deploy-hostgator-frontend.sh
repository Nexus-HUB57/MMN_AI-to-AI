#!/usr/bin/env bash
# =============================================================================
# MMN AI-to-AI — Deploy do Frontend para HostGator (oneverso.com.br)
#
# Pré-requisitos:
#   - lftp instalado (`apt-get install lftp` ou `brew install lftp`)
#   - Variáveis de ambiente:
#       HOSTGATOR_HOST          (default: ftp.oneverso.com.br)
#       HOSTGATOR_USER
#       HOSTGATOR_PASS
#       HOSTGATOR_REMOTE_PATH   (default: /public_html)
#
# Uso:
#   ./scripts/deploy-hostgator-frontend.sh            # apenas sync (assume dist/ pronto)
#   ./scripts/deploy-hostgator-frontend.sh --build    # roda npm run build:frontend antes
#   ./scripts/deploy-hostgator-frontend.sh --dry-run  # apenas mostra o que seria enviado
#
# Observação:
#   - O arquivo frontend/public/.htaccess é versionado e será copiado para
#     frontend/dist/.htaccess durante o build do Vite.
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}    $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}      $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}    $*"; }
log_error() { echo -e "${RED}[ERROR]${NC}   $*"; }

HOSTGATOR_HOST="${HOSTGATOR_HOST:-ftp.oneverso.com.br}"
HOSTGATOR_REMOTE_PATH="${HOSTGATOR_REMOTE_PATH:-/public_html}"
DIST_DIR="frontend/dist"
BROWSER_UA="${BROWSER_UA:-Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36}"
HTML_ACCEPT="${HTML_ACCEPT:-text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8}"
PRODUCTION_BASE_URL="${PRODUCTION_BASE_URL:-https://oneverso.com.br}"
DEPLOY_POLL_ATTEMPTS="${DEPLOY_POLL_ATTEMPTS:-18}"
DEPLOY_POLL_SLEEP_SECONDS="${DEPLOY_POLL_SLEEP_SECONDS:-10}"

BUILD=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --build)   BUILD=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --help|-h)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) log_warn "Argumento desconhecido: $arg" ;;
  esac
done

extract_asset_path() {
  local html_file="$1"
  grep -oE 'src="/assets/index-[A-Za-z0-9_-]+\.js"' "$html_file" | head -1 | sed 's/src="//' | sed 's/"//'
}

extract_css_path() {
  local html_file="$1"
  grep -oE 'href="/assets/[A-Za-z0-9_-]+\.css"' "$html_file" | head -1 | sed 's/href="//' | sed 's/"//'
}

assert_http_ok() {
  local url="$1"
  if curl -fsSIL -H 'Accept: */*' "$url" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

log_info "Verificando ambiente..."

if ! command -v lftp >/dev/null 2>&1; then
  log_error "lftp não encontrado. Instale com 'apt-get install lftp' ou 'brew install lftp'."
  exit 1
fi

if [[ -z "${HOSTGATOR_USER:-}" || -z "${HOSTGATOR_PASS:-}" ]]; then
  log_error "HOSTGATOR_USER e HOSTGATOR_PASS devem estar definidos no ambiente."
  log_info  "Exemplo: export HOSTGATOR_USER='usuario'; export HOSTGATOR_PASS='senha'"
  exit 1
fi

log_ok "Ambiente OK."

if [[ "$BUILD" -eq 1 ]]; then
  log_info "Executando build do frontend..."
  npm run build:frontend
  log_ok "Build concluído."
fi

if [[ ! -d "$DIST_DIR" ]]; then
  log_error "Diretório $DIST_DIR não encontrado. Rode com --build ou execute 'npm run build:frontend' antes."
  exit 1
fi

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  log_error "$DIST_DIR/index.html ausente — build inválido."
  exit 1
fi

if [[ ! -f "$DIST_DIR/.htaccess" ]]; then
  log_warn "$DIST_DIR/.htaccess ausente. O portal ainda pode funcionar, mas rotas SPA em Apache podem quebrar."
  log_warn "Garanta que frontend/public/.htaccess exista antes do build."
fi

EXPECTED_ASSET=$(extract_asset_path "$DIST_DIR/index.html")
EXPECTED_CSS=$(extract_css_path "$DIST_DIR/index.html")
if [[ -z "$EXPECTED_ASSET" ]]; then
  log_error "Não foi possível detectar o asset JS principal em $DIST_DIR/index.html."
  exit 1
fi

DIST_SIZE=$(du -sh "$DIST_DIR" | awk '{print $1}')
FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
log_ok "Build pronto: $FILE_COUNT arquivos, $DIST_SIZE."
log_info "Asset esperado em produção: $EXPECTED_ASSET"
if [[ -n "$EXPECTED_CSS" ]]; then
  log_info "CSS esperado em produção: $EXPECTED_CSS"
fi

log_info "Sincronizando $DIST_DIR/  →  $HOSTGATOR_HOST:$HOSTGATOR_REMOTE_PATH"

LFTP_CMDS="
set ssl:verify-certificate yes
set ssl:check-hostname no
set ftp:ssl-allow yes
set ftp:ssl-protect-data yes
open -u $HOSTGATOR_USER,$HOSTGATOR_PASS $HOSTGATOR_HOST
lcd $DIST_DIR
cd $HOSTGATOR_REMOTE_PATH
"

if [[ "$DRY_RUN" -eq 1 ]]; then
  LFTP_CMDS+="
mirror --reverse --delete --verbose --dry-run
"
  log_warn "Executando em modo DRY-RUN (nenhuma alteração será aplicada)."
else
  LFTP_CMDS+="
mirror --reverse --delete --parallel=4 --verbose
"
fi

LFTP_CMDS+="
bye
"

set +e
echo "$LFTP_CMDS" | lftp
RC=$?
set -e

if [[ "$RC" -ne 0 ]]; then
  log_error "Sync falhou (exit $RC)."
  exit "$RC"
fi

log_ok "Sync concluído."

if [[ "$DRY_RUN" -eq 0 ]]; then
  log_info "Validando deploy via HTTPS..."

  if curl -fsSIL -A "$BROWSER_UA" -H "Accept: $HTML_ACCEPT" "$PRODUCTION_BASE_URL" >/dev/null 2>&1; then
    log_ok "$PRODUCTION_BASE_URL respondendo 2xx com cabeçalhos de navegador."
  else
    log_warn "Não foi possível validar $PRODUCTION_BASE_URL com user-agent de navegador. Verifique ModSecurity/allowlist manualmente."
  fi

  if curl -fsSIL -A "$BROWSER_UA" -H "Accept: $HTML_ACCEPT" "$PRODUCTION_BASE_URL/login" >/dev/null 2>&1; then
    log_ok "SPA fallback /login respondendo 2xx."
  else
    log_warn "Não foi possível validar o fallback SPA em /login."
  fi

  log_info "Aguardando o HTML publicado referenciar o novo asset..."
  DEPLOY_CONFIRMED=0
  for attempt in $(seq 1 "$DEPLOY_POLL_ATTEMPTS"); do
    curl -fsSL -H "Accept: $HTML_ACCEPT" "$PRODUCTION_BASE_URL" -o /tmp/hostgator-root.html || true
    CURRENT_ASSET=$(extract_asset_path /tmp/hostgator-root.html || true)
    CURRENT_CSS=$(extract_css_path /tmp/hostgator-root.html || true)
    log_info "Tentativa $attempt/$DEPLOY_POLL_ATTEMPTS → asset atual: ${CURRENT_ASSET:-indefinido}"

    if [[ "$CURRENT_ASSET" == "$EXPECTED_ASSET" ]] && assert_http_ok "$PRODUCTION_BASE_URL$EXPECTED_ASSET"; then
      if [[ -n "$EXPECTED_CSS" ]]; then
        if [[ "$CURRENT_CSS" != "$EXPECTED_CSS" ]]; then
          log_warn "HTML já virou para o JS novo, mas CSS ainda não coincide (${CURRENT_CSS:-indefinido})."
        elif ! assert_http_ok "$PRODUCTION_BASE_URL$EXPECTED_CSS"; then
          log_warn "CSS esperado referenciado, mas ainda indisponível: $EXPECTED_CSS"
        fi
      fi
      DEPLOY_CONFIRMED=1
      log_ok "Produção atualizada para o asset esperado: $EXPECTED_ASSET"
      break
    fi

    sleep "$DEPLOY_POLL_SLEEP_SECONDS"
  done

  if [[ "$DEPLOY_CONFIRMED" -ne 1 ]]; then
    log_error "O deploy não propagou o asset esperado dentro da janela de validação."
    log_error "Esperado: $EXPECTED_ASSET"
    log_error "Portal ainda referencia: ${CURRENT_ASSET:-indefinido}"
    exit 1
  fi
fi

log_ok "Deploy do frontend para HostGator finalizado."
