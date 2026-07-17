# Guia de Integração do Backend - Fase 2

## Visão Geral

Este documento descreve como integrar o backend (Express + tRPC) com o frontend aprimorado da Fase 2, garantindo que todas as operações de roteiros funcionem corretamente e com eficiência de tokens.

## Arquitetura de Integração

```
Frontend (React)
    ↓
tRPC Client
    ↓
tRPC Router (server/routers.ts)
    ↓
Database Functions (server/db.ts)
    ↓
LLM Service (server/llmService.ts)
    ↓
MySQL/TiDB Database
```

## Procedures tRPC Necessárias

### 1. `video.generateScript` (Mutation)

**Responsabilidade**: Gerar um novo roteiro usando LLM.

**Otimização de Tokens**:
- Validar comprimento mínimo do conteúdo (100 caracteres)
- Usar diretrizes de persona pré-compiladas
- Limpar espaços em branco desnecessários antes de enviar ao LLM
- Implementar cache de respostas para conteúdo idêntico

### 2. `video.updateScript` (Mutation)

**Responsabilidade**: Atualizar um roteiro existente.

**Otimização de Tokens**:
- Validar apenas a sintaxe Markdown, não reprocessar com LLM
- Armazenar apenas as mudanças incrementais se possível
- Não fazer chamadas desnecessárias ao LLM para validação

### 3. `video.getScript` (Query)

**Responsabilidade**: Recuperar um roteiro existente.

**Otimização de Tokens**:
- Usar cache de queries para evitar requisições repetidas
- Retornar apenas o conteúdo necessário (sem metadados desnecessários)
- Implementar paginação se o roteiro for muito grande

## Validação de Markdown

A validação deve ocorrer no backend para garantir a integridade dos dados:

```typescript
function validateMarkdownScript(content: string): void {
  const sceneRegex = /## Cena \d+:/g;
  const scenes = content.match(sceneRegex);

  if (!scenes || scenes.length === 0) {
    throw new Error("Nenhuma cena encontrada no roteiro");
  }
}
```

## Tratamento de Erros

Implementar tratamento robusto de erros com mensagens significativas:

```typescript
class ScriptGenerationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}
```

## Fluxo de Requisição Completo

### 1. Geração de Roteiro

```
Frontend: POST /trpc/video.generateScript
  ↓
Backend: Validar projeto
  ↓
Backend: Chamar LLM com prompt otimizado
  ↓
Backend: Validar resposta
  ↓
Backend: Salvar no banco
  ↓
Backend: Atualizar status do projeto
  ↓
Frontend: Exibir roteiro gerado
```

### 2. Atualização de Roteiro

```
Frontend: POST /trpc/video.updateScript
  ↓
Backend: Validar projeto
  ↓
Backend: Validar sintaxe Markdown
  ↓
Backend: Atualizar no banco
  ↓
Backend: Atualizar status do projeto
  ↓
Frontend: Confirmar atualização
```

## Monitoramento e Logging

Adicionar logging para monitoramento de operações críticas:

```typescript
function logScriptOperation(operation: string, data: any) {
  console.log(`[SCRIPT_${operation}] ${JSON.stringify(data)}`);
}
```

## Testes Recomendados

### Teste de Geração

```bash
pnpm test -- video.generateScript
```

### Teste de Atualização

```bash
pnpm test -- video.updateScript
```

## Referências

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)

---

**Versão**: 1.0
**Data**: 17 de Junho de 2026
**Mantido por**: Manus AI
