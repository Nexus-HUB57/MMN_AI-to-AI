#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROUTES_FILE="$ROOT_DIR/backend/src/open-api/routes.ts"
BASE_URL="${1:-https://api.oneverso.com.br}"
DISCOVERY_URL="${BASE_URL%/}/api/v1/"
TMP_JSON="$(mktemp)"
trap 'rm -f "$TMP_JSON"' EXIT

EXPECTED_STAGE="$(python3 - <<'PY' "$ROUTES_FILE"
from pathlib import Path
import re,sys
text=Path(sys.argv[1]).read_text(encoding='utf-8')
match=re.search(r'OPEN_API_STAGE\s*=\s*"([^"]+)"', text)
print(match.group(1) if match else '')
PY
)"
if [[ -z "$EXPECTED_STAGE" ]]; then
  echo "ERRO: não foi possível detectar o OPEN_API_STAGE em $ROUTES_FILE" >&2
  exit 2
fi

curl -fsSL "$DISCOVERY_URL" -o "$TMP_JSON"

CURRENT_STAGE="$(python3 - <<'PY' "$TMP_JSON"
import json,sys
obj=json.load(open(sys.argv[1]))
print(obj.get('stage',''))
PY
)"

echo "DISCOVERY_URL=$DISCOVERY_URL"
echo "EXPECTED_STAGE=$EXPECTED_STAGE"
echo "CURRENT_STAGE=$CURRENT_STAGE"

if [[ "$CURRENT_STAGE" != "$EXPECTED_STAGE" ]]; then
  echo "STATUS=FAIL_STAGE_MISMATCH"
  exit 1
fi

python3 - <<'PY' "$TMP_JSON" "$EXPECTED_STAGE"
import json,sys
obj=json.load(open(sys.argv[1]))
stage=sys.argv[2]
endpoints=obj.get('endpoints', {})
required=['openApiSpec','catalog','subscriptions','commissions','partners','auditRecent']
if stage == 'sprint-5':
    required += ['sdkJavascript','sdkPython','webhookEvents','webhookExamples']
missing=[k for k in required if k not in endpoints]
print('MISSING_ENDPOINT_KEYS=' + (','.join(missing) if missing else '<none>'))
if missing:
    raise SystemExit(1)
print('STATUS=OK_OPENAPI_RELEASE')
PY
