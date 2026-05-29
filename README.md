# Nexus System AI-to-AI

**AI Affiliate Operating System** - Sistema operacional de afiliados impulsionado por agentes de IA autônomos.

> Transição de MMN (Marketing Multinível) para **AI-to-AI Infrastructure** - Uma infraestrutura operacional de agentes autônomos aplicados a marketing, vendas e operação distribuída.

## Visão do Projeto

O Nexus System AI-to-AI representa uma evolução fundamental no conceito de plataformas de afiliados:

- **Diferencial Principal**: O sistema não é apenas uma plataforma MMN tradicional, mas sim uma **infraestrutura operacional de agentes autônomos de IA** operando 24/7
- **Modelo Híbrido**: Intervenção humana propositiva + Agentes IA 100% autônomos no operacional
- **White-Label Ready**: Arquitetura preparada para licenciamento corporativo e multi-tenant

## Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + TanStack + Wouter
- **Mobile**: Expo + OAuth + Theme Provider
- **Backend**: Node.js + tRPC + Drizzle ORM
- **Database**: MySQL (Drizzle ORM)
- **Queue/Cache**: Redis + BullMQ
- **AI Runtime**: Google Genkit (Gemini) + OpenAI (GPT)
- **DevOps**: Docker + GitHub Actions

## Arquitetura

```
┌───────────────────────────────────────────────┐
│               FRONTEND LAYER                 │
├───────────────────────────────────────────────┤
│ React + Vite + Tailwind + TanStack + Wouter │
│ Expo Mobile + OAuth + Theme Provider        │
└───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│                tRPC GATEWAY                  │
├───────────────────────────────────────────────┤
│ Auth │ RBAC │ Circuit Breakers │ Validation │
└───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│              DOMAIN SERVICES                 │
├───────────────────────────────────────────────┤
│ MMN │ XP │ Billing │ Marketplace │ Agents   │
│ CMS │ Newsletter │ Finance │ Cron │ Packs   │
└───────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ MYSQL        │      │ REDIS + BULLMQ   │
│ DRIZZLE ORM  │      │ FILAS/WORKERS    │
└──────────────┘      └──────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ AGENTIC RUNTIME     │
                    ├─────────────────────┤
                    │ Gemini │ OpenAI     │
                    │ Memory │ Sessions   │
                    │ Skills │ Upgrades   │
                    └─────────────────────┘
```

## Funcionalidades Principais

### 1. Agentes IA Autônomos
- **Orquestração 24/7**: Agentes operando continuamente
- **Skills Customizáveis**: Sistema de upgrades e habilidades
- **Múltiplos Níveis**: De Agente Afiliado a IA Agêntica CEO

### 2. Sistema de Comissionamento
- **5 Níveis de Rede**: Comissões de 5% a 25%
- **XP System**: Evolução por pontos acumulativos
- **Plano de Carreira**: 17 níveis de progressão

### 3. Marketplace & Dropshipping
- **Integração Multi-Plataforma**: Mercado Livre, Shopee, Hotmart
- **Automação de Vendas**: Processamento automático
- **Comissões em Cascata**: Distribuição inteligente

### 4. White-Label Enterprise
- **Multi-Tenant**: Isolamento de dados por cliente
- **Branding Customizável**: Logos, cores, domínios
- **Licenciamento**: Planos Starter, Pro, Enterprise

## Packs de Agentes

O sistema oferece **15 packs progressionais** para desenvolvimento de agentes IA:

| Pack | Custo | XP | Características |
|------|-------|-----|----------------|
| A² (Básico) | R$10 | 1000XP | 1 Agente, 10 Ebooks, 2 Skills |
| A²II | R$30 | 3000XP | Upgrade, 30 Ebooks, 3 Skills |
| A²III | R$50 | 5000XP | Upgrade, 50 Ebooks, 5 Skills |
| AG (Preditivo) | R$250 | 25000XP | 250 Ebooks, 5 Skills, Rede 10 |
| AGII | R$500 | 50000XP | 500 Ebooks, 7 Skills, Rede 20 |
| AGIII | R$750 | 75000XP | 750 Ebooks, 10 Skills, Rede 30 |
| AGN (Generativo) | R$1000 | 100000XP | 1000 Ebooks, 12 Skills |
| AGNII | R$2000 | 200000XP | 2000 Ebooks, 14 Skills |
| AGNIII | R$3000 | 300000XP | 3000 Ebooks, 16 Skills |
| AO (Orquestrador) | R$5000 | 500000XP | 5000 Ebooks, Full Skills |
| AOII | R$10000 | 1000000XP | 10000 Ebooks, Expert+ |
| AOIII | R$20000 | 2000000XP | 20000 Ebooks, CEO Level |
| AA (Agêntica) | R$50000 | 5000000XP | 50000 Ebooks, Holding |
| AAII | R$100000 | 10000000XP | 100000 Ebooks, 21 Skills |
| AAIII | R$200000 | 20000000XP | 200000 Ebooks, Full Access |

## Como Iniciar

### 1. Preparação
```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI
npm install
```

### 2. Infraestrutura (Docker)
```bash
npm run infrastructure:up
```

### 3. Banco de Dados
```bash
npm run db:generate
npm run db:migrate
```

### 4. Variáveis de Ambiente
Configure `.env` com credenciais Google, OpenAI e URLs.

### 5. Execução
```bash
# Dashboard
npm run dev

# Genkit Worker & Orchestrator
npm run genkit:dev
```

## Roadmap de Desenvolvimento

| Fase | Descrição | Status |
|------|-----------|--------|
| Fase 1 | Harden MVP (Estabilização) | ✅ Concluída |
| Fase 2 | Reestruturação por Domínios | 🔄 Em Andamento |
| Fase 3 | Event Driven Architecture | 🔄 Em Andamento |
| Fase 4 | Agentic Runtime 2.0 | 🔄 Em Andamento |
| **Fase 5** | **AI Affiliate OS + White-Label** | 🔄 **Atual** |
| Fase 6 | Mobile Stabilization | 🔜 Próxima |
| Fase 7 | Data & Intelligence | 🔜 Próxima |
| Fase 8 | Compliance e Governança | 🔜 Próxima |
| Fase 9 | Expansão do Ecossistema | 🔜 Próxima |

## Oportunidade White-Label

A arquitetura do Nexus está preparada para licenciamento corporativo:

### Segmentos-Alvo
| Segmento | Potencial |
|----------|-----------|
| Seguros | Gigante |
| Imobiliário | Gigante |
| Educação | Gigante |
| Franquias | Gigante |
| Vendas diretas | Gigante |

### Funcionalidades
- Branding customizável por tenant
- Domínios próprios
- Billing separado
- API REST para licenciamento
- SLA customizado

## Avaliação Técnica

| Critério | Nota |
|----------|------|
| Arquitetura | 9.2/10 |
| Backend | 9.0/10 |
| Modularidade | 8.8/10 |
| Visão Sistêmica | 9.5/10 |
| Potencial de Mercado | 9.4/10 |
| Runtime IA | 8.9/10 |
| **Score Consolidado** | **8.9/10** |

## Documentação

- [Age.txt](docs/planning/Age.txt) - Análise técnica completa
- [ARCHITECTURE.md](docs/planning/ARCHITECTURE.md) - Documentação da arquitetura
- [FASE5_TRANSITION.md](docs/phases/FASE5_TRANSITION.md) - Documentação da Fase 5
- [Plano de Carreira](Fase%20Beta%20-%20Transição%20MMN) - Sistema de níveis e comissões

## Licença

Proprietary - Nexus-HUB57

---

**O diferencial do Nexus**: Não é apenas um MMN. É uma **infraestrutura operacional de agentes autônomos** que transforma afiliados em operadores de inteligência distribuída.