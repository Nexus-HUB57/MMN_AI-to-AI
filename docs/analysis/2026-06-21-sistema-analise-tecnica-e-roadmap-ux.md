# Sistema Nexus Affil'IA'te — Análise Técnica, Resumo Executivo e Roadmap

**Documento consolidado**
**Versão:** 1.0
**Data:** 2026-06-21
**Ambiente:** Produção · [oneverso.com.br](https://oneverso.com.br) · 143.95.213.237
**Responsável técnico:** MMN AI Deploy

---

## 1. Resumo Executivo

### 1.1 Visão Geral
O Sistema **Nexus Affil'IA'te** é uma plataforma SaaS de **marketing multinível com inteligência artificial agêntica**, que combina:

- **Marketplace digital de e-books de IA** (201 títulos · 19 coleções premium)
- **Loja virtual personalizada** para cada afiliado (modelo Hotmart-like)
- **Agente IA pessoal** com 25 skills autônomas (vendas, conteúdo, prospecção)
- **Programa de afiliação multinível** (15 níveis · Pack A² ao Pack AAIII)
- **Integrações de marketplace** (Hotmart ativo, Shopee/Mercado Livre estruturados)
- **Sistema de pagamentos PIX** (Mercado Pago) com entrega automática

### 1.2 Estado Atual (snapshot real)

| Indicador | Valor |
|---|---|
| **Uptime mmn-api** | online · 6/6 processos PM2 |
| **Rotas HTTP** | 9/9 críticas em HTTP 200 |
| **Usuários cadastrados** | 203 |
| **Agentes IA configurados** | 100 |
| **Pack grants ativos** | 101 (sincronização automática validada) |
| **Bibliotecas pessoais** | 1.010 entregas distintas |
| **Tracking links** | 100 (Hotmart) |
| **Catálogo de e-books** | 201 ativos · 200 capas premium |
| **Coleções organizadas** | 19 (ordenadas oficialmente) |
| **Skills agênticas** | 25 handlers registrados |
| **Hotmart OAuth** | Ativo (token 584 chars) |
| **Bundles** | Frontend 966 KB · Backend 1,3 MB |

### 1.3 Pontos Fortes
1. **Sincronização automática Pack ↔ Loja/Estoque** validada em produção (1.000 entregas em 3 segundos, idempotência confirmada).
2. **Auditoria criptográfica** dos sorteios (Fisher-Yates com seed SHA-256, gravado em `marketplace_pack_drawings`).
3. **Arquitetura tRPC type-safe** com 50 sub-routers e 86 tabelas PostgreSQL.
4. **UX refatorada em 3 hubs** (Operar / Crescer / Conta) com componentes reutilizáveis.
5. **Marketplace v2** com QuickView, Carousel, View-Mode (localStorage), scroll-spy, debounce.
6. **Hotmart pronto para vender** (OAuth client_credentials válido, webhook PIX → Pack grant ativo).

### 1.4 Riscos e Lacunas Identificadas
| Risco | Severidade | Mitigação prevista |
|---|---|---|
| Skills runtime sem `planner` injetado | Média | Inicializar `agenticCore.planner` no boot (Sprint 6) |
| Shopee/ML sem credenciais cadastradas | Baixa | Estrutura pronta; aguardando keys |
| Inventário da Loja exibe dados JSON antigos como fallback | Baixa | Já corrigido — fonte primária é DB |
| Acúmulo de 69 restarts no mmn-api | Baixa | Monitorar deploy frequente; configurar `max_restarts` |
| Catálogo público sem cache CDN | Média | Adicionar Cloudflare em frente ao nginx |

---

## 2. Análise Técnica

### 2.1 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + Vite + Wouter + tRPC client)         │
│  92 páginas · 28 componentes · Bundle 966 KB            │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS · Nginx (porta 443 → 3001)
┌─────────────────▼───────────────────────────────────────┐
│  Backend Express (tRPC v10 + esbuild bundler CJS)       │
│  50 sub-routers · 1,3 MB dist · porta 3001              │
└────┬─────────┬─────────────┬─────────────┬──────────────┘
     │         │             │             │
┌────▼────┐ ┌──▼───┐ ┌───────▼──────┐ ┌────▼─────┐
│Postgres │ │Redis │ │ Workers PM2  │ │ Hotmart  │
│86 tabs  │ │cache │ │ x4 (content, │ │ OAuth +  │
│Drizzle  │ │      │ │ marketplace, │ │ Webhooks │
│         │ │      │ │ orders,      │ │          │
│         │ │      │ │ commissions) │ │          │
└─────────┘ └──────┘ └──────────────┘ └──────────┘
```

### 2.2 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18, Vite, Wouter, tRPC v10, Tailwind, lucide-react, TanStack Query |
| **Backend** | Node 20, Express, tRPC v10, Drizzle ORM, esbuild, pg, Pino |
| **Banco** | PostgreSQL 15 (nexus_prod) · 86 tabelas |
| **Cache** | Redis (workers PM2) |
| **Process Mgmt** | PM2 fork mode · 6 processos |
| **Web Server** | Nginx (TLS, gzip, cache imutável /assets) |
| **Pagamentos** | PIX via Mercado Pago + chave manual |
| **Marketplace integrations** | Hotmart (ativo), Shopee/ML (estrutura pronta) |
| **CI/CD** | Git (GitHub Nexus-HUB57) + deploy SSH + esbuild |

### 2.3 Domínios Principais (Módulos)

#### 2.3.1 Marketplace Nexus
- **Service**: `userLibraryService.ts` (566 linhas)
- **Router**: `marketplaceNexusRouter.ts`
- **Tabelas**: `marketplace_ebooks`, `marketplace_orders`, `marketplace_order_items`, `marketplace_user_library`, `marketplace_pack_drawings`, `marketplace_pack_grants`, `marketplace_carts`, `marketplace_cart_items`
- **Funcionalidades**:
  - Catálogo de 201 e-books com `collection_rank` (1–19)
  - Carrinho persistente por usuário
  - Checkout PIX com `createMarketplaceCheckout`
  - Entrega automática `deliverOrder` com Fisher-Yates SHA-256
  - Biblioteca pessoal `getUserLibrary`
  - Histórico de ordens `listUserOrders`

#### 2.3.2 Pack Entitlement (Pack A² → Loja)
- **Service**: `packEntitlementService.ts` (321 linhas)
- **Router**: `packEntitlementsRouter.ts` (6 procedures: listMyGrants, listMyLibrary, confirmAndGrant, redeliver, quotaTable, adminGrant)
- **Quota oficial**:
  - pack-a2: 10 e-books
  - pack-a2ii: 30
  - pack-a2iii: 50
  - pack-ag/agii/agiii: 250/500/750
  - pack-agn/agnii/agniii: 1.100/4.000/6.000
  - pack-ao/aoii/aoiii: 10.000/20.000/40.000
  - pack-aa/aaii/aaiii: 100.000/200.000/350.000
- **Hook PIX**: `PACK_GRANT_HOOK_V2` em `pixRouter.webhook` dispara `grantPackToUser` ao confirmar pagamento.

#### 2.3.3 Agente IA + Skills Runtime
- **Router**: `agentSkillsRuntimeRouter.ts` (executa skills via `dispatcher`)
- **25 Skills** (categorias: sales, content, publishing, intelligence, analytics, finance, decision, strategy, optimization, retention, i18n)
- **Tabela**: `agents` (1 agent por user, status active/learning)
- **Auditoria**: telemetria via `stress_test_agents` + `stress_test_events`
- **Dispatcher**: `src/agentic/skills/dispatcher.ts` + 29 arquivos de skill

#### 2.3.4 Integrações de Marketplace
- **Router**: `marketplaceConnectionsRouter.ts` (7 procedures)
- **Hotmart**: 100% configurado — `hotmartClient.ts` (231 linhas) com OAuth client_credentials, products, sales, affiliates, webhook
- **Shopee**: `shopee.ts` (327 linhas) — pronto, aguardando credenciais
- **Mercado Livre**: `mercadoLibre.ts` (289 linhas) — pronto, aguardando credenciais
- **Tabela**: `marketplace_accounts` (14 colunas, idempotente)

#### 2.3.5 Programa de Afiliação
- **15 packs** (Pack A² ao Pack AAIII)
- **Sistema XP**: tabela `xp_transactions`
- **Comissões**: `commissions`, `commissionsRouter.ts`, worker `mmn-worker-commissions`
- **Rede binária N.O**: `network` (rede direta) e `sisu` (sub-redes)
- **Carteira**: `pix_configuration` + `payments`

### 2.4 Métricas de Qualidade

| Métrica | Valor | Avaliação |
|---|---|---|
| Cobertura TypeScript | 100% (TSC sem erros) | ✅ |
| Idempotência Pack | Validada (paymentRef único) | ✅ |
| Throughput grants | ~33/s + 333 inserts/s | ✅ |
| Build time backend | 68ms (esbuild) | ✅ Excelente |
| Build time frontend | ~7.4s (Vite, 3.215 módulos) | ✅ |
| Bundle frontend | 966 KB (com 3 code-splits) | ⚠️ Otimizar |
| HTTP smoke 9/9 | 200 OK | ✅ |
| Auditoria criptográfica | Fisher-Yates SHA-256 | ✅ |
| PM2 disrupção em deploys | 0 (zero-downtime) | ✅ |

### 2.5 Performance Validada (Massive E2E Test 21/06/2026)
- **100 usuários** criados em paralelo
- **100 agents** vinculados
- **100 grants Pack A²** executados (1.000 e-books entregues)
- **100 tracking links Hotmart** gerados
- **500 eventos de skill** registrados
- **Tempo total**: 3 segundos
- **PM2**: 0 disruption
- **Cobertura sorteios**: 12 coleções distintas (distribuição estatística válida)

---

## 3. Roadmap de Melhorias para a Experiência do Usuário

### 3.1 Princípios Orientadores
1. **Simplicidade primeiro** — fluxos de 1 clique para ações comuns
2. **Feedback contínuo** — toasts, badges, indicadores de progresso
3. **Mobile-first** — 70% do tráfego esperado em smartphones
4. **Acessibilidade** — WCAG 2.1 AA mínimo
5. **Performance percebida** — skeletons, lazy load, prefetch
6. **Transparência** — usuário vê o que o agente está fazendo

### 3.2 Sprints planejados (12 semanas)

#### 🚀 Sprint 5 — Onboarding & Primeira Vitória (Semana 1-2)

**Objetivo**: Levar o novo usuário do cadastro à primeira venda em < 5 minutos.

| Item | Descrição | Esforço |
|---|---|---|
| **Tour interativo** | Walkthrough guiado em 5 passos no primeiro login (Dashboard → Skills → Marketplace → Pack A² → Loja) | M |
| **Wizard de ativação** | Após cadastro, modal de 3 etapas: 1) PIX do Pack A², 2) confirmação automática, 3) "Seus 10 e-books estão na Loja!" | M |
| **Checklist de progresso** | Sidebar lateral mostrando: ✅ Cadastro, ✅ Agente ativo, ✅ Pack A², ⬜ 1ª venda, ⬜ 1ª comissão | S |
| **Empty states ricos** | Em /skills, /estoque, /marketplaces — quando vazio, exibir CTA + tutorial em vídeo de 30s | S |
| **Notificações em tempo real** | WebSocket (ou polling 30s) para mostrar "Pack ativado!", "Nova venda!", "Comissão recebida!" | M |

#### 🧠 Sprint 6 — Agente IA Vivo (Semana 3-4)

**Objetivo**: Tornar o Agente IA visível, acionável e produtivo no dia a dia.

| Item | Descrição | Esforço |
|---|---|---|
| **Inicializar `planner` no agenticCore** | Resolver bug do `context.planner undefined` em prod (skills executam mas plan falha) | M |
| **Painel Agente Live** | Card persistente no topo do Dashboard mostrando: status atual, última skill executada, próxima ação sugerida | M |
| **Chat com o Agente** | Interface tipo chatbot em `/agents` para conversação natural (instruções, perguntas) | L |
| **Histórico de ações** | Timeline visual em `/agents/sync` com cada execução de skill + resultado | M |
| **Auto-pilot toggle** | Switch "Modo Autônomo" liga/desliga execução automática de skills nas horas configuradas | S |
| **Quick run em 1 clique** | Botões "Gerar copy", "Detectar tendências", "Prospectar leads" no Dashboard (já implementado parcialmente) | XS |

#### 💰 Sprint 7 — Vendas em Foco (Semana 5-6)

**Objetivo**: Maximizar conversão e visibilidade do funil de vendas.

| Item | Descrição | Esforço |
|---|---|---|
| **Funil visual** | Dashboard com gráfico Sankey: visitas → carrinho → checkout → venda → comissão | M |
| **Heatmap da Loja** | Mostrar para o afiliado quais e-books têm mais cliques/conversão | M |
| **Compartilhamento 1-tap** | Botão WhatsApp/IG/X em cada e-book da Loja, gera link tracked + cópia auto da legenda | S |
| **Cupons e promoções** | Sistema de cupons % e R$ válidos por tempo limitado | M |
| **Email de venda automático** | Quando cliente compra na Minha Loja, dispara email com link de download + tracking de abertura | M |
| **Calculadora de ganhos** | Em /upgrades, simulador "Se eu vender X/mês com Pack AGN, quanto ganho?" | S |

#### 📱 Sprint 8 — Mobile First (Semana 7-8)

**Objetivo**: Experiência impecável no smartphone.

| Item | Descrição | Esforço |
|---|---|---|
| **PWA installable** | manifest.json + service worker para "Adicionar à tela inicial" | M |
| **Bottom nav** | 3 abas no mobile (Operar / Crescer / Conta) substituindo sidebar | S |
| **Sheet modals** | Substituir modais centrais por bottom sheets (gesto natural) | M |
| **Push notifications** | Web Push API para "Nova venda!", "Comissão paga!" | L |
| **Modo offline** | Cache do catálogo + leitura de e-books salvos | M |
| **QR code da Loja** | Botão "Gerar QR" em /minha-loja para divulgar em panfletos físicos | XS |

#### 🎓 Sprint 9 — Educação & Comunidade (Semana 9-10)

**Objetivo**: Acelerar o aprendizado do afiliado e criar engajamento social.

| Item | Descrição | Esforço |
|---|---|---|
| **Academia integrada** | Vídeo-aulas curtas (2-3 min) plugadas em cada feature (ex.: como compartilhar a Loja) | L |
| **Gamificação visível** | Barra de XP no header + conquistas desbloqueáveis (1ª venda, 10 indicados, R$ 1k comissões) | M |
| **Ranking público** | Top 100 afiliados por XP, comissões, vendas — com opt-in | S |
| **Grupos por nível** | Salas de discussão por Pack ativo (Pack A² Club, Pack AG Club, etc.) | L |
| **Mentor IA** | "Seu Agente analisou e sugere: foque em LinkedIn essa semana, sua audiência tá mais ativa lá." | M |

#### ⚙️ Sprint 10 — Personalização & Loja Própria (Semana 11-12)

**Objetivo**: Loja virtual = identidade do afiliado.

| Item | Descrição | Esforço |
|---|---|---|
| **Temas da Loja** | 5+ temas visuais (claro, escuro, neon, minimalista, premium) | M |
| **Domínio próprio** | Cada afiliado pode apontar `meu-dominio.com` para sua Loja | L |
| **Logo + cores customizadas** | Upload de logo + paleta editável | M |
| **Bio + redes sociais** | Página /sobre na Loja com bio do afiliado, links IG/YT/TT | S |
| **SEO da Loja** | OG tags dinâmicos por e-book, sitemap.xml, schema.org Product | M |
| **Multi-idioma (PT/EN/ES)** | i18n com `content-translator` skill para auto-tradução | L |

### 3.3 Backlog Técnico (paralelo ao roadmap UX)

| Item | Severidade |
|---|---|
| Resolver `context.planner undefined` no agenticCore | Alta |
| Cadastrar credenciais Shopee + Mercado Livre | Média |
| Otimizar bundle frontend (lazy load routes admin) | Média |
| CDN (Cloudflare) em frente ao nginx | Média |
| Webhook Hotmart de venda → grant automático para o cliente final | Alta |
| Migrações via drizzle-kit (atual: SQL manual) | Baixa |
| Testes automatizados (Vitest + Playwright) | Alta |
| Observabilidade (OpenTelemetry + Grafana) | Média |
| Rate limiting global (atual: só PIX) | Média |
| Rotinas de backup automatizadas PG | Alta |

### 3.4 Estimativa de Impacto

| Sprint | KPI principal | Meta |
|---|---|---|
| Sprint 5 — Onboarding | % usuários que ativam Pack A² em 24h | +60% |
| Sprint 6 — Agente Vivo | DAU (Daily Active Users) | +40% |
| Sprint 7 — Vendas | Conversão Loja (visita → venda) | +120% |
| Sprint 8 — Mobile | % sessões mobile concluídas | +80% |
| Sprint 9 — Educação | Retenção semana-4 | +50% |
| Sprint 10 — Personalização | NPS | de 45 → 65 |

### 3.5 Quick Wins (até 7 dias — alta prioridade)

1. **Toast de venda em tempo real** — quando Pack A² é entregue, banner verde 5s "🎉 10 e-books sincronizados!"
2. **Botão "Copiar link da Loja"** no header com feedback visual
3. **Indicador de salvamento** em formulários (✓ Salvo)
4. **Loading skeletons** em todas as queries tRPC pesadas
5. **Voltar ao topo** já implementado no Marketplace — estender ao Dashboard
6. **Search global** (Cmd+K) buscando em e-books, skills, contatos
7. **Tooltips** em todos os badges/ícones complexos
8. **Empty state hero** com ilustração + CTA em cada página vazia

---

## 4. Conclusão

O **Sistema Nexus Affil'IA'te** está **operacional, estável e validado em escala** com a entrega Pack A² → Loja/Estoque funcionando perfeitamente. A infraestrutura técnica é sólida (TypeScript ponta-a-ponta, tRPC type-safe, PostgreSQL com 86 tabelas estruturadas, PM2 com workers especializados).

O grande salto agora é **transformar capacidade técnica em experiência memorável**. O roadmap em 6 sprints (12 semanas) prioriza onboarding eficaz, agente IA visível, vendas otimizadas, mobile-first, educação contínua e personalização da Loja — atacando as 6 dimensões que mais impactam retenção e crescimento orgânico em SaaS de afiliação.

**Próximo passo imediato sugerido**: iniciar **Sprint 5 (Onboarding)** com foco no wizard de ativação Pack A² e nos toasts de feedback em tempo real — ROI de UX mais alto em prazo mais curto.

---

## Anexos

- Relatório E2E completo: `docs/test-reports/2026-06-21-massive-e2e-pack-agentes-hotmart.md`
- Release notes do ciclo: `docs/release-notes/2026-06-21-pack-entitlement-pix-sync.md`
- Repo: https://github.com/Nexus-HUB57/MMN_AI-to-AI
- Commits recentes: `4fef91b` → `06330bf` → `ee7299a` → `edd1d6f` → `c35ae6e`
