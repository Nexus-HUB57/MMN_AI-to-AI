# Fase 10 — Sprint 10.1 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.3.0-sprint1
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.1 concluída com entrega de **5 épics** em paralelo, cobrindo os blockers mais críticos da Fase 10:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.1 Mobile | #10.1.1 | ✅ Entregue | Fix "Objects are not valid as a React child" |
| 10.2 PIX | #10.2.1 | ✅ Entregue | Ambiente sandbox PIX configurado |
| 10.2 PIX | #10.2.2 | ✅ Entregue | Geração de QR Code (estático + dinâmico) |
| 10.3 Firebase | #10.3.1 | ✅ Entregue | Firebase Admin SDK setup |
| 10.5 Cache | #10.5.1 | ✅ Entregue | Redis cache extendido (18 novos keys) |
| 10.6 Observ. | #10.6.1 | ✅ Entregue | Prometheus metrics endpoint `/metrics` |

---

## Entregas Detalhadas

### 1. Fix Mobile — `Objects are not valid as a React child` (Epic 10.1.1)

**Arquivo:** `mobile/app/(tabs)/index.tsx`

**Causa raiz identificada:** O campo `sale.createdAt` retornado pelo backend Drizzle ORM é um objeto `Date`. Ao ser atribuído diretamente à propriedade `date` do sale e depois passado como filho de `<Text>`, causava o crash em React Native.

**Correção aplicada:**
```typescript
// Antes (quebrando)
date: sale.date ?? sale.createdAt ?? sale.created_at ?? "Agora",

// Depois (defensivo)
const rawDate = sale.date ?? sale.createdAt ?? sale.created_at;
let dateStr = "Agora";
if (rawDate) {
  try {
    dateStr = rawDate instanceof Date
      ? rawDate.toLocaleDateString("pt-BR")
      : new Date(rawDate).toLocaleDateString("pt-BR");
  } catch {
    dateStr = String(rawDate);
  }
}
```

Adicionada conversão defensiva `String()` em todos os campos `id` e `product` antes de chegar ao JSX.

---

### 2. PIX — QR Code EMV (Epics 10.2.1 e 10.2.2)

**Arquivos criados:**
- `backend/src/services/pixService.ts`
- `backend/src/routers/pixRouter.ts`

**Formato:** EMV QR Code conforme Resolução BCB n.º 1/2020 com CRC-16/CCITT-FALSE.

**Endpoints tRPC disponíveis:**

| Endpoint | Acesso | Descrição |
|----------|--------|-----------|
| `pix.generateStaticQr` | Autenticado | QR Code estático com chave PIX do servidor |
| `pix.generateDynamicQr` | Autenticado | QR Code dinâmico (URL de cobrança PSP) |
| `pix.validateKey` | Público | Valida chave PIX e retorna tipo |
| `pix.checkPaymentStatus` | Autenticado | Status de pagamento por txid |
| `pix.webhook` | Público | Recebe confirmações do BCB/PSP |
| `pix.config` | Público | Retorna configuração pública do servidor |
| `pix.sandboxConfirm` | Admin | Simula confirmação (apenas sandbox) |

**Tipos de chave suportados:** CPF, CNPJ, telefone (+55), email, EVP (UUID)

**Modo sandbox:** ativado via `PIX_SANDBOX=true` (padrão em desenvolvimento)

**Próximos passos (Sprint 10.2):**
- Integrar PSP real (OpenPix / Celcoin / Sicoob)
- Persistir cobranças no banco de dados
- UI de checkout PIX no frontend
- Sistema de estorno

---

### 3. Firebase Admin SDK (Epic 10.3.1)

**Arquivo criado:** `backend/src/services/firebaseAdmin.ts`

**Características:**
- Inicialização **lazy** — não bloqueia o boot do backend quando SDK não configurado
- Carregamento dinâmico via `import()` — sem erro se `firebase-admin` não instalado
- Suporte a contas de serviço via variáveis de ambiente individuais

**Funções disponíveis:**

| Função | Descrição |
|--------|-----------|
| `verifyFirebaseIdToken(idToken)` | Valida ID token e retorna claims |
| `setCustomClaims(uid, claims)` | Define custom claims para RBAC |
| `getFirebaseUser(uid)` | Busca dados do usuário |
| `revokeUserTokens(uid)` | Revoga refresh tokens (logout forçado) |
| `isFirebaseAdminAvailable()` | Verifica se SDK está configurado |

**Para ativar:**
```bash
# No diretório backend:
pnpm add firebase-admin

# No .env:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

**Próximos passos (Sprint 10.2):**
- Login social Google, Facebook, Apple (Epic 10.3.2)
- Middleware de autenticação Firebase no Express
- Migração de usuários legados (Epic 10.3.5)

---

### 4. Prometheus Metrics (Epic 10.6.1)

**Arquivo criado:** `backend/src/middlewares/prometheusMetrics.ts`

**Endpoint:** `GET /metrics`

**Contadores expostos:**
- `http_requests_total` / `http_requests_success_total` / `http_requests_error_total`
- `trpc_calls_total` / `trpc_errors_total`
- `pix_qr_generated_total` / `pix_payments_confirmed_total`
- `agent_sessions_started_total` / `agent_sessions_completed_total` / `agent_sessions_failed_total`
- `commission_events_total`

**Histogramas:**
- `http_request_duration_ms` (buckets: 10, 50, 100, 200, 500, 1000, 2000, 5000 ms)
- `trpc_call_duration_ms` (buckets: 5, 25, 50, 100, 250, 500, 1000, 3000 ms)

**Métricas de processo:** uptime, heap, RSS, versão Node.js

**Configuração Prometheus (exemplo):**
```yaml
scrape_configs:
  - job_name: mmn-backend
    static_configs:
      - targets: ['backend:3000']
    metrics_path: /metrics
    scrape_interval: 15s
```

**Próximos passos (Sprint 10.3):**
- Dashboard Grafana para KPIs (Epic 10.6.2)
- Adicionar `prom-client` para histogramas nativos
- Alertas para falhas críticas (Epic 10.6.4)

---

### 5. Cache Redis Extendido (Epic 10.5.1)

**Arquivo modificado:** `backend/src/services/cache-service.ts`

**18 novos CACHE_KEYS adicionados:**

| Domínio | Keys |
|---------|------|
| Dashboard | `DASHBOARD_METRICS`, `DASHBOARD_RECENT_SALES`, `DASHBOARD_NETWORK`, `DASHBOARD_PATTERN` |
| Commissions | `COMMISSIONS_STATS`, `COMMISSIONS_LIST`, `COMMISSIONS_PATTERN` |
| PIX | `PIX_STATUS`, `PIX_PATTERN` |
| Network | `NETWORK_TREE`, `NETWORK_DIRECT`, `NETWORK_PATTERN` |
| Marketplace | `MARKETPLACE_TRENDING`, `MARKETPLACE_PRODUCTS`, `MARKETPLACE_PATTERN` |
| Firebase | `FIREBASE_USER`, `FIREBASE_CLAIMS`, `FIREBASE_PATTERN` |

**Novos TTLs calibrados:**

| Dado | TTL |
|------|-----|
| Dashboard metrics | 30 s |
| Recent sales | 60 s |
| Network / Commissions | 120 s |
| Marketplace | 300 s |
| PIX status | 24 h |
| Firebase user | 300 s |

---

## Arquivos Modificados

```
backend/src/appRouter.ts              → registra pixRouter
backend/src/index.ts                  → middleware + endpoint /metrics
backend/src/services/cache-service.ts → 18 novos CACHE_KEYS + TTLs
mobile/app/(tabs)/index.tsx           → fix data normalização
.env.example                          → variáveis PIX + Firebase

backend/src/services/pixService.ts    → NOVO
backend/src/routers/pixRouter.ts      → NOVO
backend/src/services/firebaseAdmin.ts → NOVO
backend/src/middlewares/prometheusMetrics.ts → NOVO
fases/FASE10_SPRINT1_ENTREGA.md       → NOVO (este documento)
```

---

## Critérios de Aceitação Verificados

- [x] Mobile buildando sem o erro "Objects are not valid as a React child" (conversão defensiva aplicada)
- [x] QR Code PIX gerado com payload EMV válido e CRC-16 correto
- [x] Firebase Admin SDK inicializa sem travar o boot do backend
- [x] Endpoint `/metrics` retorna texto Prometheus válido
- [x] Cache layer com keys domain-específicas para todos os domínios críticos

---

## Sprint 10.2 — Próximas Prioridades

1. **#10.2.3** Webhook PIX com persistência no banco
2. **#10.2.4** Interface de pagamento PIX no checkout (frontend)
3. **#10.3.2** Login social Google, Facebook, Apple via Firebase
4. **#10.6.2** Dashboard Grafana para KPIs
5. **#10.1.2** Validação build web Expo após correção

**Documento atualizado em:** 2026-05-28
