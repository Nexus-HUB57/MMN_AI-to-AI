# Mastra Integration

## Overview

This module provides integration with [Mastra](https://mastra.ai) for building TypeScript-native AI agents in the Nexus Partners Pack.

## Features

- **TypeScript-Native**: Full TypeScript support with type-safe agent definitions
- **Multi-Agent Orchestration**: Define and coordinate multiple agents
- **Workflow Engine**: Create complex workflows with conditional logic
- **Tool Integration**: Register custom tools for agent use
- **Streaming Support**: Real-time streaming of agent responses
- **Metrics & Observability**: Built-in execution metrics

## Core Concepts

### Agents

Agents are autonomous units that can process inputs, use tools, and generate responses:

```typescript
import { createMastraService } from './integrations/mastra';

const mastra = await createMastraService();

await mastra.registerAgent({
  id: 'content-writer',
  name: 'Content Writer Agent',
  description: 'Specialized in marketing content',
  instructions: 'You are a professional content writer...',
  tools: ['search', 'scrape'],
  model: 'gpt-4o',
  temperature: 0.7,
});
```

### Workflows

Workflows orchestrate multiple agents in sequence:

```typescript
await mastra.registerWorkflow({
  id: 'content-pipeline',
  name: 'Content Creation Pipeline',
  steps: [
    { id: 'research', agentId: 'analyst', inputMapping: { topic: '$topic' } },
    { id: 'write', agentId: 'content-writer', inputMapping: { context: '$research' } },
    { id: 'publish', agentId: 'publisher', inputMapping: { content: '$content' } },
  ],
});

const result = await mastra.executeWorkflow({
  workflowId: 'content-pipeline',
  initialData: { topic: 'AI tools for marketing' },
});
```

### Tools

Tools extend agent capabilities:

```typescript
await mastra.registerTool({
  id: 'web-search',
  name: 'Web Search',
  description: 'Search the web for information',
  handler: async (input) => {
    return await searchWeb(input.query);
  },
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nexus Partners Pack                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Mastra Service                       │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   Agents    │  │  Workflows  │  │    Tools    │      │   │
│  │  │  - writer   │  │ - pipeline  │  │  - search   │      │   │
│  │  │  - analyst  │  │ - analysis  │  │  - publish  │      │   │
│  │  │  - publisher│  │ - content   │  │  - store    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              Orchestration Engine                 │   │   │
│  │  │  - Step execution  - Error handling              │   │   │
│  │  │  - Conditional logic - Retry strategies         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                       │
│         ┌─────────────────┼─────────────────┐                   │
│         ▼                 ▼                 ▼                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   LangChain │  │    Ollama   │  │   OpenAI    │             │
│  │   Adapter   │  │   Manager   │  │   Client    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Templates

The module provides pre-built agent templates:

### Content Writer Agent
```typescript
{
  id: 'content-writer',
  name: 'Content Writer Agent',
  instructions: 'You are a professional content writer...',
}
```

### Data Analyst Agent
```typescript
{
  id: 'analyst',
  name: 'Data Analyst Agent',
  instructions: 'You are a data analyst...',
}
```

### Publisher Agent
```typescript
{
  id: 'publisher',
  name: 'Publisher Agent',
  instructions: 'You are a publisher agent...',
}
```

## Workflow Templates

### Content Pipeline
```typescript
{
  id: 'content-pipeline',
  name: 'Content Creation Pipeline',
  steps: [
    { id: 'research', agentId: 'analyst' },
    { id: 'write', agentId: 'content-writer' },
    { id: 'publish', agentId: 'publisher' },
  ],
}
```

## Execution Examples

### Single Agent Execution
```typescript
const result = await mastra.executeAgent({
  agentId: 'content-writer',
  message: 'Write a blog post about AI tools',
  context: { audience: 'marketers', tone: 'professional' },
});

console.log(result.response);
console.log(`Tokens used: ${result.usage?.totalTokens}`);
```

### Workflow with Streaming
```typescript
const result = await mastra.executeWorkflow({
  workflowId: 'content-pipeline',
  initialData: { topic: 'AI tools for marketing' },
  options: { stream: true },
});

console.log(`Status: ${result.status}`);
console.log(`Steps completed: ${result.stepResults.length}`);
console.log(`Duration: ${result.duration}ms`);
```

## Metrics

Track agent performance:

```typescript
const metrics = mastra.getAgentMetrics('content-writer');
console.log({
  totalExecutions: metrics?.totalExecutions,
  successRate: metrics?.successfulExecutions / metrics?.totalExecutions,
  avgDuration: metrics?.totalDuration / metrics?.totalExecutions,
});
```

## Integration with LangChain

Mastra integrates with the existing LangChain adapter:

```typescript
import { createMastraService } from './integrations/mastra';
import { createLangChainChain } from './integrations/langchain';

// Use Mastra for orchestration, LangChain for LLM calls
const mastra = await createMastraService({
  defaultModel: 'gpt-4o',
});

const chain = await createLangChainChain({
  model: 'openai',
});

mastra.registerAgent({
  id: 'smart-agent',
  instructions: 'Use the provided tools to answer questions',
  tools: ['web-search', chain.getToolId()],
});
```

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseUrl` | string | `http://localhost:5000` | Mastra API URL |
| `apiKey` | string | `''` | API key for authentication |
| `defaultModel` | string | `gpt-4o` | Default LLM model |
| `maxConcurrentAgents` | number | `10` | Max parallel agents |
| `telemetryEnabled` | boolean | `true` | Enable telemetry |

## Error Handling

Workflows support multiple error strategies:

```typescript
// Retry on error (default)
{ errorStrategy: 'retry', maxRetries: 3 }

// Skip failed steps
{ errorStrategy: 'skip' }

// Stop on first error
{ errorStrategy: 'stop' }

// Use fallback agent
{ errorStrategy: 'fallback' }
```

## Performance Tips

1. **Parallel Execution**: Use `executeWorkflow` for sequential steps
2. **Tool Caching**: Register tools once, reuse across agents
3. **Model Selection**: Use smaller models for simple tasks
4. **Batch Processing**: Process multiple inputs in parallel

## License

Internal Nexus Partners Pack module - All rights reserved