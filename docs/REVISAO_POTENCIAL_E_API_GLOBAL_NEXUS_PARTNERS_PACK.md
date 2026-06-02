# Nexus Partners Pack — Revisão de Potencial Real & Proposta de **API Global**

**Versão:** 1.0
**Data:** 2026-06-02
**Commit base:** `da79436`
**Escopo:** Mapeamento técnico do sistema atual, avaliação do potencial real do produto e proposta de implementação de uma **API Global** (Public Open API) para sincronização com plataformas e serviços externos.

---

## 1. Sumário Executivo

O Nexus Partners Pack já é, hoje, um SaaS **operacional, monetizado e em produção** (oneverso.com.br), com três planos publicados (Start R$ 100/mês, Growth R$ 250/mês, Enterprise sob consulta), matriz de comissão por prazo (5%–15% / 6–48 meses), checkout PIX integrado (Mercado Pago + OpenPix) e webhooks de cobrança ativos.

Internamente, o sistema possui **fundações de plataforma de integração já construídas** que normalmente exigem 6–12 meses de engenharia adicional em SaaS comparáveis:

- ✅ **Event Bus de domínio** (`_core/events/eventBus.ts`) com 30+ tipos de eventos, prioridade, replay e auditoria.
- ✅ **Webhook Service** (`domains/webhooks/webhookService.ts`, 513 linhas) com **HMAC SHA-256, Circuit Breaker (CLOSED/OPEN/HALF_OPEN), retry exponencial** e fila de pendentes.
- ✅ **Tenant API Keys** (`domains/whitelabel/schema.ts` → tabela `tenant_api_keys`) — base multi-tenant para autenticação de API pública já existe.
- ✅ **Webhook Router Skill** já roteia eventos de **Hotmart / Shopee / Mercado Livre / Stripe** para skills agentic.
- ✅ **18 skills agentic** (Copywriter, Commission Calculator, Webhook Router, Lifecycle Orchestrator, etc.) prontas para serem expostas como capabilities de API.
- ✅ **45+ tRPC routers** cobrindo Subscriptions, Commissions, Partners, Marketplace, Billing, PIX, XP, Agent Runtime.

**Conclusão:** o sistema está a **uma camada de exposição (Gateway + DX)** de se tornar uma plataforma de integração tipo "Stripe / Hotmart para programas de parceria com IA". O potencial real é a transição de **SaaS vertical (assinatura de parceiros)** para **PaaS horizontal (API de Commission-as-a-Service + Agentic Skills-as-a-Service)**.

---

## 2. Mapeamento do Sistema Atual

### 2.1. Domínios de Negócio (`backend/src/domains/`)

| Domínio | Função | Maturidade |
|---|---|---|
| `subscriptions` | Catálogo Start/Growth/Enterprise, ciclo de vida, billingWebhook | 🟢 Produção |
| `commissions` | Cálculo, listagem, stats, snapshots, pending | 🟢 Produção |
| `partners` | Tiers (silver→diamond), referrals, métricas, growth algorithms | 🟢 Produção |
| `affiliate` | Eventos de afiliação, hierarquia MMN | 🟢 Produção |
| `marketplace` | Conta multi-marketplace (Hotmart, Shopee, ML) | 🟡 Beta |
| `billing` | Faturas, métricas | 🟢 Produção |
| `webhooks` | Service genérico com HMAC + Circuit Breaker | 🟢 Pronto |
| `whitelabel` | Multi-tenant + `tenant_api_keys` | 🟡 Beta (não exposto publicamente) |
| `agent-runtime` | Execução de skills, sessões | 🟢 Produção |
| `xp`, `notifications`, `analytics`, `reports`, `cron`, `generativeAI`, `auth` | Suporte transversal | 🟢 Produção |

### 2.2. Skills Agentic Disponíveis (`backend/src/agentic/skills/`)

Total: **18 handlers operacionais** + 2 avançados (`upsellStrategist`, `webinarEngine`) — **~7.757 linhas** de código de skills.

Skills comercialmente expostáveis via API:
- `commission-calculator` — recálculo de comissões em tempo real
- `webhook-router` — roteamento normalizado de eventos externos
- `lifecycle-orchestrator` — automação de jornadas de parceiro
- `copywriter`, `content-translator`, `auto-publisher` — geração de conteúdo
- `trend-detector`, `analytics-reporter`, `audience-segmenter` — analítica preditiva
- `pricing-optimizer`, `objection-handler`, `ab-test-designer` — otimização comercial
- `lead-enricher`, `creator-matcher` — prospecção e matchmaking
- `judge-revisor` — revisão de qualidade com LLM (GPT-4.1-mini + fallback heurístico)

### 2.3. Integrações Externas Já Implementadas

| Plataforma | Status | Recursos |
|---|---|---|
| **Mercado Pago** | 🟢 Produção | Checkout, PIX, Webhook de invoice |
| **OpenPix** | 🟢 Produção | Cobranças PIX dinâmicas, status |
| **Hotmart** | 🟡 Código pronto, credenciais pendentes | OAuth, produtos, comissões |
| **Mercado Livre** | 🟡 Código pronto | Autenticação, produtos |
| **Shopee** | 🟡 Código pronto | Cálculo de comissões |
| **Stripe** | 🟡 Roteamento via webhook-router skill | Eventos mapeados |
| **OpenAI / Anthropic / Gemini** | 🟢 Produção | LLM Router multi-provider |
| **Ollama** | 🟢 Pronto | LLM local com failover |
| **LangChain** | 🟢 Pronto | Adapters (chains, tools, retrievers, memory) |
| **Docling** | 🟡 Planejado | Ingestão de PDF/DOCX para RAG |

### 2.4. Camada de Infraestrutura

- **Event Bus** com 30+ `DomainEventType` cobrindo Affiliate, Commission, Agent, Marketplace, XP, Billing, Career, Partner, System, Governance.
- **Circuit Breaker Middleware** (`_core/circuitBreakerMiddleware.ts`) protegendo chamadas externas.
- **RBAC Service** (`_core/rbacService.ts`) com roles e permissões.
- **Cron Dispatcher** baseado em BullMQ (`services/cronDispatcher.ts`).
- **tRPC v11** como camada de API interna, build em ~96ms, bundle backend ~1.1MB.

---

## 3. Potencial Real Identificado

### 3.1. Pontos Fortes Estratégicos

1. **Stack de comissões pronto-para-vender-como-serviço.** O `commission-calculator` + matriz de termos (6–48m) + ledger de eventos resolve um problema que **Hotmart, Kiwify, Eduzz cobram caro** internamente e que **plataformas SaaS B2B (RDStation, ActiveCampaign) não oferecem**.

2. **IA como diferenciador real.** As 18 skills agentic não são marketing — são handlers funcionais com integração LLM. Isso permite posicionar a API como **"Commission Engine + Agentic AI Layer"**, não apenas billing.

3. **Schemas Drizzle bem normalizados** (`subscriptions`, `subscription_events`, `partners`, `partner_metrics`, `partner_volume_history`, `growth_algorithms`, `algorithm_executions`). Pronto para multi-tenant.

4. **Infraestrutura de webhooks robusta.** Já tem HMAC, retry, circuit breaker — supera 80% dos SaaS brasileiros.

5. **Custo marginal baixo para expandir.** O event bus já dispara eventos em todas as operações; basta plugar um publisher externo.

### 3.2. Gaps Críticos para o Próximo Salto

| Gap | Impacto | Esforço |
|---|---|---|
| **Ausência de API pública versionada** (`/api/v1/...`) | Bloqueia integração com 3rd parties | Médio |
| **API Keys não expostas no frontend para clientes** | Tenants não conseguem se autointegrar | Baixo |
| **Sem documentação OpenAPI/Swagger** | DX ruim, vendas técnicas difíceis | Médio |
| **Sem SDKs (JS/Python)** | Onboarding lento para desenvolvedores externos | Médio-Alto |
| **Rate limiting por API key não implementado** | Risco de abuso | Baixo |
| **Sandbox/test mode** ausente | Clientes não testam antes de produção | Médio |
| **Webhook delivery não exposto ao cliente** (logs, retry manual) | Suporte caro | Médio |

### 3.3. Mercado-Alvo Realista

- **Infoprodutores em escala** (>R$ 500k/mês) que terceirizam programas de afiliados.
- **Plataformas de creators** (B2B2C) que querem oferecer comissionamento sem construir do zero.
- **Agências de marketing** que gerenciam programas de parceria para múltiplos clientes.
- **Marketplaces verticais** (educação, saúde, fintech) que precisam de uma camada de comissão auditável.

---

## 4. Proposta: **Nexus Open API v1** (API Global)

### 4.1. Princípios de Design

1. **REST-first com tRPC retido internamente.** Expor um gateway REST (`/api/v1/*`) que internamente chama os routers tRPC já existentes — zero duplicação de lógica.
2. **API Key + HMAC** para autenticação (modelo Stripe/Twilio). Reutiliza `tenant_api_keys`.
3. **Versionamento por URL** (`/api/v1`, `/api/v2`) + deprecation headers.
4. **Idempotency-Key** obrigatório em mutations (modelo Stripe).
5. **Webhooks bidirecionais**: Nexus → cliente (já existe) e cliente → Nexus (já existe via webhook-router skill).
6. **OpenAPI 3.1 spec** gerado a partir dos schemas Zod (via `trpc-openapi`).
7. **Sandbox vs Production** via prefixo de chave (`nxs_test_...` vs `nxs_live_...`).

### 4.2. Superfície de API Proposta (MVP)

#### 4.2.1. Subscriptions
```
POST   /api/v1/subscriptions                 # Criar assinatura
GET    /api/v1/subscriptions/:id             # Detalhe
POST   /api/v1/subscriptions/:id/cancel      # Cancelar
POST   /api/v1/subscriptions/:id/change-plan # Upgrade/Downgrade
GET    /api/v1/subscriptions                 # Listar (paginado)
GET    /api/v1/catalog/plans                 # Catálogo público
```

#### 4.2.2. Commissions
```
POST   /api/v1/commissions/calculate         # Cálculo on-demand (skill exposed)
GET    /api/v1/commissions                   # Listar
GET    /api/v1/commissions/stats             # Snapshot agregado
POST   /api/v1/commissions/:id/confirm       # Confirmar
POST   /api/v1/commissions/:id/pay           # Marcar como paga
```

#### 4.2.3. Partners
```
POST   /api/v1/partners                      # Registrar parceiro
GET    /api/v1/partners/:id                  # Detalhe + tier + métricas
POST   /api/v1/partners/:id/promote          # Promover tier
GET    /api/v1/partners/:id/referrals        # Rede de indicações
```

#### 4.2.4. Agentic Skills (diferencial competitivo)
```
POST   /api/v1/skills/:skillId/invoke        # Executar skill (genérico)
POST   /api/v1/skills/copywriter             # Atalhos por skill
POST   /api/v1/skills/pricing-optimizer
POST   /api/v1/skills/lead-enricher
GET    /api/v1/skills                        # Catálogo de skills disponíveis
```

#### 4.2.5. Webhooks (cliente → Nexus)
```
POST   /api/v1/webhooks/hotmart              # Já existe internamente
POST   /api/v1/webhooks/shopee
POST   /api/v1/webhooks/mercadolivre
POST   /api/v1/webhooks/stripe
POST   /api/v1/webhooks/custom               # Webhook router genérico
```

#### 4.2.6. Webhooks (Nexus → cliente)
```
POST   /api/v1/webhook-endpoints             # Registrar endpoint
GET    /api/v1/webhook-endpoints             # Listar
DELETE /api/v1/webhook-endpoints/:id
GET    /api/v1/webhook-deliveries            # Histórico de entregas + retry
POST   /api/v1/webhook-deliveries/:id/retry
```

Eventos emitidos (reutilizam `DomainEventType`):
- `subscription.created`, `subscription.activated`, `subscription.renewed`, `subscription.cancelled`, `subscription.past_due`
- `commission.generated`, `commission.approved`, `commission.paid`
- `partner.registered`, `partner.tier_promoted`
- `invoice.paid`, `payment.failed`
- `agent.skill_completed`

### 4.3. Autenticação

```http
GET /api/v1/subscriptions HTTP/1.1
Host: api.oneverso.com.br
Authorization: Bearer nxs_live_a1b2c3d4...
Idempotency-Key: uuid-v4-string
X-Nexus-Signature: t=1717286400,v1=hmac_sha256(...)
```

- **Bearer token** validado via `tenantService.validateApiKey()` (já implementado).
- **Idempotency** armazenada em Redis com TTL de 24h.
- **HMAC** opcional em mutations sensíveis (saques, payouts).

### 4.4. Rate Limiting & Quotas

| Plano | Requests/min | Webhook deliveries/dia | Skills/mês |
|---|---|---|---|
| Start | 60 | 1.000 | 500 |
| Growth | 300 | 10.000 | 5.000 |
| Enterprise | Custom (10k+) | Ilimitado contratual | Ilimitado |

Implementação: middleware `_core/rateLimiter.ts` (a criar) usando Redis sliding window.

### 4.5. Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cliente Externo (3rd party)                       │
│       SDK JS / SDK Python / cURL / Postman / Zapier / n8n           │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTPS + API Key + HMAC
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Nexus Open API Gateway  (Express)                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Middleware: auth(apiKey) → rateLimit → idempotency → audit    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                       │                                              │
│                       ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │   Adapter Layer: REST → tRPC Caller (zero duplicação)          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│   tRPC Routers (já existentes): subscriptions, commissions,         │
│   partners, marketplace, skills, billing, agents...                 │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│   Event Bus (já existente)  ──►  Webhook Service (HMAC + CB)        │
│                                            │                         │
│                                            ▼                         │
│                              Outbound deliveries → endpoints clientes│
└─────────────────────────────────────────────────────────────────────┘
```

### 4.6. Roadmap de Implementação (8 semanas)

| Sprint | Entregas | Esforço |
|---|---|---|
| **S1** | Gateway REST básico + auth via `tenant_api_keys` + 3 endpoints (catálogo, criar sub, listar sub) | 1 sem |
| **S2** | Idempotency-Key + rate limiting Redis + audit log | 1 sem |
| **S3** | Cobertura completa de Subscriptions + Commissions + Partners | 2 sem |
| **S4** | Skills-as-a-Service (5 skills prioritárias expostas) | 1 sem |
| **S5** | Webhook endpoints CRUD + dashboard de deliveries | 1 sem |
| **S6** | OpenAPI 3.1 spec + portal de docs (Stoplight/Redoc) | 1 sem |
| **S7** | SDK JS (npm `@nexus/sdk`) + SDK Python | 1 sem |
| **S8** | Sandbox mode + smoke tests E2E + soft-launch beta | 1 sem |

### 4.7. Métricas de Sucesso

- **API uptime ≥ 99.9%** (já alcançado para o backend interno).
- **Latência p95 < 250ms** para reads, < 800ms para writes.
- **Webhook delivery rate ≥ 99.5%** (já robusto via Circuit Breaker).
- **Tempo de onboarding técnico (signup → primeira chamada)** < 10 min.
- **Adoção:** 20 tenants ativos em 90 dias pós-launch.

### 4.8. Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| Acoplamento de routers tRPC à camada de auth de sessão | Criar `createApiContext()` que injeta `tenantId` no contexto, paralelo à sessão de usuário |
| Breaking changes em schemas Zod quebram clientes externos | Versionar via `/v1`, gerar spec OpenAPI a cada release, semver |
| Abuso de skills caras (LLM) | Quota de skills/mês + cobrança usage-based em Enterprise |
| Vazamento de API key | Hash em DB (bcrypt) + rotation + scopes granulares |
| PCI/LGPD em payouts | Já tratado via Mercado Pago/OpenPix (não armazenamos cartão) |

---

## 5. Monetização da API Global

### 5.1. Modelos Recomendados

1. **Incluso nos planos atuais** (Start = 500 calls/mês, Growth = 5k, Enterprise = ilimitado).
2. **Add-on usage-based:** R$ 0,002 por chamada acima da cota + R$ 0,05 por execução de skill.
3. **Plano API-only** (sem dashboard): R$ 49/mês com 1k calls — captura mercado dev-first.
4. **White-label / reseller:** Enterprise + 15% override no faturamento dos sub-tenants.

### 5.2. Projeção de Receita Adicional (Cenário Conservador, 12 meses)

| Item | Volume | Receita |
|---|---|---|
| 50 tenants API-only @ R$ 49/mês | 600 sub-anos | R$ 29.400 |
| 30 upgrades Start → Growth motivados por API | 360 sub-anos | R$ 86.400 |
| 5 contratos Enterprise white-label | 5 contratos | R$ 150.000+ |
| Usage-based overage (média R$ 80/tenant) | 50 tenants | R$ 48.000 |
| **Total incremental ano 1** | | **~R$ 313.800** |

---

## 6. Próximos Passos Imediatos

1. ✅ **Aprovação estratégica** desta proposta pelo time de produto.
2. ⏭️ **Criar branch** `feature/open-api-v1`.
3. ⏭️ **Sprint 1:** scaffold do gateway REST + reaproveitar `tenantService.validateApiKey()`.
4. ⏭️ **Documentar** convenções (Idempotency-Key, paginação cursor-based, erro RFC 7807).
5. ⏭️ **Definir** 3 design partners (clientes Enterprise atuais) para beta fechado.

---

## 7. Conclusão

O Nexus Partners Pack tem **mais infraestrutura de plataforma do que aparenta** — event bus, webhooks robustos, multi-tenant key store, 18 skills agentic e integrações Hotmart/ML/Shopee já implementadas. O salto de **SaaS de assinatura → Plataforma de API Global** é predominantemente um trabalho de **exposição e DX (developer experience)**, não de reengenharia.

Com ~8 semanas de execução focada, é viável transformar o produto em **"Stripe + Hotmart + Zapier para programas de parceria com IA"**, abrindo um vetor de receita incremental projetado em **R$ 300k+ no ano 1** e posicionando estrategicamente para uma rodada de captação ou parceria white-label com plataformas educacionais e marketplaces verticais.

---

**Documento gerado em:** 2026-06-02
**Commit base:** `da79436`
**Próxima revisão programada:** após Sprint 2 do roadmap (semana 2)
