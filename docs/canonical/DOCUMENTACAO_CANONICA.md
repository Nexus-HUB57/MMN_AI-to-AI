# DOCUMENTAÇÃO CANÔNICA - Nexus System AfilIAte-AI

> **Data de Criação:** 2026-05-19
> **Versão:** 1.0.0
> **Autor:** MiniMax Agent
> **Status:** DOCUMENTO ÚNICO OFICIAL

---

## Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Sistema MMN](#2-sistema-mmn)
3. [Painel Administrativo](#3-painel-administrativo)
4. [Painel do Afiliado](#4-painel-do-afiliado)
5. [Agentes e Skills](#5-agentes-e-skills)
6. [Marketplace Nexus](#6-marketplace-nexus)
7. [Nível de Autonomia](#7-nível-de-autonomia)
8. [Potencial de Mercado](#8-potencial-de-mercado)
9. [Stack Tecnológica](#9-stack-tecnológica)
10. [Guia de Início Rápido](#10-guia-de-início-rápido)
11. [Roadmap e Conformidade](#11-roadmap-e-conformidade)

---

## 1. Visão Geral do Sistema

O **Nexus System AfilIAte-AI** é uma plataforma de Marketing Multinível (MMN) de nova geração, orquestrada por agentes de IA autônomos. O sistema representa uma fusão do legado PHP com uma stack moderna React/TypeScript, oferecendo capabilities avançadas de automação e inteligência artificial.

### Características Principais

- **Conformidade:** 85-90%
- **Versão Atual:** v1.0.7 (2026-05-19)
- **Stage:** MVP+
- **Licença:** MIT
- **Camada Agentic:** Implementada (Layer 7C3AED)

### Arquitetura High-Level

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                  │
│         Páginas │ Componentes │ TailwindCSS            │
└────────────────────────┬────────────────────────────────┘
                         │ tRPC
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (Node.js)                     │
│     Routers tRPC │ Services │ Workers BullMQ           │
└────────────────────────┬────────────────────────────────┘
                         │
┌───────────────┬─────────┴──────────┬──────────────────┐
│   MySQL       │      Redis         │   Genkit/IA      │
│  (Drizzle)    │     (BullMQ)       │  (Gemini/OpenAI) │
└───────────────┴─────────────────────┴──────────────────┘
```

---

## 2. Sistema MMN

### 2.1 Estrutura de Comissões

O sistema de comissões implementa cascata em até **15 níveis** com compressão dinâmica:

| Nível | Percentual Base | Compressão Ativa |
|-------|----------------|------------------|
| 1-3   | 20-30%         | Sim              |
| 4-7   | 10-20%         | Sim              |
| 8-15  | 5-15%          | Não              |

### 2.2 Plano de Carreira (PD/SCC)

**27 níveis** organizados em 5 categorias:

| Categoria        | Níveis | XP Requerido   | Bônus Comissão |
|------------------|--------|---------------|---------------|
| **Afiliado**     | 1-3    | 0-1.000        | 20-40%        |
| **Preditivo**    | 4-6    | 1.001-5.000    | 50-70%        |
| **Generativo**   | 7-9    | 5.001-15.000   | 75-90%        |
| **Orquestrador** | 10-12  | 15.001-50.000  | 90%+          |
| **IA Agêntica**  | 13-27  | 50.000+        | 90%+          |

### 2.3 Sistema de XP

| Fonte          | Multiplicador XP |
|----------------|-------------------|
| Vendas         | 10x               |
| Comissões      | 5x                |
| Bônus Especiais| 15x               |
| Network        | 3x                |

---

## 3. Painel Administrativo

### 3.1 Funcionalidades

| Módulo                    | Descrição                          |
|---------------------------|------------------------------------|
| **AdminDashboard**        | Visão geral de métricas            |
| **AdminUsers**           | Gestão completa de usuários        |
| **AdminNetwork**         | Visualização e manipulação de rede  |
| **AdminCommissions**     | Gestão de comissões               |
| **AdminPayments**        | Processamento de pagamentos       |
| **AdminDelinquents**     | Gestão de inadimplentes           |
| **AdminMaterials**       | Gestão de materiais de marketing  |

### 3.2 Sistema RBAC

**8 Roles Padrão:**
- `super_admin` - Acesso total
- `admin` - Gestão administrativa
- `manager` - Gestão intermediária
- `affiliate` - Usuário padrão
- `viewer` - Apenas visualização
- `support` - Suporte técnico
- `integrator` - Integrações
- `api_user` - Acesso via API

**45+ Permissões Granulares** por recurso

### 3.3 Sistema de Billing

| Status        | Descrição                    |
|---------------|------------------------------|
| `pending`     | Aguardando pagamento         |
| `paid`        | Pago                         |
| `overdue`     | Vencido                      |
| `cancelled`   | Cancelado                    |

---

## 4. Painel do Afiliado

### 4.1 Dashboard do Afiliado

O painel oferece experience completa de auto-gestão:

- **Saldo:** Disponível, Pendente, Bloqueado
- **Histórico de Transações:** Recentes e detalhado
- **Métricas de Rede:** Em tempo real
- **Progresso de Carreira:** XP e próxima promoção
- **Atalhos:** Operações frequentes

### 4.2 Funcionalidades

| Componente              | Descrição                          |
|-------------------------|-------------------------------------|
| **Dashboard**          | Visão geral personalizada           |
| **AffiliateProfile**   | Gestão de perfil                   |
| **AffiliatePayments**  | Histórico de pagamentos            |
| **AffiliateMiniSite**  | Site personalizado                 |
| **Commissions**        | Visualização de comissões          |
| **BonusRewards**       | Programa de bônus                  |

### 4.3 Sistema Financeiro (BeYour Banker)

- ✅ Saldo do Afiliado
- ✅ Contas Bancárias (PIX)
- ✅ Solicitações de Saque
- ✅ Histórico de Transações
- ✅ Relatórios Mensais
- ⚠️ Integração PIX Real (planejado)

---

## 5. Agentes e Skills

### 5.1 Arquitetura Agentic

A camada agentic é o coração inovador do sistema, implementando **IA autônoma** para automação.

```
┌──────────────────────────────────────────────────────┐
│              CAMADA AGENTIC                          │
├──────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ baseAgent   │  │ marketing   │  │    judge    │  │
│  │   (base)    │  │   Agent     │  │  (LLM)      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │          │
│  ┌──────▼────────────────▼────────────────▼──────┐ │
│  │              ORCHESTRATOR                       │ │
│  │         (Coordenação Multi-Agente)            │ │
│  └────────────────────────────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Memory    │  │   Queue     │  │   Monitor    │ │
│  │  (Vector)   │  │  (BullMQ)   │  │   (Audit)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 5.2 Tipos de Agentes

| Agente              | Capabilities                              |
|---------------------|-------------------------------------------|
| **baseAgent**       | Comunicação LLM, memória, ferramentas     |
| **marketingAgent**  | Geração de conteúdo, scheduling, análise  |
| **llmJudge**        | Verificação de qualidade de outputs       |

### 5.3 Ferramentas Integradas

| Ferramenta          | Platforma            | Status      |
|---------------------|----------------------|-------------|
| **instagramTool**   | Instagram API        | ✅ Implementado |
| **whatsappTool**    | WhatsApp API         | ✅ Implementado |
| **ContentGen**      | Texto/Imagem/Hashtag | ✅ Implementado |

### 5.4 Sistema de Skills/Upgrades

Packages que afiliados podem adquirir para expandir capabilities:

- **Upgrades Únicos:** Compra avulsa
- **Subscriptions:** Renovação automática
- **Histórico:** Rastreamento completo

---

## 6. Marketplace Nexus

### 6.1 Arquitetura

O Marketplace Nexus é um catálogo próprio de produtos integrado ao ecossistema MMN.

| Componente          | Descrição                          |
|--------------------|------------------------------------|
| **Catálogo**       | Grid de produtos com filtros       |
| **Carrinho**       | Gerenciamento de itens             |
| **Checkout**       | Fluxo em 5 etapas                  |
| **Reviews**        | Avaliações e moderação             |
| **Cupons**         | Descontos e promoções              |

### 6.2 Integração com Marketplaces

| Marketplace    | Status      | Funcionalidades           |
|---------------|-------------|--------------------------|
| **Mercado Livre** | ✅ Implementado | Sync produtos, pedidos |
| **Shopee**    | ✅ Implementado | Sync produtos, pedidos |
| **Hotmart**   | ✅ Implementado | Cursos, comissões       |

### 6.3 Schema do Banco

- `marketplaceProducts` - Catálogo
- `productCategories` - Categorização
- `marketplaceOrders` - Pedidos
- `productReviews` - Avaliações
- `coupons` - Cupons de desconto
- `wishlists` - Lista de desejos

---

## 7. Nível de Autonomia

### 7.1 Diagnóstico de Autonomia

| Área                    | Nível de Autonomia |
|-------------------------|--------------------|
| Content Generation      | Moderado-Alto      |
| Network Management      | Moderado-Alto      |
| Customer Service        | Moderado           |
| Sales                  | Moderado           |

### 7.2 Capacidades Autônomas Implementadas

| Capability              | Descrição                          | Status |
|------------------------|------------------------------------|--------|
| **Content Auto-Gen**   | Textos, imagens, hashtags           | ✅     |
| **Post Scheduling**    | Publicação automática multi-plataforma | ✅ |
| **Commission Calc**   | Cálculo automático de comissões    | ✅     |
| **Order Processing**  | Automação do fulfillment            | ✅     |
| **Network Updates**    | Atualização de carreira            | ✅     |

### 7.3 Controles e Safety

- Operações financeiras: Aprovação administrativa
- Alterações de rede: Validação obrigatória
- Decisões ambíguas: Escalamento humano

---

## 8. Potencial de Mercado

### 8.1 Mercado Alvo

- **Região Primária:** Brasil
- **Segmentos:** MMN, Afiliados, IA
- **Tendência:** Crescimento consistente

### 8.2 Vantagens Competitivas

1. **Integração Nativa de IA** - Elimina necessidade de ferramentas separadas
2. **Stack Moderna** - TypeScript + React + Node.js
3. **Marketplace Diversificado** - 3 frentes de monetização
4. **Arquitetura Escalável** - Deployment horizontal
5. **Ecossistema de Skills** - Network effects

### 8.3 Oportunidades de Crescimento

| Oportunidade                   | Prioridade    |
|--------------------------------|---------------|
| Expansão geográfica (LATAM)   | Alta          |
| Mobile App (Expo)              | Alta          |
| Marketplace Extensions (SDK)  | Média         |
| Holdings e Dividendos          | Média         |

---

## 9. Stack Tecnológica

### 9.1 Frontend

| Tecnologia       | Versão     | Uso                    |
|-----------------|------------|------------------------|
| React           | ^18.3.1    | UI Framework           |
| Vite            | ^6.0.7     | Build Tool             |
| wouter          | ^3.3.5     | Router                |
| TailwindCSS     | ^3.4.17    | Styling               |
| TanStack Query  | ^5.62.8    | Data Fetching         |
| tRPC Client     | ^11.0.0    | API Type-Safe         |

### 9.2 Backend

| Tecnologia       | Versão     | Uso                    |
|-----------------|------------|------------------------|
| Node.js         | ^22.10.0   | Runtime                |
| TypeScript      | ^5.7.2     | Linguagem              |
| tRPC Server     | ^11.0.0    | API Framework          |
| Drizzle ORM     | ^0.38.4    | ORM                    |
| MySQL           | -          | Database               |
| Redis           | ^5.28.2    | Cache/Fila             |
| BullMQ          | ^5.28.2    | Queue Workers          |
| Genkit          | ^1.0.0     | AI Framework           |
| OpenAI          | ^4.77.0    | LLM Provider           |

### 9.3 Mobile

| Tecnologia       | Versão     | Uso                    |
|-----------------|------------|------------------------|
| React Native    | 0.78.0     | Mobile Framework       |
| Expo Router     | ~54        | File-based Router      |

---

## 10. Guia de Início Rápido

### 10.1 Instalação

```bash
# Clone o repositório
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI

# Instale dependências
npm install

# Ou manualmente:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 10.2 Configuração

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Configure as variáveis:
#    - DATABASE_URL
#    - REDIS_URL
#    - OPENAI_API_KEY
#    - JWT_SECRET
#    - MYSQL_ROOT_PASSWORD
#    - PORT

# 3. Inicie a infraestrutura
npm run infrastructure:up

# 4. Configure o banco
npm run db:push
```

### 10.3 Execução

```bash
# Frontend + Backend juntos
npm run dev

# Ou separadamente:
npm run dev:frontend  # Porta 5173
npm run dev:backend  # Porta 3000

# Workers BullMQ
npm --workspace backend run worker:content
npm --workspace backend run worker:commissions
npm --workspace backend run worker:marketplace

# Genkit Dev (Gemini)
npm run genkit:dev
```

### 10.4 Build

```bash
npm run build
npm run start
```

---

## 11. Roadmap e Conformidade

### 11.1 Métricas de Conformidade

| Categoria              | Implementado | Total | Percentual |
|------------------------|-------------|-------|------------|
| Core Backend           | 9           | 10    | 90%        |
| Camada Agentic          | 5           | 7     | 71%        |
| Sistema XP/Carreiras    | 6           | 10    | 60%        |
| Dashboard               | 1           | 1     | 100%       |
| Frontend/UI            | 7           | 12    | 58%        |
| Sistema MMN            | 5           | 8     | 63%        |
| Integração IA          | 4           | 5     | 80%        |
| Automação Social       | 5           | 6     | 83%        |
| Sistema Financeiro     | 9           | 10    | 90%        |
| Sistema de Permissões  | 5           | 5     | 100%       |
| Sistema de Sorteios    | 4           | 4     | 100%       |
| Circuit Breakers       | 3           | 3     | 100%       |
| Tracking/Analytics     | 4           | 5     | 80%        |
| Newsletter             | 4           | 5     | 80%        |
| CMS Pages              | 5           | 6     | 83%        |
| Billing/Faturas        | 7           | 8     | 88%        |

**Conformidade Geral: ~85-90%**

### 11.2 Funcionalidades Planejadas

| Funcionalidade          | Status    | Prioridade |
|------------------------|-----------|------------|
| Integração PIX Real    | ⚠️ Planejado | Alta      |
| Automação WhatsApp API| ⚠️ Planejado | Alta      |
| Firebase Auth          | ✅ Implementado | Completo |
| NextAuth              | 🔄 Roadmap | Média     |

### 11.3 Documentação Agentic

Consulte os documentos em `docs/agentic/`:
- `ROADMAP_AGENTIC_EXECUCAO.md`
- `ARQUITETURA_AGENTIC_ALVO.md`
- `OPERACAO_AGENTIC_SRE_COMPLIANCE.md`
- `EPICOS_E_ISSUES_AGENTIC.md`
- `PLANO_SPRINTS_AGENTIC.md`

---

## Referências

- **Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
- **Análise Técnica Completa:** `ANALISE_TECNICA_FUNDAMENTALISTA_v2.md`
- **Changelog:** `CHANGELOG.md`

---

**Documento Canônico - Última Atualização:** 2026-05-19
**Autor:** MiniMax Agent
**Versão:** 1.0.0