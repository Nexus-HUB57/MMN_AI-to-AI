# Skills do Agente IA

Sistema completo de skills para agentes IA autônomos, organizado em 3 níveis de proficiência.

## Estrutura de Níveis

### Básico (10 Skills)
Skills fundamentais para quem está começando no universo digital.

| Skill | Descrição | Preço |
|-------|-----------|-------|
| Copywriting Básico | Textos persuasivos para redes sociais | R$ 19,00/mês |
| Gestão de Redes Sociais | Calendário e agendamento | R$ 24,00/mês |
| Atendimento ao Cliente | Respostas automáticas | R$ 18,00/mês |
| Analytics Básico | Métricas e relatórios | R$ 15,00/mês |
| Criação de Conteúdo | Ideias e textos para posts | R$ 22,00/mês |
| E-mail Marketing | Newsletters e campanhas | R$ 20,00/mês |
| Landing Pages | Páginas de captura | R$ 26,00/mês |
| Gestão de Leads | CRM básico | R$ 17,00/mês |
| Link Tracking | Rastreamento de cliques | R$ 14,00/mês |
| Funil de Vendas | Conversão de leads | R$ 28,00/mês |

### Intermediário (10 Skills)
Skills avançadas para profissionais com experiência.

| Skill | Descrição | Preço |
|-------|-----------|-------|
| Facebook Ads Intermediário | Campanhas segmentadas | R$ 49,00/mês |
| Crescimento no Instagram | Estratégias avançadas | R$ 44,00/mês |
| WhatsApp Business Pro | Automação de vendas | R$ 54,00/mês |
| SEO para Buscadores | Otimização para Google | R$ 39,00/mês |
| Dropshipping Operações | Gestão de dropshipping | R$ 64,00/mês |
| Copywriting para E-mail | Sequências de venda | R$ 36,00/mês |
| Video Marketing | Vídeos para marketing | R$ 42,00/mês |
| Marketing de Afiliados | Promoção de afiliados | R$ 48,00/mês |
| CRM Avançado | Gestão completa de clientes | R$ 56,00/mês |
| Lançamentos Digitais | Planejar lançamentos | R$ 62,00/mês |

### Avançado (10 Skills)
Skills enterprise para especialistas e empresas.

| Skill | Descrição | Preço |
|-------|-----------|-------|
| Facebook Ads Master | ROAS máximo | R$ 89,00/mês |
| Google Ads Expert | Multi-plataforma | R$ 94,00/mês |
| E-commerce Completo | Loja virtual completa | R$ 124,00/mês |
| Marketplace Master | Multi-marketplaces | R$ 114,00/mês |
| Funil Enterprise | Vendas B2B complexas | R$ 149,00/mês |
| Mídia Paga Master | Multi-canais | R$ 109,00/mês |
| Automação Completa | IA e integrações | R$ 134,00/mês |
| Analytics Intelligence | ML e previsões | R$ 98,00/mês |
| Vendas Corporativas B2B | Alto ticket | R$ 159,00/mês |
| MMN Rede Master | Gestão de rede | R$ 119,00/mês |

## Categorias

- **Anúncios**: Facebook Ads, Google Ads, Mídia Paga
- **Redes Sociais**: Instagram, Gestão, Crescimento
- **E-commerce**: Loja virtual, Dropshipping, Marketplace
- **Automação**: WhatsApp, Processos, Integração
- **CRM**: Gestão de leads, Pipeline, Vendas
- **Vendas**: Funis, Lançamentos, B2B
- **Analytics**: Métricas, Dashboards, ML
- **Copywriting**: Textos, E-mail, Conteúdo
- **SEO**: Otimização, Buscadores
- **MMN**: Gestão de rede, Afiliados

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
- `backend/src/services/seedSkills.ts` - Seed data das skills

## Seed de Dados

Para popular o banco com as 30 skills:

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
**Última Atualização:** 2026-05-22