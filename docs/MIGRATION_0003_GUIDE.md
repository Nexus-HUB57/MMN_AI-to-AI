# Migration 0003 — Extensões do Domínio de Agentes

**Arquivo:** `database/migrations/0003_agent_extras.sql`
**Tabelas criadas:** `generated_images`, `recommended_products`, `agent_skills_runtime`, `agent_evolution_history`

---

## 1. O que esta migration faz

Cria as quatro tabelas necessárias para suportar os endpoints novos do `agentsRouter`:

| Tabela | Função | Endpoints relacionados |
|---|---|---|
| `generated_images` | Catálogo de imagens geradas pelos agentes | `agents.getGeneratedImages`, `agents.createGeneratedImage` |
| `recommended_products` | Produtos recomendados por agente | `agents.getRecommendedProducts`, `agents.createRecommendedProduct` |
| `agent_skills_runtime` | Skills adquiridas/ativas em runtime | `agents.getAgentSkills`, `agents.createAgentSkill`, `agents.updateAgentSkill` |
| `agent_evolution_history` | Trilha de auditoria das mudanças de skill | `agents.getEvolutionHistory` |

> Compatível com Postgres (que é o SGBD declarado em `.env.example`).
> ✅ O `infra/drizzle.config.ts` foi alinhado para reutilizar o `drizzle.config.ts` raiz,
> eliminando a discrepância anterior de dialect.

---

## 2. Aplicar em produção (Postgres no Render)

```bash
# 1. Defina a credencial
export DATABASE_URL="postgres://user:password@host:5432/database"

# 2. Aplicar manualmente (recomendado para esta migration .sql crua)
psql "$DATABASE_URL" -f database/migrations/0003_agent_extras.sql

# 3. Verificar
psql "$DATABASE_URL" -c "\dt generated_images recommended_products agent_skills_runtime agent_evolution_history"
```

Saída esperada: as 4 tabelas listadas com seus respectivos owners.

---

## 3. Aplicar via Drizzle (push)

Atualmente bloqueado porque o `drizzle.config.ts` aponta para dialect MySQL.
Antes de usar `npm run db:push`, ajustar o dialect para `postgresql`.

```bash
# Após corrigir o dialect no infra/drizzle.config.ts
export DATABASE_URL="postgres://..."
npm run db:push --workspace . --silent
```

---

## 4. Rollback

```sql
DROP TABLE IF EXISTS "agent_evolution_history";
DROP TABLE IF EXISTS "agent_skills_runtime";
DROP TABLE IF EXISTS "recommended_products";
DROP TABLE IF EXISTS "generated_images";
```

---

## 5. Validação pós-migration

```bash
# Testes que cobrem os endpoints novos (independem do DB real)
npx vitest run \
  tests/unit/agents.test.ts \
  tests/unit/agents.contracts.test.ts \
  tests/unit/agents.persistence.test.ts

# Smoke test contra o ambiente real (após deploy)
curl -X POST "$API_URL/api/trpc/agents.getRecommendedProducts" \
  -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" \
  -d '{}'
# Deve responder com array (vazio antes do primeiro insert)
```

---

## 6. Próximos passos sugeridos

1. Conciliar `drizzle.config.ts` (mysql → postgresql) para alinhar com o `.env.example`.
2. Adicionar seed inicial com 2-3 produtos recomendados de exemplo.
3. Habilitar índices adicionais conforme o uso real (ex.: filtro por `marketplace` + `relevanceScore`).
