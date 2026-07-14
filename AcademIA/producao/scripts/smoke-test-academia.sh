#!/bin/bash
# 🧪 Smoke Test · AcademIA
# Executa validações de sanidade antes do go-live
# Uso: ./smoke-test-academia.sh [--env=prod|staging|local]

set -e  # Para no primeiro erro

ENV="prod"
BASE_URL="https://oneverso.com.br"
API_URL="https://api.oneverso.com.br"

# Parse args
for arg in "$@"; do
  case $arg in
    --env=*) ENV="${arg#*=}" ;;
    --url=*) BASE_URL="${arg#*=}" ;;
    --api=*) API_URL="${arg#*=}" ;;
    *) ;;
  esac
done

case $ENV in
  prod) BASE_URL="https://oneverso.com.br"; API_URL="https://api.oneverso.com.br" ;;
  staging) BASE_URL="https://staging.oneverso.com.br"; API_URL="https://api-staging.oneverso.com.br" ;;
  local) BASE_URL="http://localhost:3000"; API_URL="http://localhost:4000" ;;
esac

echo "🧪 Smoke Test · AcademIA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ENV:    $ENV"
echo "URL:    $BASE_URL"
echo "API:    $API_URL"
echo "TIME:   $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Helper functions
check_ok() {
  echo -e "${GREEN}✅ $1${NC}"
  PASS=$((PASS+1))
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
  FAIL=$((FAIL+1))
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARN=$((WARN+1))
}

check_http() {
  local url=$1
  local expected=$2
  local desc=$3
  local code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expected" ]; then
    check_ok "$desc (HTTP $code)"
  else
    check_fail "$desc (esperado $expected, recebido $code)"
  fi
}

# ========== 1. INFRA BÁSICA ==========
echo ""
echo "1️⃣  Infraestrutura Básica"
echo "─────────────────────────"

check_http "$BASE_URL" "200" "Site principal"
check_http "$BASE_URL/academia" "200" "Hub Academia"
check_http "$BASE_URL/api/health" "200" "API Health"
check_http "$BASE_URL/admin" "200" "Admin (sem auth)"

# ========== 2. HUBS HTML ==========
echo ""
echo "2️⃣  Hubs HTML"
echo "─────────────"

for hub in index apostilas tutoriais playbooks webinars lib lab; do
  check_http "$BASE_URL/academia/hubs/$hub.html" "200" "Hub $hub"
done

# ========== 3. VÍDEOS CDN ==========
echo ""
echo "3️⃣  Vídeos CDN"
echo "──────────────"

for video in video-00-boas-vindas video-hero-jornada; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 -I "$BASE_URL/academia/videos/$video.mp4" 2>/dev/null || echo "000")
  if [ "$code" = "200" ] || [ "$code" = "206" ]; then
    check_ok "Vídeo $video.mp4 (HTTP $code)"
  elif [ "$code" = "404" ]; then
    check_warn "Vídeo $video.mp4 NÃO encontrado (404) — pode estar pendente"
  else
    check_fail "Vídeo $video.mp4 (HTTP $code)"
  fi
done

# ========== 4. API ENDPOINTS ==========
echo ""
echo "4️⃣  API Endpoints"
echo "─────────────────"

# Health
resp=$(curl -s --max-time 5 "$API_URL/health" 2>/dev/null)
if echo "$resp" | grep -q '"status":"ok"\|"ok":true'; then
  check_ok "GET /health → OK"
else
  check_fail "GET /health → resposta inesperada"
fi

# Academia lista
resp=$(curl -s --max-time 5 "$API_URL/academia/lessons" 2>/dev/null)
count=$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,list) else d.get('total',0))" 2>/dev/null || echo "0")
if [ "$count" -gt 0 ] 2>/dev/null; then
  check_ok "GET /academia/lessons → $count lições"
else
  check_warn "GET /academia/lessons → 0 lições (ou endpoint não implementado)"
fi

# ========== 5. ASSETS CRÍTICOS ==========
echo ""
echo "5️⃣  Assets Críticos"
echo "───────────────────"

# Personas (não devem ser públicas, mas o admin deve ter acesso)
for asset in "personas/sra_nexus_ive.png" "personas/sir_nexus_alencar.md"; do
  if [ -f "/workspace/MMN_AI-to-AI/AcademIA/$asset" ]; then
    check_ok "Asset local: $asset"
  else
    check_fail "Asset FALTANDO: $asset"
  fi
done

# Verificar tamanho das personas (devem ter tamanho esperado)
sra_size=$(stat -c%s "/workspace/MMN_AI-to-AI/AcademIA/personas/sra_nexus_ive.png" 2>/dev/null || echo "0")
if [ "$sra_size" = "4354621" ]; then
  check_ok "Sra. Ive PNG tamanho correto ($sra_size bytes)"
else
  check_warn "Sra. Ive PNG tamanho divergente ($sra_size vs 4354621 esperado)"
fi

# ========== 6. ROTEIROS ==========
echo ""
echo "6️⃣  Roteiros (mínimo 3 para piloto)"
echo "────────────────────────────────────"

roteiros=$(ls /workspace/MMN_AI-to-AI/AcademIA/videos/roteiros/*.md 2>/dev/null | wc -l)
if [ "$roteiros" -ge 3 ]; then
  check_ok "$roteiros roteiros encontrados (≥ 3 mínimo)"
else
  check_fail "Apenas $roteiros roteiros (< 3 mínimo para piloto)"
fi

# Conferir tamanho mínimo de cada roteiro (>= 80 linhas)
for r in 00-boas-vindas 01-entendendo-ioaid 02-sho-sistema-imune; do
  arq=$(ls /workspace/MMN_AI-to-AI/AcademIA/videos/roteiros/${r}*.md 2>/dev/null | head -1)
  if [ -f "$arq" ]; then
    linhas=$(wc -l < "$arq")
    if [ "$linhas" -ge 80 ]; then
      check_ok "Roteiro $r: $linhas linhas"
    else
      check_warn "Roteiro $r: $linhas linhas (curto)"
    fi
  else
    check_fail "Roteiro $r: NÃO encontrado"
  fi
done

# ========== 7. PERFORMANCE ==========
echo ""
echo "7️⃣  Performance (LCP < 2.5s)"
echo "─────────────────────────────"

start=$(date +%s%N)
curl -s -o /dev/null --max-time 10 "$BASE_URL/academia"
end=$(date +%s%N)
duration_ms=$(( (end - start) / 1000000 ))

if [ "$duration_ms" -lt 2500 ]; then
  check_ok "Academia LCP: ${duration_ms}ms (< 2500ms)"
elif [ "$duration_ms" -lt 5000 ]; then
  check_warn "Academia LCP: ${duration_ms}ms (entre 2.5s-5s)"
else
  check_fail "Academia LCP: ${duration_ms}ms (> 5s)"
fi

# ========== 8. CONFORMIDADE ==========
echo ""
echo "8️⃣  Conformidade & Compliance"
echo "─────────────────────────────"

# Termos de uso
if [ -f /workspace/MMN_AI-to-AI/AcademIA/README.md ]; then
  check_ok "README.md existe"
else
  check_fail "README.md FALTANDO"
fi

# LGPD
if [ -f /workspace/MMN_AI-to-AI/AcademIA/Lib-Nexus/knowledge-base/03-conformidade-lgpd.md ]; then
  check_ok "Documentação LGPD presente"
else
  check_warn "Documentação LGPD não encontrada"
fi

# ANATEL
if [ -f /workspace/MMN_AI-to-AI/AcademIA/Lib-Nexus/knowledge-base/04-conformidade-anatel.md ]; then
  check_ok "Documentação ANATEL presente"
else
  check_warn "Documentação ANATEL não encontrada"
fi

# ========== RESUMO ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Pass:  $PASS${NC}"
echo -e "${YELLOW}⚠️  Warn:  $WARN${NC}"
echo -e "${RED}❌ Fail:  $FAIL${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}🛑 SMOKE TEST FALHOU${NC}"
  echo "Corrija os $FAIL erros antes de fazer go-live."
  exit 1
elif [ "$WARN" -gt 3 ]; then
  echo -e "${YELLOW}⚠️  SMOKE TEST PASSOU COM AVISOS${NC}"
  echo "Revise os $WARN avisos antes de prosseguir."
  exit 0
else
  echo -e "${GREEN}🎉 SMOKE TEST PASSOU${NC}"
  echo "Sistema pronto para go-live."
  exit 0
fi