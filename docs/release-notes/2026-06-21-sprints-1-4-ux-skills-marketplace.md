# Release 2026-06-21 — Sprints 1, 2, 3 e 4

## Sprint 1 — UX Simples e Dinâmica
- Refatoração do `DashboardLayout` em **3 Hubs**:
  - 🧠 Operar — Agente & Conteúdo (9 itens: Agente, Skills, Sync, Orquestrador, Hub Conteúdo, Gerador, Calendário, Materiais, Contas Sociais)
  - 🚀 Crescer — Vendas & Rede (11 itens: Marketplace, Loja, Estoque, Tracking, Dropshipping, Rede, SiSu, Comissões, XP, Bônus, Analytics)
  - 👤 Conta — Gestão & Pagamentos (9 itens: Dashboard, Packs, Upgrades, Pagamentos, PIX×2, Subscriptions, Partners, Academia)
- Bundle: 533 → 402 linhas (−1247 bytes)
- Idempotência via marker `NEXUS_HUBS_V2`

## Sprint 2 — Skills 100% Efetivos
- Novo componente `SkillsRuntimePanel` no topo de `/skills`
- Consome `agentSkillsRuntime.listHandlers` (25 handlers reais e operacionais)
- Filtro por categoria (sales, content, publishing, intelligence, analytics, finance, decision, strategy, optimization, retention, i18n)
- Botão **▶ Executar (dry-run)** por skill, chama `agentSkillsRuntime.execute`
- Idempotência via marker `SKILLS_RUNTIME_PANEL_V2`

## Sprint 3 — Integrações de Parceiros (Hotmart ativo + estrutura Shopee/ML)
- **Migration**: tabela `marketplace_accounts` (14 colunas, 3 índices) — unificada para todas as plataformas
- **Novo router**: `marketplaceConnectionsRouter` com 7 procedures:
  - `getStatus` (public): configuração agregada
  - `listConnections` (protected): contas conectadas do usuário
  - `getHotmartSummary` (protected): vendas/afiliados/produtos via Hotmart API
  - `getShopeeAuthUrl` (protected): URL OAuth Shopee
  - `getMercadoLivreAuthUrl` (protected): URL OAuth ML
  - `searchShopeeHot` (protected): trending products Shopee
  - `searchMercadoLivreTrending` (protected): trending products ML
- Registrado em `appRouter.ts` como `marketplaceConnections`
- **Hotmart**: 100% configurado (`HOTMART_CLIENT_ID/SECRET/BASIC_AUTH/WEBHOOKS_SECRET`)
- **Shopee/ML**: estrutura completa, env template adicionado, aguardando credenciais

## Sprint 4 — Vendas, Publicação, Divulgação, Prospecção
- Nova `NexusQuickActionsBar` no topo do Marketplace Nexus com 4 ações:
  - 🎯 Prospectar Leads → executa `prospeccao-outbound` (dry-run)
  - 📤 Publicar Agora → executa `auto-publisher` (dry-run)
  - ✍️ Gerar Conteúdo → executa `copywriter-persuasivo` (dry-run)
  - 🔗 Tracking Links → navega para `/tracking/links`
- Idempotência via marker `NEXUS_QUICK_ACTIONS_V2`

## Validação ao vivo
- Bundle frontend final: `index-B4uwrxFW.js` (959.94 KB)
- Build backend: dist/index.js 1.2 MB (80ms)
- HTTP 200 em: `/`, `/dashboard`, `/marketplaces`, `/skills`, `/agents`, `/content-hub`, `/tracking/links`, `/api/health`
- APIs críticas: marketplaceNexus.listEbooks (123 KB, 201 itens), agentSkillsRuntime.listHandlers (3.2 KB, 25 handlers), marketplaceConnections.getStatus (474 B)
- PM2: 6/6 processos online
- DB: `marketplace_accounts` criada com 0 rows + índices

## Como ativar Shopee/Mercado Livre
1. Editar `/var/www/oneverso/current/.env`, descomentar e preencher:
   ```
   SHOPEE_PARTNER_ID=...
   SHOPEE_PARTNER_KEY=...
   SHOPEE_REDIRECT_URI=https://oneverso.com.br/api/oauth/shopee/callback
   MERCADO_LIVRE_CLIENT_ID=...
   MERCADO_LIVRE_CLIENT_SECRET=...
   MERCADO_LIVRE_REDIRECT_URI=https://oneverso.com.br/api/oauth/mercadolivre/callback
   ```
2. `pm2 reload mmn-api --update-env`
3. Os endpoints OAuth/list/sync passam a funcionar automaticamente.
