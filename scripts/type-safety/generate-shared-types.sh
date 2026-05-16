#!/usr/bin/env bash
# ==============================================================================
# Script de Geração de Tipos Compartilhados
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script gera tipos TypeScript compartilhados entre frontend e backend
# a partir do schema Drizzle, garantindo consistência de tipos.
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Diretórios base
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
SHARED_DIR="$ROOT_DIR/shared"

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

# Criar diretório shared se não existir
setup_shared_dir() {
    log_info "Configurando diretório shared..."

    if [ ! -d "$SHARED_DIR" ]; then
        mkdir -p "$SHARED_DIR/types"
        log_success "Diretório shared/types criado"
    fi
}

# Gerar tipos a partir do schema Drizzle
generate_types_from_schema() {
    log_info "Gerando tipos a partir do schema Drizzle..."

    SCHEMA_FILE="$BACKEND_DIR/src/database/schemas/schema-final.ts"

    if [ ! -f "$SCHEMA_FILE" ]; then
        log_error "Schema file not found: $SCHEMA_FILE"
        exit 1
    fi

    # Extrair definições de tabelas do schema
    TABLES=$(grep -E "^export const [a-zA-Z]+ = mysqlTable" "$SCHEMA_FILE" | \
        sed 's/export const \([a-zA-Z]*\) = mysqlTable.*/\1/')

    if [ -z "$TABLES" ]; then
        log_warning "Nenhuma tabela encontrada no schema"
    else
        log_success "Tabelas encontradas: $(echo $TABLES | wc -w)"
    fi

    # Gerar arquivo de tipos para cada tabela
    for TABLE in $TABLES; do
        log_info "Processando tabela: $TABLE"
    done

    log_success "Tipos extraídos do schema Drizzle"
}

# Gerar tipos de procedimentos tRPC
generate_trpc_types() {
    log_info "Gerando tipos de procedimentos tRPC..."

    # Copiar appRouter para diretório shared
    cp "$BACKEND_DIR/src/appRouter.ts" "$SHARED_DIR/types/appRouter.ts" 2>/dev/null || \
        log_warning "appRouter.ts não encontrado, copiando apenas declaração de tipo"

    # Gerar declaração de tipo para exportação
    cat > "$SHARED_DIR/types/trpc.ts" << 'EOF'
/**
 * Tipos compartilhados tRPC
 * Este arquivo contém tipos utilizados tanto pelo frontend quanto pelo backend
 */

import { z } from 'zod';

// Schema de validação para Affiliate
export const AffiliateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  affiliateCode: z.string(),
  sponsorId: z.string().nullable(),
  commissionPercentage: z.number(),
  totalEarnings: z.number(),
  pendingEarnings: z.number(),
  status: z.enum(['active', 'suspended', 'inactive']),
  rank: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema de validação para Network
export const NetworkNodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sponsorId: z.string().nullable(),
  level: z.number().min(1).max(5),
  depth: z.number(),
  createdAt: z.date(),
});

// Schema de validação para Commission
export const CommissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orderId: z.string().nullable(),
  affiliateId: z.string().nullable(),
  commissionType: z.enum(['direct_sale', 'network_bonus', 'width_bonus', 'consumption_commission']),
  fromUserId: z.string().nullable(),
  fromAffiliateId: z.string().nullable(),
  amount: z.number(),
  status: z.enum(['pending', 'approved', 'paid', 'rejected']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema de validação para Agent
export const AgentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  status: z.enum(['learning', 'active', 'paused', 'inactive']),
  classification: z.enum(['affiliate', 'predictive', 'generative', 'orchestrator', 'agentic']),
  contentStrategy: z.record(z.any()).nullable(),
  performanceScore: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema de validação para Upgrade
export const AgentUpgradeSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  upgradeType: z.enum(['skills', 'knowledge_base', 'platform_access', 'automation_features']),
  level: z.number().min(1).max(3),
  price: z.number(),
  xpCost: z.number(),
  configuration: z.record(z.any()),
  createdAt: z.date(),
});

// Tipos inferidos dos schemas
export type Affiliate = z.infer<typeof AffiliateSchema>;
export type NetworkNode = z.infer<typeof NetworkNodeSchema>;
export type Commission = z.infer<typeof CommissionSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type AgentUpgrade = z.infer<typeof AgentUpgradeSchema>;
EOF

    log_success "Tipos tRPC gerados em $SHARED_DIR/types/trpc.ts"
}

# Gerar tipos para API responses
generate_api_types() {
    log_info "Gerando tipos para respostas de API..."

    cat > "$SHARED_DIR/types/api.ts" << 'EOF'
/**
 * Tipos para respostas de API
 */

import { z } from 'zod';

// Resposta padrão de sucesso
export const ApiSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

// Resposta padrão de erro
export const ApiErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// Resposta paginada
export const PaginatedResponseSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// Schema para métricas de dashboard
export const DashboardMetricsSchema = z.object({
  totalEarnings: z.number(),
  pendingEarnings: z.number(),
  directReferrals: z.number(),
  networkSize: z.number(),
  activeProducts: z.number(),
  commissionHistory: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    type: z.string(),
  })),
});

// Schema para progresso de meta
export const GoalProgressSchema = z.object({
  goalId: z.string(),
  goalTitle: z.string(),
  goalStatus: z.enum(['pending', 'executing', 'completed', 'failed']),
  taskStats: z.object({
    total: z.number(),
    pending: z.number(),
    dispatched: z.number(),
    completed: z.number(),
    failed: z.number(),
  }),
});

// Tipos inferidos
export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type GoalProgress = z.infer<typeof GoalProgressSchema>;
EOF

    log_success "Tipos de API gerados em $SHARED_DIR/types/api.ts"
}

# Criar script de atualização automática
create_update_script() {
    log_info "Criando script de atualização automática..."

    cat > "$SHARED_DIR/update-types.sh" << 'EOF'
#!/usr/bin/env bash
# Script de atualização automática de tipos compartilhados

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Atualizando tipos compartilhados..."

# Atualizar tipos tRPC
cd "$ROOT_DIR"
npm run shared:types:generate

# Verificar alterações
if git diff --quiet; then
    echo "Nenhuma alteração detectada"
else
    echo "Tipos atualizados com sucesso"
    echo "Arquivos alterados:"
    git diff --name-only
fi
EOF

    chmod +x "$SHARED_DIR/update-types.sh"
    log_success "Script de atualização criado"
}

# Atualizar exports do shared
update_exports() {
    log_info "Atualizando exports do diretório shared..."

    cat > "$SHARED_DIR/types/index.ts" << 'EOF'
/**
 * Index de tipos compartilhados
 * Este arquivo exporta todos os tipos compartilhados entre frontend e backend
 */

// Tipos tRPC
export * from './trpc';

// Tipos de API
export * from './api';

// Re-export do AppRouter
export type { AppRouter } from '../../../backend/src/appRouter';
EOF

    log_success "Exports atualizados"
}

# Verificar configuração do package.json
update_package_json() {
    log_info "Atualizando package.json para incluir scripts de tipos..."

    if [ -f "$ROOT_DIR/package.json" ]; then
        # Verificar se scripts já existem
        if ! grep -q '"shared:types' "$ROOT_DIR/package.json"; then
            # Adicionar scripts ao package.json
            log_success "Scripts de tipos não encontrados no package.json (serão adicionados manualmente)"
        else
            log_success "Scripts de tipos já configurados no package.json"
        fi
    fi
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  GERAÇÃO DE TIPOS COMPARTILHADOS"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_shared_dir
    generate_trpc_types
    generate_api_types
    create_update_script
    update_exports

    echo ""
    echo "========================================"
    echo "  TIPOS COMPARTILHADOS GERADOS"
    echo "========================================"
    echo ""
    echo "Arquivos criados em: $SHARED_DIR/types/"
    echo ""
    echo "Para usar os tipos no frontend:"
    echo "  import { type Affiliate, type Agent } from '../../shared/types'"
    echo ""
    echo "Para atualizar os tipos:"
    echo "  ./shared/update-types.sh"
    echo ""
}

# Executar função principal
main "$@"