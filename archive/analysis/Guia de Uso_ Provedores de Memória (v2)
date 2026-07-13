# Guia de Uso: Provedores de Memória (v2)

Este guia descreve como utilizar os novos provedores de memória implementados no sistema agentic: **RedisMemoryManager** e **VectorMemoryManager**.

---

## 1. Introdução

Os provedores de memória permitem que o agente armazene e recupere informações de execuções passadas, melhorando a continuidade e o contexto das decisões.

- **RedisMemoryManager**: Ideal para busca rápida por palavras-chave e armazenamento de curto/médio prazo.
- **VectorMemoryManager**: Ideal para busca semântica (baseada em significado) e recuperação de contexto complexo.

---

## 2. Como Inicializar

Os provedores devem ser instanciados e passados para o `SkillExecutionContext`.

### Exemplo com Redis
```typescript
import { RedisMemoryManager } from './agentic/skills/providers/RedisMemoryManager';

const redisMemory = new RedisMemoryManager();
// O contexto agora terá acesso à memória via Redis
const context = {
  // ... outros campos
  memory: redisMemory,
};
```

### Exemplo com Vector (Busca Semântica)
```typescript
import { VectorMemoryManager } from './agentic/skills/providers/VectorMemoryManager';

const vectorMemory = new VectorMemoryManager();
const context = {
  // ... outros campos
  memory: vectorMemory,
};
```

---

## 3. Operações Básicas dentro de uma Skill

Dentro do método `execute` de uma skill, você pode interagir com a memória da seguinte forma:

### Armazenar Informação
```typescript
await context.memory.store({
  timestamp: new Date(),
  content: "O usuário prefere tons de voz mais informais em campanhas de WhatsApp.",
  type: 'episodic',
  relatedSkills: ['copywriter-persuasivo']
});
```

### Recuperar Informação
```typescript
const memories = await context.memory.retrieve("preferências de tom de voz", 3);
if (memories.length > 0) {
  console.log("Contexto recuperado:", memories[0].content);
}
```

---

## 4. Melhores Práticas

1.  **Tipagem de Memória**: Use o tipo `episodic` para eventos específicos e `declarative` para fatos ou configurações permanentes.
2.  **Limitação de Resultados**: Sempre passe um `limit` ao recuperar memórias para evitar sobrecarga de contexto no LLM.
3.  **Tags de Skill**: Sempre preencha o campo `relatedSkills` para que as buscas possam ser filtradas por domínio de conhecimento no futuro.

---

## 5. Próximos Passos

Atualmente, as implementações são simuladas para ambiente de desenvolvimento. Para produção:
- Configurar a string de conexão do Redis em `RedisMemoryManager`.
- Integrar uma API de Embeddings (ex: OpenAI) no `VectorMemoryManager`.
