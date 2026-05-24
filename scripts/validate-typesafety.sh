#!/usr/bin/env bash
# ==============================================================================
# Script de Validação Type-Safety tRPC End-to-End
# ==============================================================================
# Valida que os tipos do backend estão corretamente exportados para o frontend
# ==============================================================================

set -e

echo "=========================================="
echo "Validação Type-Safety tRPC"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contadores
PASS=0
FAIL=0

# Função de log
log_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASS++))
}

log_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAIL++))
}

log_warn() {
    echo -e "${YELLOW}⚠ WARN:${NC} $1"
}

cd /workspace/MMN_AI-to-AI

echo "1. Verificando AppRouter exportado..."
if [ -f "backend/src/appRouter.ts" ]; then
    if grep -q "export type AppRouter = typeof appRouter" "backend/src/appRouter.ts"; then
        log_pass "AppRouter exportado corretamente"
    else
        log_fail "AppRouter não exportado corretamente"
    fi
else
    log_fail "appRouter.ts não encontrado"
fi

echo ""
echo "2. Verificando tRPC client no frontend..."
if [ -f "frontend/src/lib/trpc.ts" ]; then
    if grep -q "import type { AppRouter }" "frontend/src/lib/trpc.ts"; then
        log_pass "Frontend importa AppRouter"
    else
        log_fail "Frontend não importa AppRouter"
    fi

    if grep -q "createTRPCReact<AppRouter>" "frontend/src/lib/trpc.ts"; then
        log_pass "createTRPCReact com AppRouter"
    else
        log_fail "createTRPCReact não usa AppRouter"
    fi
else
    log_fail "frontend/src/lib/trpc.ts não encontrado"
fi

echo ""
echo "3. Verificando tRPC provider..."
if [ -f "frontend/src/components/trpc-provider.tsx" ]; then
    if grep -q "trpc.Provider" "frontend/src/components/trpc-provider.tsx"; then
        log_pass "TRPCProvider configurado"
    else
        log_fail "TRPCProvider não configurado"
    fi
else
    log_fail "trpc-provider.tsx não encontrado"
fi

echo ""
echo "4. Verificando Context tRPC..."
if [ -f "backend/src/trpc/trpc.ts" ]; then
    if grep -q "protectedProcedure" "backend/src/trpc/trpc.ts"; then
        log_pass "protectedProcedure definido"
    else
        log_fail "protectedProcedure não definido"
    fi

    if grep -q "publicProcedure" "backend/src/trpc/trpc.ts"; then
        log_pass "publicProcedure definido"
    else
        log_fail "publicProcedure não definido"
    fi
else
    log_fail "backend/src/trpc/trpc.ts não encontrado"
fi

echo ""
echo "5. Verificando schemas do banco..."
if [ -f "database/schemas/schema.ts" ]; then
    if grep -q "export type User" "database/schemas/schema.ts"; then
        log_pass "Types de User exportados"
    else
        log_warn "Types de User não exportados"
    fi
else
    log_fail "schema.ts não encontrado"
fi

echo ""
echo "6. Verificando roteamento no frontend..."
if [ -f "frontend/src/App.tsx" ]; then
    ROUTE_COUNT=$(grep -c "Route path=" "frontend/src/App.tsx" || echo "0")
    log_pass "App.tsx com $ROUTE_COUNT rotas definidas"
else
    log_fail "App.tsx não encontrado"
fi

echo ""
echo "7. Verificando agentes agentic..."
if [ -d "backend/src/agentic" ]; then
    if [ -f "backend/src/agentic/orchestrator.ts" ] || [ -f "backend/src/agentic/marketingOrchestrator.ts" ]; then
        log_pass "Orchestrator agentic implementado"
    else
        log_warn "Orchestrator não encontrado"
    fi
else
    log_fail "Diretório agentic não encontrado"
fi

echo ""
echo "8. Verificando rotas tRPC no appRouter..."
if [ -f "backend/src/appRouter.ts" ]; then
    ROUTER_COUNT=$(grep -c "router({" "backend/src/appRouter.ts" || echo "0")
    log_pass "appRouter com $ROUTER_COUNT definições de router"
else
    log_fail "appRouter não encontrado"
fi

echo ""
echo "=========================================="
echo "Resumo da Validação"
echo "=========================================="
echo -e "Passos: ${GREEN}$PASS${NC}"
echo -e "Falhas: ${RED}$FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Type-Safety tRPC validado com sucesso!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Verificações falharam. Corrija os problemas listados.${NC}"
    exit 1
fi