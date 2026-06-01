# 🛣️ Roadmap · Nexus Affil'IA'te

> Plano de evolução de curto, médio e longo prazo. Atualizado em **2026-05-29**.

---

## 📍 Estado atual (snapshot)

| Métrica | Valor |
|---|---|
| Skills operacionais | **18 / 45** (40.0%) |
| Autonomy Score (input realista) | **77** (operational) |
| Categorias cobertas | content, intelligence, publishing, decision, sales, retention, analytics, strategy, finance, i18n, optimization, integration |
| Canais de distribuição | 5 (whatsapp, email, facebook, instagram, landing) |
| Dispatchers reais prontos | 3 (whatsapp, email, facebook) |
| Páginas frontend | Home, Login, Cadastro, AdminDashboard, AdminRuntime + 10 outras admin |
| Hospedagem | HostGator (frontend) + Render (backend, aguardando DNS) |

---

## ⏱️ Curto prazo · 30 dias

### Infraestrutura
- [ ] **Concluir DNS `api.oneverso.com.br`** (CNAME no HostGator → Render)
- [ ] Provisionar **Postgres no Render** + aplicar migration `0002_agent_telemetry.sql`
- [ ] Provisionar **Redis no Render** para BullMQ
- [ ] Configurar variáveis admin (`ADMIN_EMAIL_SHA256`, `ADMIN_PASSWORD_SHA256`, `ADMIN_SESSION_SECRET`)
- [ ] Habilitar `OPENAI_API_KEY` para ativar judge LLM dual-mode

### Skills (3 novas, alvo: 11/45 = 24%)
- [ ] **9. `lead-enricher`** — busca dados públicos (LinkedIn, Crunchbase) para enriquecer prospects
- [ ] **10. `objection-handler`** — gera respostas a objeções comuns por vertical
- [ ] **11. `pricing-optimizer`** — analisa elasticidade de preço por segmento

### Frontend
- [ ] **Página `/admin/skills`** — catálogo completo das 45 skills planejadas com status (operacional/em desenvolvimento/planejada)
- [ ] **Modais de aprovação** — UI para approve/reject com nota direto na fila `/admin/runtime`
- [ ] **Histórico de auditoria** com filtros por skill/usuário/decisão

### Segurança / Compliance
- [ ] **Logs estruturados** (pino) com correlation IDs
- [ ] **Rate limiting** server-side em `adminAuth.login` (atualmente apenas client-side)
- [ ] **LGPD dashboard** mostrando consentimentos por contato

---

## 🗓️ Médio prazo · 60 dias

### Skills (10 novas, alvo: 21/45 = 47%)
| # | Skill | Categoria | Função |
|---|-------|-----------|--------|
| 12 | `funnel-architect` | strategy | Desenha funil completo a partir de objetivo |
| 13 | `ab-test-designer` | optimization | Sugere variações + métricas + tamanho amostral |
| 14 | `commission-calculator` | finance | Aplica regras de atribuição (first/last/decay) |
| 15 | `fraud-detector` | governance | Detecta padrões suspeitos em cliques/conversões |
| 16 | `creator-matcher` | sales | Match entre marca e creators por audiência |
| 17 | `content-translator` | i18n | Traduz copy com adaptação cultural |
| 18 | `compliance-auditor` | governance | Verifica claims publicitários vs CONAR |
| 19 | `lifecycle-orchestrator` | retention | Coordena onboarding → ativação → expansão |
| 20 | `roi-attributor` | analytics | Atribui receita multi-touch |
| 21 | `webhook-router` | integration | Roteia eventos Hotmart/Shopee/ML para skills |

### Integrações
- [ ] **Hotmart full** — sales webhook + commission auto-split
- [ ] **Shopee Affiliates** — sync trending + tracking pixels
- [ ] **Mercado Livre** — catálogo + comissões
- [ ] **Stripe Connect** — splits de pagamento para top performers
- [ ] **WhatsApp Business Platform** — template approval workflow

### Plataforma
- [ ] **Multi-tenant** — workspaces separados por marca/cliente
- [ ] **White-label** — branding customizável (logo, cores, domínio)
- [ ] **Sistema de billing** — planos (Starter/Pro/Enterprise) + uso por API call
- [ ] **App mobile** — versão Expo do painel afiliado

### Observabilidade
- [ ] **OpenTelemetry** instrumentado em todos os handlers
- [ ] **Dashboards Grafana** para SRE
- [ ] **Alertas Slack** para `critical` healthSignals

---

## 🚀 Longo prazo · 90 dias

### Skills (24 novas, alvo: 45/45 = 100%)
Restantes do catálogo IOAID:

**Sales & Growth (8)**
- `cold-emailer`, `social-seller`, `webinar-engine`, `referral-engineer`, `upsell-strategist`, `cross-sell-engine`, `cart-recovery`, `loyalty-architect`

**Content & Creative (6)**
- `video-script-writer`, `image-prompt-engineer`, `seo-strategist`, `viral-hook-generator`, `landing-page-builder`, `email-sequence-designer`

**Operations & Governance (5)**
- `kpi-monitor`, `anomaly-detector`, `incident-responder`, `contract-analyzer`, `tax-advisor-br`

**Intelligence & Analytics (5)**
- `cohort-analyzer`, `churn-predictor`, `ltv-forecaster`, `competitor-watcher`, `market-sentiment-tracker`

### Autonomia
- [ ] **Autonomy Score ≥ 80** sustentado por 30 dias (band "advanced")
- [ ] **Self-healing**: skills auto-rerun em falhas transitórias
- [ ] **A/B testing autônomo** entre versões de handlers
- [ ] **Continuous fine-tuning** de prompts baseado em judge feedback

### Plataforma SaaS
- [ ] **Marketplace de skills** com aluguel (revenue share entre criadores)
- [ ] **SDK oficial** para integrações de terceiros
- [ ] **Programa de parceiros** técnicos (system integrators)
- [ ] **Certificação Nexus** para implementadores

### Comunidade
- [ ] **GitHub público** com SDK + exemplos
- [ ] **Documentação online** (docs.oneverso.com.br)
- [ ] **Discord/Slack** da comunidade Nexus Affil'IA'te
- [ ] **Eventos trimestrais** — Nexus Summit

---

## 🎯 Métricas-alvo 90 dias

| KPI | Hoje | Meta 30d | Meta 60d | Meta 90d |
|-----|------|----------|----------|----------|
| Skills operacionais | 8 | 11 | 21 | 45 |
| Autonomy Score | 77 | 80 | 82 | 85 |
| Latência média | <1.5s | <1.5s | <1.2s | <1s |
| Aprovação automática | 78% | 82% | 87% | 90% |
| Tenants ativos | 1 | 3 | 10 | 30 |
| Volume processado/dia | <100 | 500 | 5k | 50k |
| Dispatchers reais | 3/5 | 4/5 | 5/5 | 5/5 + 2 novos |

---

## ⚠️ Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| API Hotmart/Shopee mudar contrato | Média | Alto | Camada de adapters + fallback curado |
| Custos LLM acima do previsto | Média | Médio | Cache + judge heurístico primeiro |
| Ban no WhatsApp por spam | Baixa | Alto | Template approval + opt-in obrigatório |
| Bug em comissão | Baixa | Crítico | Cobertura de testes + dry-run + auditoria imutável |
| Latência DB sob carga | Média | Médio | Read replicas + cache Redis |

---

## 🧭 Princípios de design

1. **Operacional por padrão** — toda skill nasce funcional, mesmo sem LLM/Redis/DB
2. **Auditável em tudo** — cada execução tem ID, timestamp, decisor, input/output
3. **Degradação graciosa** — fallbacks em todas as integrações externas
4. **RBAC granular** — privilégio mínimo em cada endpoint
5. **Determinístico onde possível** — heurísticas auditáveis antes de LLM
6. **Compliance first** — opt-in e LGPD antes de qualquer outreach
7. **Latência ≤ 2s** como SLA interno
8. **Cobertura crescente** — meta de +3 skills/mês

---

## 📅 Próxima revisão

**2026-06-28** — checkpoint mensal com:
- Atualização do Autonomy Score real
- Status das skills entregues vs roadmap
- Métricas operacionais (latência, aprovações, canais)
- Ajuste de prioridades com base em uso real

---

<sub>Roadmap mantido pela Equipe Nexus · contato: equipenexus@oneverso.com.br</sub>
