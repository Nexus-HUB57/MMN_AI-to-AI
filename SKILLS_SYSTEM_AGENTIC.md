# Sistema de Skills Agentic (v2)

Este documento descreve a nova infraestrutura agentic implementada no repositório MMN_AI-to-AI.

## Arquitetura Agentic

A nova estrutura eleva as skills de simples funções operacionais para agentes autônomos com capacidades de:

1.  **Reasoning (Raciocínio):** Cada execução agora gera um `reasoningTrace`, permitindo auditar o "pensamento" do agente.
2.  **Memory (Memória):** Integração com `MemoryManager` para persistência episódica e recuperação de contexto.
3.  **Planning (Planejamento):** Suporte a `Planner` para decomposição de tarefas complexas em múltiplos passos.
4.  **Tools (Ferramentas):** Capacidade de invocar outras skills ou ferramentas externas dinamicamente.
5.  **Reflection (Reflexão):** Loop de auto-crítica via `Reflector` para otimização de saídas.
6.  **Metrics (Métricas):** Rastreamento granular de performance e qualidade via `MetricsTracker`.

## Skills Refatoradas

As seguintes skills principais foram elevadas para o padrão Agentic v2:

| Skill | Capacidades Implementadas |
| :--- | :--- |
| **Copywriter Persuasivo** | Reasoning Trace, Memory Retrieval/Storage, Reflection |
| **Judge Revisor** | Reasoning Trace, LLM Feedback Loop, Metrics |
| **Prospecção Outbound** | Multi-step Planning, Tool Use (Lead Enrichment), Metrics |
| **Fraud Detector** | Multi-signal Analysis, Reasoning Trace, Escalation Logic |
| **ROI Attributor** | Causal Reasoning, Reflection, Analytics Metrics |

## Como Implementar Novas Skills Agentic

Para criar uma nova skill no padrão v2, utilize a interface `SkillHandler` atualizada:

```typescript
export const myNewSkillHandler: SkillHandler<Input, Output> = {
  // ...
  execute: async (input, context) => {
    // 1. Usar memória para contexto
    const history = await context.memory.retrieve(...);
    
    // 2. Registrar passos de raciocínio
    const trace = [{ thought: "Iniciando..." }];
    
    // 3. Executar lógica com ferramentas
    if (context.tools['other-skill']) {
       await context.tools['other-skill'].execute(...);
    }
    
    // 4. Refletir sobre o resultado
    const reflection = await context.reflector.reflect(...);
    
    return {
      // ... output com reasoningTrace e reflection
    };
  }
};
```

## Próximos Passos

- [ ] Refatorar as 22 skills restantes para o padrão v2.
- [ ] Implementar provedores concretos para `MemoryManager` (ex: Redis/VectorDB).
- [ ] Integrar `reasoningTrace` na UI do operador para transparência total.
