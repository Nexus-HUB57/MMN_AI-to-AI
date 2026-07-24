# Nexus Affil'IA'te — Arquitetura Multi-Repositório

## Visão Geral dos Repositórios

O ecossistema Nexus Affil'IA'te é composto por 3 repositórios com responsabilidades distintas:

### 1. MMN_AI-to-AI (Repositório Principal — Orquestração)
- **URL**: https://github.com/Nexus-HUB57/MMN_AI-to-AI
- **Função**: Runtime principal — backend Express + tRPC, frontend React + Vite
- **Contém**: 
  - Core orchestration (Nexus, Judge Federation, CEO-AI)
  - Deploy workflows (GitHub → VPS via REST API + SSH)
  - Ebook covers (~472MB assets)
  - Pack entitlement system (packProtocolService, packEntitlementService, packDeliveryService)
  - Routers: 68+ tRPC routers (marketplace, payments, commissions, network, agents, etc.)
  - Services: 52+ services (LLM, RAG, PIX, payments, sync, etc.)

### 2. Marketplace-Nexus (Repositório de Marketplace e E-commerce)
- **URL**: https://github.com/Nexus-HUB57/Marketplace-Nexus-
- **Função**: Catálogo de ebooks e e-commerce interno
- **Contém**:
  - 132 ebooks em 4 packs (A², A²II, A²III, AG)
  - DB schemas: marketplace_ebooks, carts, orders, user_library, pack_drawings
  - Backend: routers marketplace + academia
  - Frontend: UI Marketplace + Academia EAD
  - Scripts de seed e geração de ebooks

### 3. Academ-IA (Repositório Educacional e de Conteúdo)
- **URL**: https://github.com/Nexus-HUB57/Academ-IA
- **Função**: Conteúdo pedagógico e ferramentas técnicas
- **Contém**:
  - 4 trilhas de cursos (Fundamental → Agente → Master → Elite)
  - 36 apostilas (~510KB markdown)
  - Lab-Nexus (40 tools, 8 prompts, 3 templates, 3 workflows)
  - Lib-Nexus (9 docs técnico-científicos: glossário, IOAID, Skills, LGPD, etc.)
  - Vídeos, webinars, playbooks, tutoriais

## Sync Architecture (CEO-015)

### Protocolo_Pack → Sistema (IMPLEMENTADO)
- `packProtocolService.ts`: Registro oficial de 13 packs (5 categorias)
- `packEntitlementService.ts`: Entrega de ebooks via Fisher-Yates
- `packDeliveryService.ts`: Orquestrador completo (Skills, XP, Access Flags, PNE, Commissions)
- Tabelas: `user_pack_access`, `pne_sisu_subaccounts`, `user_monthly_activation`

### Marketplace-Nexus → MMN_AI-to-AI
- `marketplaceNexusRouter.ts`: Routers marketplace expostos via tRPC
- `syncMarketplaceProducts.ts`: Sync de marketplaces externos (ML, Shopee, Hotmart)
- **Gap**: Sem bridge automatizada para sync de ebooks internos
- **TODO**: Criar GitHub Action para sync de catálogo de ebooks

### Academ-IA → MMN_AI-to-AI
- `academiaEadRouter.ts`: CRUD de lessons via Postgres/JSON
- `academiaLessonsRepository.ts`: Repository pattern para academia_lessons
- `labNexusRouter.ts` + `services/lab-nexus/`: Chat, providers, usage ledger
- **Gap**: Deploy manual via SCP + psql
- **TODO**: Implementar sync-bridge MCP server (ver Academ-IA/sync/MCP-CONFIG.md)

### Ativação Mensal (CORRIGIDO)
- `dashboardStatusRouter.ts`: cycleLabel() usa YYYY-MM (locale-independent)
- checkMonthlyActivationPaid() usa to_char(YYYY-MM) no PostgreSQL
- Adicionado cycleLabelDisplay() para labels legíveis no frontend

## Deploy Pipeline
1. Código → GitHub (REST API Git Data)
2. VPS: git pull + esbuild bundle + PM2 restart
3. DB: migrations via node + pg driver
4. VPS: HostGator 143.95.213.237:22022 (root)

## Commits CEO-015
- `8516bdae92f1`: packDeliveryService.ts + migration SQL
- `f3f83f775ec0`: Fix ativação mensal (cycleLabel locale bug)
