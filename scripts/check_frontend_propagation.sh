#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_HTML="$ROOT_DIR/frontend/dist/index.html"
BASE_URL="${1:-https://oneverso.com.br}"
HTML_ACCEPT="text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

extract_asset() {
  local html_file="$1"
  grep -oE 'src="/assets/index-[A-Za-z0-9_-]+\.js"' "$html_file" | head -1 | sed 's/src="//' | sed 's/"//'
}

extract_css() {
  local html_file="$1"
  grep -oE 'href="/assets/[A-Za-z0-9_-]+\.css"' "$html_file" | head -1 | sed 's/href="//' | sed 's/"//'
}

if [[ ! -f "$DIST_HTML" ]]; then
  echo "ERRO: frontend/dist/index.html não encontrado. Rode o build antes." >&2
  exit 2
fi

EXPECTED_ASSET="$(extract_asset "$DIST_HTML")"
EXPECTED_CSS="$(extract_css "$DIST_HTML")"
if [[ -z "$EXPECTED_ASSET" ]]; then
  echo "ERRO: não foi possível detectar o asset JS esperado no dist." >&2
  exit 2
fi

TMP_HTML="$(mktemp)"
trap 'rm -f "$TMP_HTML"' EXIT
curl -fsSL -A "$UA" -H "Accept: $HTML_ACCEPT" "$BASE_URL/" -o "$TMP_HTML"

CURRENT_ASSET="$(extract_asset "$TMP_HTML")"
CURRENT_CSS="$(extract_css "$TMP_HTML")"

echo "BASE_URL=$BASE_URL"
echo "EXPECTED_ASSET=$EXPECTED_ASSET"
echo "CURRENT_ASSET=${CURRENT_ASSET:-<none>}"
echo "EXPECTED_CSS=${EXPECTED_CSS:-<none>}"
echo "CURRENT_CSS=${CURRENT_CSS:-<none>}"

ASSET_CT="$(curl -fsSI "$BASE_URL$EXPECTED_ASSET" | awk -F': ' 'tolower($1)=="content-type" {print tolower($2)}' | tr -d '\r' | head -1 || true)"
echo "EXPECTED_ASSET_CONTENT_TYPE=${ASSET_CT:-<unknown>}"

if [[ "$CURRENT_ASSET" != "$EXPECTED_ASSET" ]]; then
  echo "STATUS=FAIL_HTML_STILL_OLD_ASSET"
  exit 1
fi

if [[ "$ASSET_CT" != text/javascript* && "$ASSET_CT" != application/javascript* ]]; then
  echo "STATUS=FAIL_EXPECTED_ASSET_NOT_JS"
  exit 1
fi

if [[ -n "$EXPECTED_CSS" && "$CURRENT_CSS" != "$EXPECTED_CSS" ]]; then
  echo "STATUS=WARN_CSS_MISMATCH"
  exit 1
fi

echo "STATUS=OK_PROPAGATED"
