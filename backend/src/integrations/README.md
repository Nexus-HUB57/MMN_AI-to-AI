# Modulo de Integracoes - Nexus Partners Pack

## Visao Geral

Este modulo implementa a camada de integracao para bibliotecas de IA externas, conforme analise de viabilidade documentada em [`docs/INTEGRATION_FEASIBILITY_ANALYSIS.md`](../../docs/INTEGRATION_FEASIBILITY_ANALYSIS.md).

## Bibliotecas Integradas

### LangChain

**Status:** Implementado
**Prioridade:** ALTA

Modulo de integracao para o framework LangChain, fornecendo:

- **Chain Adapter** (`langchain/chain-adapter.ts`)
  - Pipeline de geracao de conteudo multi-etapa
  - Chain de analise de tendencias
  - Factory para criacao de chains customizados

- **Tool Adapter** (`langchain/tool-adapter.ts`)
  - Conversao dos 8 handlers de skills em Tools LangChain
  - Registry de tools Nexus
  - Suporte para copywriter, detector de tendencias, auto-publisher, judge-revisor, prospeccao outbound, follow-up strategist, analytics-reporter e audience-segmenter

- **Retriever Adapter** (`langchain/retriever-adapter.ts`)
  - Vector stores em memoria e conectores para PGVector, Qdrant, Chroma
  - Pipeline RAG para busca semantica
  - Registry de vector stores

- **Memory Adapter** (`langchain/memory-adapter.ts`)
  - Gerenciamento de contexto conversacional
  - Memory agentic para persistencia de estado
  - Strategy memory para aprendizado de estrategias

### Ollama

**Status:** Implementado
**Prioridade:** ALTA

Modulo de integracao para execucao de LLMs locally via Ollama:

- **Ollama Manager** (`ollama/ollama-manager.ts`)
  - Gerenciamento de conexao com daemon Ollama
  - Health checks e failover automatico
  - Suporte para modelos chat, embedding e visao

- **Ollama Embeddings** (`ollama/ollama-embeddings.ts`)
  - Geracao de embeddings usando modelos locais
  - Cache de embeddings para otimizacao
  - Document store integrado

- **LLM Router Extension** (`ollama/llm-router-extension.ts`)
  - Router multi-provedor (Ollama, OpenAI, Google, Anthropic)
  - Fallback automatico entre provedores
  - Suporte para geracao em batch

### Docling

**Status:** Planejado
**Prioridade:** MEDIA

Modulo placeholder para processamento de documentos:

- Suporte a PDF, DOCX, XLSX, PPTX, HTML, EPUB, Markdown
- Extracao de texto, tabelas e metadados
- Pipeline RAG integrado

### Claw4ID

**Status:** Nao recomendado

A infraestrutura existente de Playwright (`browser/global_browser.py`) supre as necessidades de automacao de navegador do sistema.

## Configuracao

### Variaveis de Ambiente

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=120000
OLLAMA_CHAT_MODEL=llama3
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# OpenAI (fallback)
OPENAI_API_KEY=sk-...

# Google (fallback)
GEMINI_API_KEY=...

# Anthropic (fallback)
ANTHROPIC_API_KEY=...

# Docling (futuro)
DOCLING_SERVICE_URL=http://localhost:8080
```

### Uso basico

```typescript
import { OllamaManagerFactory } from './integrations/ollama';
import { nexusToolRegistry } from './integrations/langchain/tool-adapter';
import { RAGPipeline, InMemoryVectorStore } from './integrations/langchain';

// Inicializar Ollama
const ollama = OllamaManagerFactory.createFromEnv();
await ollama.healthCheck();

// Listar tools disponiveis
const tools = nexusToolRegistry.getAllDefinitions();

// Criar pipeline RAG
const vectorStore = new InMemoryVectorStore();
const rag = new RAGPipeline(vectorStore, { provider: 'ollama', model: 'nomic-embed-text' });
```

## Roadmap

### Fase 1: Fundacao LangChain (Concluida)
- [x] Modulo de adaptacao
- [x] Chain adapter
- [x] Tool adapter
- [x] Retriever adapter
- [x] Memory adapter

### Fase 2: Ollama Integration (Concluida)
- [x] Ollama manager
- [x] Ollama embeddings
- [x] LLM router extension

### Fase 3: Docling Integration (Planejado)
- [ ] Servico standalone containerizado
- [ ] Endpoints REST para extracao
- [ ] Pipeline de ingest de documentos

### Fase 4: Habilitacao RAG (Planejado)
- [ ] Pipeline de ingest de documentos
- [ ] RAG chains para skills agenticos
- [ ] Sistema de atualizacao de conhecimento

## Referencias

- [Analise de Viabilidade Completa](../../docs/INTEGRATION_FEASIBILITY_ANALYSIS.md)
- [Plano de Integracao Docling](../../docs/DOCLING_INTEGRATION_PLAN.md)
- [Documentacao LangChain](https://python.langchain.com/docs)
- [Documentacao Ollama](https://github.com/ollama/ollama)
- [Documentacao Docling](https://github.com/DS4SD/docling)
