# Especificação Técnica - Fase 8: Dropshipping Automatizado

## Visão Geral

A **Fase 8** implementa o backend de dropshipping automatizado para a plataforma MMN_AI-to-AI, permitindo que afiliados vendam produtos de marketplaces (Shopee, Mercado Livre, etc.) com gestão automatizada de pedidos, comissões e notificações.

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Runtime | Node.js | 20.x |
| Linguagem | TypeScript | 5.x |
| ORM | Drizzle ORM | Latest |
| Database | PostgreSQL | 15+ |
| Testes | Vitest | 1.x |
| API | REST (Express-compatible) | - |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Express)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ dropshippingRoutes│  │  (futuro) orders  │                │
│  │                   │  │                   │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                          │
│           └──────────┬──────────┘                          │
│                      │                                     │
│  ┌───────────────────┴────────────────────────────┐       │
│  │           DropshippingService                   │       │
│  │  - registerDropshippingOrder()                 │       │
│  │  - updateDropshippingOrderStatus()             │       │
│  │  - calculateConsumptionCommission()            │       │
│  └───────────────────┬────────────────────────────┘       │
│                      │                                     │
│  ┌───────────────────┴────────────────────────────┐       │
│  │              Database Layer (Drizzle)           │       │
│  │  orders │ products │ affiliates │ commissions    │       │
│  └───────────────────┬────────────────────────────┘       │
│                      │                                     │
└──────────────────────┴────────────────────────────────────┘
```

## Endpoints da API

### Registrar Pedido

```
POST /dropshipping/orders
```

**Request Body:**
```json
{
  "affiliateId": 1,
  "productId": 10,
  "externalOrderId": "SHOPEE-123456",
  "marketplace": "shopee",
  "customerName": "João Silva",
  "customerEmail": "joao@email.com",
  "shippingAddress": "Rua Teste, 123 - São Paulo, SP",
  "amount": 5990
}
```

**Response (201):**
```json
{
  "success": true,
  "orderId": 1,
  "commissionAmount": 599,
  "message": "Pedido registrado com sucesso"
}
```

### Atualizar Status do Pedido

```
PATCH /dropshipping/orders/:orderId/status
```

**Request Body:**
```json
{
  "status": "delivered"
}
```

**Status válidos:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "orderId": 1,
  "commissionCalculated": 599,
  "message": "Status atualizado para delivered"
}
```

### Buscar Pedido

```
GET /dropshipping/orders/:orderId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "affiliateId": 1,
    "productId": 10,
    "externalOrderId": "SHOPEE-123456",
    "marketplace": "shopee",
    "amount": 5990,
    "commissionAmount": 599,
    "status": "delivered",
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "shippingAddress": "Rua Teste, 123 - São Paulo, SP",
    "createdAt": "2026-05-25T21:00:00Z",
    "updatedAt": "2026-05-25T21:30:00Z"
  }
}
```

### Listar Pedidos do Afiliado

```
GET /dropshipping/affiliates/:affiliateId/orders?limit=50
```

### Listar Todos os Pedidos (Admin)

```
GET /dropshipping/orders?limit=100
```

### Calcular Comissão

```
POST /dropshipping/orders/:orderId/calculate-commission
```

## Modelo de Dados

### Tabela: orders ( existente no schema-final.ts )

```typescript
orders = {
  id: serial,
  affiliateId: integer,        // FK -> affiliates
  productId: integer,          // FK -> products
  externalOrderId: varchar,    // ID do marketplace
  marketplace: varchar,         // shopee, mercadolivre, etc.
  amount: integer,             // Valor em centavos
  commissionAmount: integer,   // Comissão calculada
  status: varchar,             // pending|processing|shipped|delivered|cancelled
  customerName: varchar,
  customerEmail: varchar,
  shippingAddress: text,       // Endereço de entrega
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Tabela: commissions ( existente no schema-final.ts )

```typescript
commissions = {
  id: serial,
  affiliateId: integer,
  amount: integer,
  level: integer,              // 1 = venda direta
  source: varchar,             // 'dropshipping'
  sourceId: integer,           // orderId
  status: varchar,             // pending|confirmed|paid
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Fluxo de Negócio

### 1. Registro de Pedido

```
1. Validar afiliado existe
2. Validar produto existe
3. Calcular comissão (% do afiliado ou % do produto)
4. Criar pedido com status "pending"
5. Notificar fornecedor (placeholder)
6. Notificar cliente
7. Retornar orderId e commissionAmount
```

### 2. Atualização de Status

```
1. Validar pedido existe
2. Atualizar status
3. Se status = "delivered":
   - Calcular comissão de consumo
   - Registrar em commissions
   - Atualizar pendingCommissions do afiliado
4. Notificar cliente
5. Notificar afiliado
```

### 3. Cálculo de Comissão

```
1. Buscar pedido e afiliado
2. Buscar percentual em affiliate.commissionPercentage
   ou fallback para product.commissionPercentage
3. commissionAmount = amount * (percentage / 100)
4. Registrar em commissions com status "pending"
5. Atualizar affiliates.pendingCommissions
```

## Pendências Identificadas (Análise Prévia)

### 1. Inconsistência no Schema

A migration SQL `0001_large_rumiko_fujikawa.sql` não incluía a coluna `shippingAddress` na tabela `orders`. O `schema-final.ts` já inclui esta coluna, então a correção foi validada.

### 2. Placeholder de Notificação ao Fornecedor

O `notifySupplier()` usa `userId: 1` como placeholder. Em produção, implementar lógica para identificar fornecedor correto baseado no `productId`.

### 3. Configuração de Ambiente

O arquivo `db.ts` tinha inconsistências de importação. O código atual utiliza `process.env.DATABASE_URL` corretamente.

## Status de Implementação

| Componente | Status | Descrição |
|------------|--------|-----------|
| DropshippingService | ✅ Completo | registerDropshippingOrder, updateDropshippingOrderStatus |
| calculateConsumptionCommission | ✅ Completo | Cálculo de comissão na entrega |
| Routes API | ✅ Completo | CRUD completo de pedidos |
| Testes Unitários | ✅ Completo | Cobertura de fluxos principais |
| Migration SQL | ⚠️ Pendente | Executar migration para adicionar shippingAddress |
| Notificações Reais | ⚠️ Pendente | Implementar envio de email real |
| Integração Marketplace | 📋 Planejado | Webhooks para marketplaces |

## Próximos Passos

1. ✅ Implementar serviço e rotas
2. ✅ Criar testes unitários
3. ⚠️ Executar migration SQL (shippingAddress)
4. 📋 Implementar notificações por email
5. 📋 Adicionar webhooks de marketplaces
6. 📋 Implementar retry logic para falhas

---

**Versão**: 1.0.0
**Data**: 2026-05-25
**Autor**: Nexus-HUB57 / MiniMax Agent