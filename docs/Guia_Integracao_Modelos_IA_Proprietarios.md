# Guia de Integração para Modelos de IA Proprietários no MMN AI-to-AI

**Autor:** Manus AI
**Data:** 08 de Maio de 2026

Este guia técnico detalha o processo de integração e gerenciamento de modelos de Inteligência Artificial proprietários no sistema MMN AI-to-AI, com foco no arquivo `llm-v2.ts` e nas melhores práticas para expansão das capacidades de IA.

## 1. Visão Geral do Serviço LLM (`llm-v2.ts`)

O arquivo `backend/src/services/llm-v2.ts` é o coração da orquestração de modelos de Linguagem Grande (LLM) no sistema MMN AI-to-AI. Ele implementa um mecanismo de roteamento dinâmico que permite ao sistema utilizar diferentes provedores e modelos de IA, sejam eles externos (como OpenAI) ou proprietários (desenvolvidos internamente ou hospedados localmente).

### 1.1. Arquitetura de Roteamento

A função `invokeLLM` atua como um *proxy*, recebendo requisições e direcionando-as para o modelo de IA apropriado com base no `modelType` especificado. Caso um modelo proprietário não esteja disponível ou seja desconhecido, o sistema pode fazer um *fallback* para um modelo genérico da OpenAI, garantindo a continuidade do serviço [1].

## 2. Registro e Configuração de Modelos

O `llm-v2.ts` mantém um `modelRegistry`, um objeto que mapeia `ModelType` (identificadores únicos para cada modelo) para suas respectivas `ModelConfig` (configurações). Esta configuração define o provedor, o ID do modelo, parâmetros como `maxTokens` e `temperature`, e o status de `isAvailable`.

### 2.1. `ModelType` e `ModelProvider`

| Tipo | Descrição | Exemplos de `ModelType` | `ModelProvider` |
| :--- | :--- | :--- | :--- |
| **OpenAI** | Modelos fornecidos pela API da OpenAI. | `gpt-4.1-mini` | `openai` |
| **Proprietário** | Modelos desenvolvidos internamente, fine-tuned ou hospedados localmente. | `mmn-copywriting-v1`, `mmn-strategy-v1`, `llama-2`, `mistral` | `proprietary` |
| **Fallback** | Modelo genérico usado quando o modelo primário não está disponível. | (Implícito, geralmente `gpt-4.1-mini`) | `fallback` |

### 2.2. `ModelConfig`

Cada entrada no `modelRegistry` possui a seguinte estrutura:

```typescript
interface ModelConfig {
  provider: ModelProvider; // Provedor do modelo (openai, proprietary, fallback)
  modelId: string;       // ID único do modelo
  maxTokens?: number;    // Limite máximo de tokens para a resposta
  temperature?: number;  // Criatividade do modelo (0.0 a 1.0)
  isAvailable: boolean;  // Indica se o modelo está pronto para uso
}
```

**Exemplo de Registro:**

```typescript
const modelRegistry: Record<ModelType, ModelConfig> = {
  "gpt-4.1-mini": {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: true,
  },
  "mmn-copywriting-v1": {
    provider: "proprietary",
    modelId: "mmn-copywriting-v1",
    maxTokens: 2048,
    temperature: 0.8,
    isAvailable: false, // Será ativado após fine-tuning
  },
  "mmn-strategy-v1": {
    provider: "proprietary",
    modelId: "mmn-strategy-v1",
    maxTokens: 3000,
    temperature: 0.6,
    isAvailable: false, // Será ativado após fine-tuning
  },
  "llama-2": {
    provider: "proprietary",
    modelId: "llama-2-70b",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: false, // Requer hospedagem própria
  },
  "mistral": {
    provider: "proprietary",
    modelId: "mistral-7b",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: false, // Requer hospedagem própria
  },
};
```

## 3. Ativação de Modelos Proprietários Existentes

Os modelos proprietários `mmn-copywriting-v1` e `mmn-strategy-v1` já estão definidos no `modelRegistry`, mas com `isAvailable: false`. Para ativá-los após a conclusão do *fine-tuning* ou da configuração de hospedagem, siga os passos:

1.  **Localize o arquivo:** Abra `backend/src/services/llm-v2.ts`.
2.  **Altere `isAvailable`:** No objeto `modelRegistry`, localize a entrada do modelo desejado (ex: `"mmn-copywriting-v1"`) e altere a propriedade `isAvailable` de `false` para `true`.

    ```typescript
    "mmn-copywriting-v1": {
      provider: "proprietary",
      modelId: "mmn-copywriting-v1",
      maxTokens: 2048,
      temperature: 0.8,
      isAvailable: true, // Alterar para true
    },
    ```

3.  **Reimplante o Backend:** Após a alteração, o backend do sistema deve ser reimplantado para que a nova configuração seja carregada.

Uma vez ativado, o sistema começará a rotear requisições para este modelo quando `modelType: "mmn-copywriting-v1"` for especificado nas chamadas `invokeLLM`.

## 4. Integração de Novos Modelos Proprietários

Para integrar um novo modelo de IA proprietário (ex: um modelo Llama-2 hospedado localmente ou via API de terceiros), o processo envolve três etapas principais:

### 4.1. Adicionar ao `modelRegistry`

Primeiro, adicione uma nova entrada ao `modelRegistry` em `llm-v2.ts`:

```typescript
const modelRegistry: Record<ModelType, ModelConfig> = {
  // ... modelos existentes
  "seu-novo-modelo": {
    provider: "proprietary",
    modelId: "seu-novo-modelo",
    maxTokens: 8192, // Ajuste conforme o modelo
    temperature: 0.7, // Ajuste conforme o modelo
    isAvailable: false, // Defina como true após a implementação da invocação
  },
};
```

### 4.2. Estender `invokeProprietaryModel`

A função `invokeProprietaryModel` é o ponto de extensão para lidar com a lógica de invocação de modelos proprietários. Atualmente, ela retorna um erro de *placeholder*. Você precisará modificar esta função para incluir a lógica de chamada para o seu novo modelo.

```typescript
async function invokeProprietaryModel(
  messages: any[],
  response_format: any,
  modelConfig: ModelConfig
): Promise<LLMResponse> {
  console.log(
    `[LLM] Invocando modelo proprietário: ${modelConfig.modelId}`
  );

  // Placeholder: Por enquanto, retorna um erro indicando que o modelo não está pronto
  throw new Error(
    `Modelo proprietário ${modelConfig.modelId} ainda não está disponível. ` +
      `Aguardando conclusão do fine-tuning.`
  );

  // Implementação futura:
  // switch (modelConfig.modelId) {
  //   case "mmn-copywriting-v1":
  //     return invokeFineTunedOpenAI(messages, response_format, modelConfig);
  //   case "llama-2-70b":
  //     return invokeLlamaViaReplicate(messages, response_format, modelConfig);
  //   case "mistral-7b":
  //     return invokeMistralViaTogether(messages, response_format, modelConfig);
  //   default:
  //     throw new Error(`Modelo proprietário desconhecido: ${modelConfig.modelId}`);
  // }
}
```

**Considerações para `invokeProprietaryModel`:**

*   **APIs Externas:** Para modelos hospedados em serviços como Replicate, Together AI, ou mesmo instâncias fine-tuned da OpenAI, você fará chamadas HTTP para seus respectivos endpoints. Certifique-se de gerenciar chaves de API de forma segura (via variáveis de ambiente, por exemplo).
*   **Modelos Locais:** Se o modelo estiver hospedado localmente (ex: Llama-2 rodando em um servidor dedicado), você pode chamar um endpoint interno ou um serviço que interaja com o modelo.
*   **Formato de Resposta:** Adapte a extração do `content` e `tokensUsed` da resposta do seu modelo para o formato `LLMResponse` esperado.

### 4.3. Atualizar `isAvailable` e Reimplantar

Após implementar a lógica de invocação em `invokeProprietaryModel` e testá-la, altere `isAvailable: false` para `true` na entrada do seu novo modelo no `modelRegistry`. Em seguida, reimplante o backend.

## 5. Utilização no Sistema

Outras partes do backend, como `contentGenerationRouter.ts`, invocam o serviço LLM através da função `invokeLLM`. Para utilizar um modelo proprietário, basta especificar o `modelType` desejado:

```typescript
import { invokeLLM } from "../services/llm-v2";

// ... dentro de uma função ou rota tRPC

const response = await invokeLLM({
  messages: [
    { role: "system", content: "Você é um especialista em copywriting." },
    { role: "user", content: "Crie um slogan para um produto de MMN." },
  ],
  modelType: "mmn-copywriting-v1", // Especifica o modelo proprietário
});

const generatedContent = response.content;
```

## 6. Gerenciamento de Status e Fallback

O `llm-v2.ts` inclui funções para gerenciar o status de disponibilidade dos modelos:

*   `getModelStatus()`: Retorna o status atual de todos os modelos.
*   `activateProprietaryModel(modelType: ModelType)`: Ativa um modelo proprietário.
*   `deactivateModel(modelType: ModelType)`: Desativa um modelo.

Essas funções podem ser úteis para ferramentas de monitoramento ou para desativar modelos temporariamente em caso de problemas. O mecanismo de `fallbackToGeneric = true` (padrão em `invokeLLM`) garante que, se um modelo proprietário solicitado não estiver disponível, a requisição será automaticamente redirecionada para `gpt-4.1-mini`, evitando interrupções no serviço.

## 7. Referências

[1] `backend/src/services/llm-v2.ts` (Inspeção Direta do Código-Fonte do Repositório MMN AI-to-AI).
