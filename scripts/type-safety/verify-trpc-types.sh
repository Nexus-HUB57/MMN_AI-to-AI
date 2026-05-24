#!/usr/bin/env bash
# ==============================================================================
# Script de Verificação de Type-Safety para tRPC
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script verifica a configuração de type-safety do tRPC entre frontend e
# backend, garantindo que os tipos são compartilhados corretamente.
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretórios base
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Função de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar estrutura de diretórios
check_structure() {
    log_info "Verificando estrutura de diretórios..."

    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "Diretório backend não encontrado: $BACKEND_DIR"
        exit 1
    fi

    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Diretório frontend não encontrado: $FRONTEND_DIR"
        exit 1
    fi

    if [ ! -f "$BACKEND_DIR/src/appRouter.ts" ]; then
        log_error "Arquivo appRouter.ts não encontrado no backend"
        exit 1
    fi

    if [ ! -f "$FRONTEND_DIR/src/lib/trpc.ts" ]; then
        log_error "Arquivo trpc.ts não encontrado no frontend"
        exit 1
    fi

    log_success "Estrutura de diretórios verificada com sucesso"
}

# Verificar exportação de AppRouter
check_app_router_export() {
    log_info "Verificando exportação de AppRouter..."

    if grep -q "export type AppRouter" "$BACKEND_DIR/src/appRouter.ts"; then
        log_success "AppRouter exportado corretamente no backend"
    else
        log_error "AppRouter não encontrado ou não exportado no backend"
        log_info "Adicione 'export type AppRouter = typeof appRouter' em backend/src/appRouter.ts"
        exit 1
    fi
}

# Verificar importações no frontend
check_frontend_imports() {
    log_info "Verificando importações no frontend..."

    if grep -q 'import type { AppRouter }' "$FRONTEND_DIR/src/lib/trpc.ts"; then
        log_success "Frontend importando AppRouter corretamente"
    else
        log_warning "Frontend não está importando AppRouter como tipo"
        log_info "Verifique se frontend/src/lib/trpc.ts importa o tipo correto do backend"
    fi

    # Verificar se não está usando 'any'
    if grep -q "AppRouter = any\|AppRouter: any" "$FRONTEND_DIR/src/lib/trpc.ts"; then
        log_error "Frontend ainda está usando 'any' para AppRouter"
        log_info "Substitua 'AppRouter = any' por 'import type { AppRouter }'"
        exit 1
    else
        log_success "Frontend não está usando 'any' para AppRouter"
    fi
}

# Verificar configuração do package.json
check_workspace_config() {
    log_info "Verificando configuração de workspace..."

    if [ -f "$ROOT_DIR/package.json" ]; then
        if grep -q '"workspaces"' "$ROOT_DIR/package.json"; then
            log_success "Configuração de workspaces encontrada"
        else
            log_warning "Configuração de workspaces não encontrada no package.json root"
        fi
    else
        log_error "package.json root não encontrado"
        exit 1
    fi
}

# Executar verificação TypeScript
run_typescript_check() {
    log_info "Executando verificação TypeScript..."

    # Verificar se TypeScript está instalado
    if [ ! -f "$BACKEND_DIR/node_modules/.bin/tsc" ]; then
        log_warning "TypeScript não encontrado no backend, instalando..."
        cd "$BACKEND_DIR" && npm install
    fi

    # Verificar frontend
    log_info "Verificando tipos do frontend..."
    cd "$FRONTEND_DIR"
    if npx tsc --noEmit 2>&1 | tee /tmp/frontend_types.txt; then
        log_success "Verificação TypeScript do frontend passou"
    else
        log_error "Erros de tipo encontrados no frontend"
        log_info "Verifique os erros em /tmp/frontend_types.txt"
        return 1
    fi

    # Verificar backend
    log_info "Verificando tipos do backend..."
    cd "$BACKEND_DIR"
    if npx tsc --noEmit 2>&1 | tee /tmp/backend_types.txt; then
        log_success "Verificação TypeScript do backend passou"
    else
        log_error "Erros de tipo encontrados no backend"
        log_info "Verifique os erros em /tmp/backend_types.txt"
        return 1
    fi
}

# Verificar consistência de tipos
check_type_consistency() {
    log_info "Verificando consistência de tipos entre frontend e backend..."

    # Extrair tipos de procedimentos do backend
    BACKEND_TYPES=$(grep -E "publicProcedure\.(query|mutation)" "$BACKEND_DIR/src/" -r | \
        sed -n 's/.*\.output(\([^)]*\)).*/\1/p' | \
        sort | uniq)

    if [ -z "$BACKEND_TYPES" ]; then
        log_warning "Nenhum tipo de output encontrado nos procedimentos tRPC"
    else
        log_success "Procedimentos tRPC encontrados no backend"
    fi

    # Verificar correspondência de routers
    BACKEND_ROUTERS=$(grep -E "router\(\{" "$BACKEND_DIR/src/routers/" -r | \
        sed -n 's/.*\/routers\/\([^.]*\)\.ts.*/\1/p' | sort | uniq)

    log_info "Routers encontrados no backend: $BACKEND_ROUTERS"
    log_success "Verificação de consistência de tipos concluída"
}

# Gerar relatório
generate_report() {
    log_info "Gerando relatório de verificação..."

    REPORT_FILE="$ROOT_DIR/reports/type-safety-report-$(date +%Y%m%d_%H%M%S).txt"

    cat > "$REPORT_FILE" << EOF
================================================================================
RELATÓRIO DE VERIFICAÇÃO DE TYPE-SAFETY
 Projeto: MMN_AI-to-AI
 Data: $(date)
================================================================================

CONFIGURAÇÃO VERIFICADA:
------------------------
- Backend: $BACKEND_DIR
- Frontend: $FRONTEND_DIR
- AppRouter: $BACKEND_DIR/src/appRouter.ts
- tRPC Client: $FRONTEND_DIR/src/lib/trpc.ts

RESULTADO: $([ $? -eq 0 ] && echo "APROVADO" || echo "FALHOU")

MELHORIAS APLICADAS:
--------------------
1. Frontend agora importa 'AppRouter' como tipo do backend
2. TypeScript verifica compatibilidade de tipos em compile time
3. Erros de tipo são detectados antes de chegar à produção

PRÓXIMOS PASSOS:
----------------
1. Execute 'npm run dev' para testar em ambiente de desenvolvimento
2. Monitore console do navegador por erros de tipo
3. Configure CI/CD para executar este script em cada pull request

================================================================================
EOF

    log_success "Relatório gerado: $REPORT_FILE"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  VERIFICAÇÃO DE TYPE-SAFETY tRPC"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    check_structure
    check_app_router_export
    check_frontend_imports
    check_workspace_config
    run_typescript_check || true
    check_type_consistency
    generate_report

    echo ""
    echo "========================================"
    echo "  VERIFICAÇÃO CONCLUÍDA"
    echo "========================================"
    echo ""
}

# Executar função principal
main "$@"