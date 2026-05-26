# Skills do Agente IA

Sistema completo de skills para agentes IA autônomos, organizado em 3 níveis de proficiência com **45 skills** no total.

## Estrutura de Níveis

### Básico (15 Skills)

Skills fundamentais para quem está começando no universo digital.

| # | Skill | Descrição | Preço |
|---|-------|-----------|-------|
| 1 | Copywriting Básico | Textos persuasivos para redes sociais | R$ 19,00/mês |
| 2 | Gestão de Redes Sociais | Calendário e agendamento | R$ 24,00/mês |
| 3 | Atendimento ao Cliente | Respostas automáticas | R$ 18,00/mês |
| 4 | Analytics Básico | Métricas e relatórios | R$ 15,00/mês |
| 5 | Criação de Conteúdo | Ideias e textos para posts | R$ 22,00/mês |
| 6 | E-mail Marketing | Newsletters e campanhas | R$ 20,00/mês |
| 7 | Landing Pages | Páginas de captura | R$ 26,00/mês |
| 8 | Gestão de Leads | CRM básico | R$ 17,00/mês |
| 9 | Link Tracking | Rastreamento de cliques | R$ 14,00/mês |
| 10 | Funil de Vendas | Conversão de leads | R$ 28,00/mês |
| 11 | Social Selling | Venda via redes sociais | R$ 23,00/mês |
| 12 | WhatsApp Copy | Mensagens persuasivas para WhatsApp | R$ 16,00/mês |
| 13 | Gestor de Agenda | Organização de agenda com reservas | R$ 15,00/mês |
| 14 | Criação de Imagens | Geração de imagens para posts | R$ 19,00/mês |
| 15 | Remarketing Básico | Recuperação de visitantes | R$ 21,00/mês |

### Intermediário (15 Skills)

Skills avançadas para profissionais com experiência.

| # | Skill | Descrição | Preço |
|---|-------|-----------|-------|
| 16 | Facebook Ads Intermediário | Campanhas segmentadas | R$ 49,00/mês |
| 17 | Crescimento no Instagram | Estratégias avançadas | R$ 44,00/mês |
| 18 | WhatsApp Business Pro | Automação de vendas | R$ 54,00/mês |
| 19 | SEO para Buscadores | Otimização para Google | R$ 39,00/mês |
| 20 | Dropshipping Operações | Gestão de dropshipping | R$ 64,00/mês |
| 21 | Copywriting para E-mail | Sequências de venda | R$ 36,00/mês |
| 22 | Video Marketing | Vídeos para marketing | R$ 42,00/mês |
| 23 | Marketing de Afiliados | Promoção de afiliados | R$ 48,00/mês |
| 24 | CRM Avançado | Gestão completa de clientes | R$ 56,00/mês |
| 25 | Lançamentos Digitais | Planejar lançamentos | R$ 62,00/mês |
| 26 | TikTok Ads | Campanhas no TikTok | R$ 43,00/mês |
| 27 | Gestão de Comunidade | Construção de comunidades | R$ 38,00/mês |
| 28 | Product Launch | Lançamento de novos produtos | R$ 52,00/mês |
| 29 | Hotmart Expert | Venda na Hotmart | R$ 45,00/mês |
| 30 | LinkedIn B2B | Prospecção B2B no LinkedIn | R$ 47,00/mês |

### Avançado (15 Skills)

Skills enterprise para especialistas e empresas.

| # | Skill | Descrição | Preço |
|---|-------|-----------|-------|
| 31 | Facebook Ads Master | ROAS máximo | R$ 89,00/mês |
| 32 | Google Ads Expert | Multi-plataforma | R$ 94,00/mês |
| 33 | E-commerce Completo | Loja virtual completa | R$ 124,00/mês |
| 34 | Marketplace Master | Multi-marketplaces | R$ 114,00/mês |
| 35 | Funil Enterprise | Vendas B2B complexas | R$ 149,00/mês |
| 36 | Mídia Paga Master | Multi-canais | R$ 109,00/mês |
| 37 | Automação Completa | IA e integrações | R$ 134,00/mês |
| 38 | Analytics Intelligence | ML e previsões | R$ 98,00/mês |
| 39 | Vendas Corporativas B2B | Alto ticket | R$ 159,00/mês |
| 40 | MMN Rede Master | Gestão de rede | R$ 119,00/mês |
| 41 | IA Agent Master | Agentes IA autônomos | R$ 189,00/mês |
| 42 | Growth Hacking Master | Experimentação e escala | R$ 129,00/mês |
| 43 | Data Driven Marketing | Marketing baseado em dados | R$ 139,00/mês |
| 44 | SaaS Marketing | Estratégias SaaS | R$ 144,00/mês |
| 45 | International Expansion | Expansão internacional | R$ 169,00/mês |

## Resumo por Nível

| Nível | Quantidade | Faixa de Preço |
|-------|------------|----------------|
| **Básico** | 15 Skills | R$ 14,00 - R$ 28,00 |
| **Intermediário** | 15 Skills | R$ 36,00 - R$ 64,00 |
| **Avançado** | 15 Skills | R$ 89,00 - R$ 189,00 |
| **TOTAL** | **45 Skills** | - |

## Categorias

- **Anúncios**: Facebook Ads, Google Ads, TikTok Ads, Mídia Paga
- **Redes Sociais**: Instagram, Gestão, Crescimento, Comunidade
- **E-commerce**: Loja virtual, Dropshipping, Marketplace
- **Automação**: WhatsApp, Agentes IA, Processos, Integração
- **CRM**: Gestão de leads, Pipeline, Vendas
- **Vendas**: Funis, Lançamentos, B2B, Social Selling
- **Analytics**: Métricas, Dashboards, ML, Data-driven
- **Copywriting**: Textos, E-mail, WhatsApp, Conteúdo
- **SEO**: Otimização, Buscadores
- **MMN**: Gestão de rede, Afiliados
- **B2B**: LinkedIn, Corporativas, Prospecção
- **Growth**: Growth Hacking, Product Launch
- **Internacional**: Expansão, Localização

## API tRPC

### Endpoints Públicos

```typescript
// Listar skills disponíveis
trpc.skills.listAvailable.query({
  level?: "basic" | "intermediate" | "advanced",
  category?: string,
  limit?: number,
  offset?: number
})

// Detalhes de uma skill
trpc.skills.getSkillDetails.query({ skillId: number })

// Listar categorias
trpc.skills.listCategories.query()
```

### Endpoints Protegidos (Usuário Logado)

```typescript
// Listar skills do meu agente
trpc.skills.listMySkills.query()

// Adquirir skill
trpc.skills.acquireSkill.mutation({
  skillId: number,
  proficiency?: "basic" | "intermediate" | "advanced" | "expert"
})

// Renovar skill
trpc.skills.renewSkill.mutation({ agentSkillId: number })

// Desativar skill
trpc.skills.deactivateSkill.mutation({ agentSkillId: number })

// Registrar uso
trpc.skills.logSkillUsage.mutation({
  agentSkillId: number,
  action: string,
  duration: number,
  success?: boolean,
  errorMessage?: string
})
```

### Endpoints Admin

```typescript
// Listar todas as skills (admin)
trpc.skills.listAll.query({
  level?: string,
  category?: string,
  status?: "active" | "inactive" | "coming_soon",
  page?: number,
  limit?: number
})

// Criar skill (admin)
trpc.skills.create.mutation({
  name: string,
  slug: string,
  description: string,
  level: "basic" | "intermediate" | "advanced",
  category: string,
  price: number,
  // ...outros campos
})

// Atualizar skill (admin)
trpc.skills.update.mutation({ id: number, ...campos })

// Deletar skill (admin)
trpc.skills.delete.mutation({ id: number })

// Estatísticas (admin)
trpc.skills.getStats.query()
```

## Arquivos Principais

- `database/schemas/schema-skills.ts` - Schema do banco de dados
- `backend/src/routers/skillsRouter.ts` - Router tRPC
- `frontend/src/pages/SkillsMarketplace.tsx` - Página do marketplace
- `backend/src/services/seedSkills.ts` - Seed data das 45 skills

## Seed de Dados

Para popular o banco com as 45 skills:

```bash
cd backend
npx tsx src/services/seedSkills.ts
```

## Integração com Packs

O sistema de Skills é complementar ao sistema de Packs existente:

- **Packs**: Pacotes maiores com múltiplas funcionalidades
- **Skills**: Habilidades individuais especializadas

Um agente pode adquirir tanto Packs quanto Skills, mixando funcionalidades conforme sua estratégia.

---

**Autor:** MiniMax Agent
**Última Atualização:** 2026-05-26
**Total de Skills:** 45 (15 Basic + 15 Intermediate + 15 Advanced)