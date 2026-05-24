# Agentic AI Layer - Nexus System AfilIAte-AI

**Versão:** 1.0.0
**Data:** 2026-05-24
**Maturidade:** Stage 2 (Production-Ready Core)

---

## 1. Visão Geral

A camada **Agentic AI** do Nexus System AfilIAte-AI implementa um sistema de agentes autônomos capazes de executar tarefas operacionais de marketing multinível com mínima intervenção humana. O sistema é baseado em um grafo de workflow stateful com LLMas-Judge para controle de qualidade.

### 1.1 Objetivos

- **Autonomia Operacional:** Agentes executam tarefas de marketing (posts, convites, prospecção) automaticamente
- **Qualidade Garantida:** LLM-as-Judge avalia cada output antes de execução
- **Memória Persistente:** Vector memory store contexto e aprendizados
- **Auditoria Completa:** Todo o ciclo de vida do agente é rastreável
- **Resiliência:** Circuit breaker e retry logic para operações robustas

---

## 2. Arquitetura

### 2.1 Componentes Principais

```
backend/src/agentic/
├── agents/
│   ├── baseAgent.ts        # Classe base abstrata do agente
│   └── marketingAgent.ts    # Implementação específica para marketing
├── tools/
│   ├── instagramTool.ts    # Tool para Instagram
│   └── whatsappTool.ts     # Tool para WhatsApp
├── graph.ts                # Definição do workflow graph
├── types.ts                # Definições de tipos TypeScript
├── marketingOrchestrator.ts # Orquestrador central
├── queue.ts                # Integração BullMQ
├── audit.ts                # Camada de auditoria
├── checkpointer.ts         # Persistência de estado
├── memory/
│   └── vectorMemory.ts     # Armazenamento vetorial
├── judge/
│   └── llmJudge.ts         # LLM-as-Judge implementation
├── resilience/
│   └── (circuit breaker, retry)
├── persistence/
│   └── index.ts           # Camada de persistência
└── repository.ts           # Data access layer
```

### 2.2 Workflow Graph

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐
│ Brief   │───▶│ Memory  │───▶│ Draft   │───▶│ Judge   │───▶│   Preview   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────────┘
     │              │              │              │
     │              │              │              ▼
     │              │              │         ┌─────────┐
     └──────────────┴──────────────┴────────▶│ Publish │
                                             └─────────┘
```

**Nodes do Grafo:**
1. **Brief:** Consolida objetivo, público-alvo e oferta da campanha
2. **Memory:** Recupera aprendizados e contexto recente do agente
3. **Draft:** Gera copy inicial no canal escolhido
4. **Judge:** Avalia qualidade, clareza e aderência à oferta
5. **Preview:** Produz preview operacional para Instagram ou WhatsApp

---

## 3. API tRPC

### 3.1 Endpoints

```typescript
// Listar sessões ativas
agentic.listSessions(limit?: number): AgenticSession[]

// Obter detalhes de uma sessão
agentic.getSession(sessionId: string): AgenticSessionDetail

// Criar nova sessão de marketing
agentic.createSession(input: CreateSessionInput): AgenticSession

// Executar sessão (processar workflow)
agentic.runSession(sessionId: string): AgenticSession

// Criar e executar campanha completa
agentic.launchCampaign(input: CampaignInput): AgenticSession

// Buscar memórias do agente
agentic.searchMemories(query: string, sessionId?: string, limit?: number): AgentMemoryRecord[]

// Monitor de métricas do orchestrator
agentic.getMonitor(limit?: number): OrchestratorMonitor
```

### 3.2 Runtime do Agente (Camada de Execução)

```typescript
// Perfil consolidado do agente
agentRuntime.getProfile(): AgentProfile

// Geração de conteúdo unificada
agentRuntime.generate(input: GenerateInput): GeneratedContent

// Geração em lote (múltiplas variações)
agentRuntime.generateBatch(input: BatchInput): BatchResult

// Ajustar performance score
agentRuntime.bumpPerformance(delta: number): PerformanceUpdate

// Registrar ação externa
agentRuntime.registerAction(action: string, metadata?: object): void
```

---

## 4. Tipos de Dados

### 4.1 AgenticSession

```typescript
interface AgenticSession {
  id: string;
  userId?: number;
  goal: string;
  audience: string;
  offer: string;
  channel: "instagram" | "whatsapp";
  status: "planned" | "queued" | "running" | "completed" | "failed";
  plan: string[];
  summary?: string;
  qualityScore: number;
  latestDraft?: MarketingDraft;
  lastActionId?: string;
  checkpoints: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### 4.2 MarketingDraft

```typescript
interface MarketingDraft {
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone: string;
  channel: "instagram" | "whatsapp";
}
```

### 4.3 JudgeResult

```typescript
interface JudgeResult {
  score: number;           // 0-100
  verdict: "pass" | "revise" | "fail";
  reasoning: string;
  rubric: Record<string, number>;
}
```

---

## 5. Pipeline de Execução

### 5.1 Ciclo de Vida

```
1. createSession()
   └── Cria sessão com brief, audience, offer
   └── Persiste em memória + database
   └── Define workflow plan

2. runSession()
   └── Coloca sessão em fila (queued)
   └── Executa nodes do grafo sequencialmente
   └── Para cada node:
       ├── Executa tool correspondente
       ├── Armazena checkpoint
       ├── Invoca LLM Judge se aplicável
       └── Atualiza qualidade score

3. Judge Evaluation
   └── LLM avalia output do draft
   └── Score: 0-100
   └── Verdict: pass (≥70), revise (50-69), fail (<50)
   └── Se fail: marca sessão como failed
   └── Se revise: permite regeneração

4. Completion
   └── Persiste resultado final
   └── Atualiza métricas do agente
   └── Notifica usuário via webhook/event
```

### 5.2 Tool Execution

```typescript
interface ToolExecutionInput {
  sessionId: string;
  goal: string;
  audience: string;
  offer: string;
  brandVoice?: string;
  constraints?: string[];
  cta?: string;
}

interface ToolExecutionOutput {
  success: boolean;
  toolName: string;
  draft: MarketingDraft;
  previewUrl: string;
  warnings: string[];
  metadata?: Record<string, unknown>;
}
```

---

## 6. Camada Agent Runtime

O **Agent Runtime** é a camada de execução que conecta o agente do usuário às suas skills/upgrades ativos com o LLM em um único pipeline.

### 6.1 Content Strategy

O agente respeita a estratégia de conteúdo configurada:

```typescript
interface ContentStrategy {
  platforms?: string[];        // ["instagram", "whatsapp", "facebook"]
  postingFrequency?: string;  // "hourly", "daily", "weekly"
  tone?: "professional" | "casual" | "persuasive" | "humorous";
  targetAudience?: string;
}
```

### 6.2 Upgrades Ativos

O agente pode ter múltiplos upgrades/slots ativos que determinam suas capacidades:

- **Agent Upgrades:** Habilidades específicas (copywriting, design, etc.)
- **Packs:** Pacotes de funcionalidades adquiridos no marketplace
- **Skills:** Capacidades treinadas do modelo

---

## 7. Resiliência

### 7.1 Circuit Breaker

```typescript
// Configuração por default
{
  failureThreshold: 5,      // Falhas antes de abrir
  resetTimeout: 30000,     // ms antes de tentar novamente
  halfOpenRequests: 3,    // requests para decidir estado
}
```

### 7.2 Retry Logic

- Retry automático com exponential backoff
- Máximo de 3 tentativas por operação
- Dead letter queue para falhas persistentes

### 7.3 Checkpointing

Cada estado do agente é checkpointado para:
- Recovery após falhas
- Auditoria de decisões
- Replay de sessões

---

## 8. Monitoramento

### 8.1 Métricas Coletadas

- Sessions ativas/concluídas/falhas
- Quality score médio
- Tempo médio de execução por node
- Taxa de Judge pass/revise/fail
- Latência de LLM invocations

### 8.2 Dashboard

Via `agentic.getMonitor()`:

```typescript
interface OrchestratorMonitor {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  failedSessions: number;
  averageQualityScore: number;
  averageLatencyMs: number;
  recentSessions: AgenticSession[];
}
```

---

## 9. Roadmap Agentic

### 9.1 Implementado (v1.1.0)

- [x] MarketingOrchestrator core
- [x] Workflow graph (brief → memory → draft → judge → preview)
- [x] Instagram + WhatsApp tools
- [x] LLM-as-Judge
- [x] Vector memory
- [x] Audit trail
- [x] Circuit breaker
- [x] Checkpointing
- [x] Agent Runtime layer
- [x] tRPC endpoints

### 9.2 Em Desenvolvimento

- [ ] Multi-channel orchestration (TikTok, Telegram)
- [ ] Fine-tuned models (mmn-copywriting-v1, mmn-strategy-v1)
- [ ] Real-time agent monitoring dashboard
- [ ] Webhook notifications para completion

### 9.3 Planejado

- [ ] Autonomous prospecting agent
- [ ] Dynamic audience segmentation
- [ ] A/B testing de campanhas
- [ ] Multi-tenant agent isolation

---

## 10. Referências

- [Roadmap Agentic](agentic/ROADMAP_AGENTIC_v1.2.0.md)
- [Plano de Sprints](agentic/PLANO_SPRINTS_AGENTIC.md)
- [Épicos e Issues](agentic/EPICOS_E_ISSUES_AGENTIC.md)
- [Arquitetura Alvo](agentic/ARQUITETURA_AGENTIC_ALVO.md)
- [SRE Compliance](agentic/OPERACAO_AGENTIC_SRE_COMPLIANCE.md)

---

## 11. Autores e Manutenção

**Autor:** MiniMax Agent (PHD Engineering)
**Mantido por:** Nexus-HUB57 Team
**Última Atualização:** 2026-05-24
**Versão da Documentação:** 1.0.0

---

## 12. Contribuição

Para contribuir com a camada Agentic:

1. Revise o [Roadmap Agentic](agentic/ROADMAP_AGENTIC_v1.2.0.md)
2. Verifique issues abertas com label `agentic`
3. Siga os padrões de código em `backend/src/agentic/`
4. Adicione testes unitários para novas funcionalidades
5. Atualize esta documentação quando aplicável