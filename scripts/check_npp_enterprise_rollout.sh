#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://api.oneverso.com.br}"
EXPLICIT_API_KEY="${2:-}"
REGISTRY_KEYS="${3:-}"
TARGET_ENVIRONMENT="${4:-staging}"

sanitize_base() {
  local input="$1"
  echo "${input%/}"
}

extract_registry_key() {
  local registry="$1"
  if [[ -z "$registry" ]]; then
    return 0
  fi

  python3 - <<'PY' "$registry"
import sys
raw = sys.argv[1].strip()
for chunk in [part.strip() for part in raw.replace(';', ',').split(',') if part.strip()]:
    if ':' in chunk:
        print(chunk.split(':', 1)[1].strip())
        raise SystemExit(0)
print(raw)
PY
}

API_KEY="$EXPLICIT_API_KEY"
if [[ -z "$API_KEY" ]]; then
  API_KEY="$(extract_registry_key "$REGISTRY_KEYS")"
fi

BASE_URL="$(sanitize_base "$BASE_URL")"
DISCOVERY_URL="$BASE_URL/api/v1/"
OPENAPI_URL="$BASE_URL/api/v1/openapi.json"
RUNTIME_URL="$BASE_URL/api/v1/partners/runtime"
BLUEPRINT_URL="$BASE_URL/api/v1/partners/onboarding/blueprint"
TRPC_RUNTIME_URL="$BASE_URL/api/trpc/partnersDelivery.runtimeOverview?input=%7B%7D"
TRPC_BLUEPRINT_URL="$BASE_URL/api/trpc/partnersDelivery.onboardingBlueprint?input=%7B%7D"

if [[ -z "$API_KEY" && "$TARGET_ENVIRONMENT" == "production" ]]; then
  echo "ERRO: NEXUS_OPEN_API_KEY/NEXUS_OPEN_API_KEYS ausente para smoke test autenticado em produção." >&2
  exit 2
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl -fsSL "$DISCOVERY_URL" -o "$TMP_DIR/discovery.json"
curl -fsSL "$OPENAPI_URL" -o "$TMP_DIR/openapi.json"

if [[ -n "$API_KEY" ]]; then
  MODE="authenticated"
  curl -fsSL -H "Authorization: Bearer $API_KEY" "$RUNTIME_URL" -o "$TMP_DIR/runtime.json"
  curl -fsSL -H "Authorization: Bearer $API_KEY" "$BLUEPRINT_URL" -o "$TMP_DIR/blueprint.json"
else
  MODE="public_fallback"
  echo "WARN: sem NEXUS_OPEN_API_KEY/NEXUS_OPEN_API_KEYS; executando smoke público via tRPC para $TARGET_ENVIRONMENT." >&2
  curl -fsSL "$TRPC_RUNTIME_URL" -o "$TMP_DIR/runtime.json"
  curl -fsSL "$TRPC_BLUEPRINT_URL" -o "$TMP_DIR/blueprint.json"
fi

python3 - <<'PY' "$TMP_DIR/discovery.json" "$TMP_DIR/openapi.json" "$TMP_DIR/runtime.json" "$TMP_DIR/blueprint.json" "$MODE"
import json, sys

discovery = json.load(open(sys.argv[1]))
openapi = json.load(open(sys.argv[2]))
runtime_raw = json.load(open(sys.argv[3]))
blueprint_raw = json.load(open(sys.argv[4]))
mode = sys.argv[5]

runtime = runtime_raw.get('data', runtime_raw.get('result', {}).get('data', {}))
blueprint = blueprint_raw.get('data', blueprint_raw.get('result', {}).get('data', {}))

assert discovery.get('name') == 'Nexus Open API', 'Discovery inválido'
assert openapi.get('openapi') == '3.1.1', 'Spec OpenAPI não está em 3.1.1'
assert runtime.get('apiStandard') == 'OpenAPI 3.1.1', 'Runtime sem padrão esperado'
steps = blueprint.get('steps', [])
assert any(step.get('id') == 'pack_a2' for step in steps), 'Blueprint sem etapa pack_a2'

print('STATUS=OK_NPP_ENTERPRISE_ROLLOUT')
print('SMOKE_MODE=' + mode)
print('DISCOVERY=' + discovery.get('stage', 'unknown'))
print('OPENAPI=' + openapi.get('openapi', 'unknown'))
print('RUNTIME_PROVIDER=' + runtime.get('primaryProvider', 'unknown'))
print('BLUEPRINT_STEPS=' + str(len(steps)))
PY
