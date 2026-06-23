# Sprint 6 — Agente IA Vivo

## Resumo
Resolve o bug crítico `Cannot read properties of undefined (reading 'createPlan')`
que impedia execução real das skills, e adiciona painel ao vivo do Agente IA
no Dashboard e na página /agents.

## Backend

### agenticCoreImpls.ts (novo, 6.2 KB)
Implementações in-memory dos abstratos do agenticCore:
- **inMemoryMemoryManager** — store curto-prazo (TTL 30 min) + longo-prazo (10k entries)
- **inMemoryMetricsTracker** — rotação 1h
- **templatePlanner** — gera PlanStep[] a partir de templates por keyword:
  - prospect/outbound/lead → 6 passos
  - copy/conteúdo → 5 passos
  - publish → 5 passos
  - trend → 4 passos
  - enrich → 4 passos
  - fallback genérico → 5 passos
- **noopReflector** — observa sem agir
- **buildAgenticContextDefaults()** — bundle pronto para spread

### agentSkillsRuntimeRouter.ts (patch)
- Import: `buildAgenticContextDefaults` from agenticCoreImpls
- Spread em `const context = { ...buildAgenticContextDefaults(), ... }`
- Marker: AGENTIC_CONTEXT_DEFAULTS_V2

## Frontend

### AgentLivePanel.tsx (novo, 12 KB)
Componente reutilizável com 4 sub-componentes:

1. **StatusCard** — header com ícone do Agente, badge MODO AUTÔNOMO/MANUAL,
   contagem de skills operacionais, pulse verde quando auto-pilot ativo
2. **SkillRunner** — 4 botões prontos (Detectar Tend, Prospectar, Enriquecer,
   Publicar) com payloads válidos pré-configurados
3. **ExecutionHistory** — timeline das últimas 8 execuções com refetch 20s
4. **AutoPilotToggle** — switch on/off com persistência em
   `nexus_agent_autopilot_v1` (localStorage)

Variantes: `full` (com runners + history) e `compact` (só header).

### Injeção
- `/agents` (AgentDashboard) — variant=full
- `/dashboard` (Dashboard) — variant=compact

## Validação E2E

Teste real executado em produção via curl:

\`\`\`json
POST /api/trpc/agentSkillsRuntime.execute
{
  "slug": "detector-tendencias",
  "input": { "signals": [...], "horizonDays": 30 },
  "autonomyAllowed": true
}
\`\`\`

Resposta (success=true!):
\`\`\`json
{
  "executionId": "ce9200ab-9716-4d29-9d35-6a0f9e5fb98a",
  "skill": "detector-tendencias",
  "success": true,
  "decision": "needs_review",
  "latencyMs": 0,
  "output": {
    "trends": [{ "title": "Boom Agentes IA Brasil", "score": 78, "band": "quente", ... }],
    "topTrend": { ... },
    "outreachOpportunities": [{ "suggestedChannel": "instagram" }],
    "reasoningTrace": [ ... 3 thoughts ],
    "reflection": { "timestamp": "...", "observation": "...", ... }
  }
}
\`\`\`

## Build
- Backend: dist/index.js 1.3 MB · 82ms
- Frontend: index-DupfLJE6.js 981.22 KB
- TSC: 0 erros
- HTTP smoke: 5/5 rotas em 200

## Features confirmadas no bundle
- "Seu Agente IA" ×2
- "MODO AUTÔNOMO" ×1
- "MODO MANUAL" ×1
- "Auto-pilot" ×2
- "skills operacionais" ×2
- "Execute uma skill" ×1
- "Detectar Tend" ×1
- "Prospectar Leads" ×2

