# Relatório de Inconsistências - MMN_AI-to-AI

## Data: 2026-05-19

Este documento lista todas as inconsistências identificadas durante a varredura sistemática do código-fonte, comparando o frontend com as definições do backend.

---

## 1. Inconsistências Críticas (Falhas de Runtime)

### 1.1 TrendingProducts.tsx - Incompatibilidade Total de API

**Arquivo:** `frontend/src/pages/TrendingProducts.tsx`

**Problema 1 - Parâmetros de Input Incorretos:**

| Frontend Envia | Backend Espera |
|----------------|----------------|
| `{ marketplace: "Mercado Livre" \| "Shopee" \| "Hotmart", limit: 20 }` | `{ days: number, limit: number }` |

**Código Problemático (linha 17-23):**
```typescript
const { data: trendingProducts = [], isLoading } = trpc.marketplaces.getTrendingProducts.useQuery(
  {
    marketplace: selectedMarketplace,  // ❌ NÃO EXISTE no schema do backend
    limit: 20,
  },
  { enabled: true }
);
```

**Problema 2 - Campos de Resposta Ausentes:**

| Frontend Acessa | Backend Retorna |
|-----------------|-----------------|
| `product.title` | `product.productName` |
| `product.url` | ❌ NÃO EXISTE |
| `product.trendingScore` | ❌ NÃO EXISTE |
| `product.demandLevel` | ❌ NÃO EXISTE |
| `product.competitionLevel` | ❌ NÃO EXISTE |

**Código Problemático (linhas 139-152):**
```typescript
<h3 className="font-semibold text-slate-900 line-clamp-2">
  {product.title}  // ❌ Campo inexistente - backend usa 'productName'
</h3>
<Badge className={`text-xs ${getDemandColor(product.demandLevel)}`}>
  Demanda: {product.demandLevel}  // ❌ Campo inexistente
</Badge>
<Badge className={`text-xs ${getCompetitionColor(product.competitionLevel)}`}>
  Concorrência: {product.competitionLevel}  // ❌ Campo inexistente
</Badge>
```

**Código Problemático (linha 181):**
```typescript
onClick={() => handleCopyLink(product.url, product.title)}  // ❌ Campo 'url' inexistente
```

**Impacto:** O componente vai falhar completamente em runtime com erros "undefined" quando tentar acessar campos inexistentes.

**Recomendação:** Refatorar completamente o componente para utilizar o endpoint correto `getTrendingProducts` com parâmetros corretos e mapear os campos retornados para a UI esperada. Alternativamente, usar o endpoint `getProductAnalytics` para obter dados de tendência.

---

### 1.2 ContentGeneration.tsx - Procedimento Ausente

**Arquivo:** `frontend/src/pages/ContentGeneration.tsx`

**Problema - Mutation Inexistente no Backend:**

| Frontend Usa | Backend Tem |
|--------------|-------------|
| `trpc.content.generateImage` | ❌ NÃO EXISTE |

**Código Problemático (linha 106-114):**
```typescript
const { mutate: generateImage, isPending: imageLoading } = trpc.content.generateImage.useMutation({
  onSuccess: (result) => {
    setGeneratedImageUrl(result.imageUrl || null);
    toast.success("Image generated successfully");
  },
  onError: () => {
    toast.error("Failed to generate image");
  },
});
```

**Impacto:** A funcionalidade de geração de imagens não funcionará. O componente não deve quebrar completamente, mas o botão "Generate Image" terá comportamento inesperado.

---

## 2. Inconsistências de Mapeamento (Correção Necessária)

### 2.1 Marketplace Nomes vs. Enum

**Problema:** O frontend usa nomes de marketplace em português ("Mercado Livre", "Shopee", "Hotmart") mas o backend define um enum em inglês ("mercado_libre", "shopee", "hotmart").

**Frontend (`TrendingProducts.tsx` linha 10):**
```typescript
const MARKETPLACES = ['Mercado Livre', 'Shopee', 'Hotmart'] as const;
```

**Backend (`marketplacesRouter.ts` linha 24):**
```typescript
marketplace: z.enum(["mercado_libre", "shopee", "hotmart"]),
```

**Impacto:** Se o frontend tentasse filtrar por marketplace, receberia erro de validação Zod.

**Recomendação:** Manter display names no frontend e converter para enum do backend ao fazer requests.

---

## 3. Endpoints Verificados (OK)

### 3.1 ContentGeneration.tsx - Demais Procedures

| Procedure | Status | Observação |
|-----------|--------|------------|
| `trpc.content.generateText` | ✅ OK | Input/output compatíveis |
| `trpc.content.generateVariations` | ✅ OK | Input/output compatíveis |
| `trpc.content.generateHashtags` | ✅ OK | Input/output compatíveis |
| `trpc.content.analyzeSentiment` | ✅ OK | Input/output compatíveis |
| `trpc.content.generateProductDescription` | ✅ OK | Input/output compatíveis |
| `trpc.content.generateEmailSequence` | ✅ OK | Procedure existe (não usada no frontend) |

### 3.2 MMN Router

| Procedure | Status | Observação |
|-----------|--------|------------|
| `trpc.mmn.getProfile` | ✅ OK | Corrigido anteriormente |
| `trpc.mmn.getStats` | ✅ OK | Input/output compatíveis |
| `trpc.mmn.getDirectReferrals` | ✅ OK | Input/output compatíveis |
| `trpc.mmn.getNetworkTree` | ✅ OK | Input/output compatíveis |
| `trpc.mmn.getRecentOrders` | ✅ OK | Input/output compatíveis |
| `trpc.mmn.getTrendingProducts` | ✅ OK | Procedure existe no appRouter |
| `trpc.mmn.getUpgrades` | ✅ OK | Input/output compatíveis |

### 3.3 Dashboard e Sistema

| Procedure | Status | Observação |
|-----------|--------|------------|
| `trpc.system.health` | ✅ OK | Verificado |
| `trpc.system.info` | ✅ OK | Verificado |
| `trpc.auth.me` | ✅ OK | Verificado |
| `trpc.bootstrap.status` | ✅ OK | Verificado |

---

## 4. Resumo das Correções Necessárias

| Prioridade | Arquivo | Problema | Ação |
|------------|---------|----------|------|
| 🔴 CRÍTICA | `TrendingProducts.tsx` | Input params errados | Alterar query para `{ days: 7, limit: 20 }` |
| 🔴 CRÍTICA | `TrendingProducts.tsx` | Campos inexistentes na resposta | Mapear `productName` → `title`, remover `url`, `trendingScore`, etc. |
| 🟡 MÉDIA | `TrendingProducts.tsx` | Falta `url` no produto | Remover referências a `product.url` ou implementar endpoint |
| 🟡 MÉDIA | `ContentGeneration.tsx` | Mutation `generateImage` não existe | Adicionar procedure no backend OU remover feature do frontend |
| 🟢 BAIXA | N/A | Nomes de marketplace diferentes | Documentar diferença, implementar mapeamento se necessário |

---

## 5. Métricas da Varredura

| Métrica | Valor |
|---------|-------|
| Total de arquivos de página analisados | 8 |
| Total de queries/mutations verificadas | 25+ |
| Inconsistências críticas identificadas | 2 |
| Inconsistências de mapeamento identificadas | 2 |
| Endpoints OK verificados | 15+ |
| Taxa de consistência | ~70% |

---

## 6. Recomendações de longo prazo

### 6.1 Validação de Tipo em Build

Adicionar script de validação que verifica:
- Todas as procedures tRPC usadas no frontend existem no backend
- Os campos de input/output são compatíveis

### 6.2 Contrato de API

Criar um contrato formal (OpenAPI/GraphQL schema) que documente:
- Todos os endpoints disponíveis
- Parâmetros de entrada
- Estrutura da resposta
- Tipos de dados esperados

### 6.3 Testes de Integração

Implementar testes E2E que validem a comunicação frontend-backend antes de deploy.

---

*Relatório gerado em 2026-05-19 por varredura sistemática automatizada*