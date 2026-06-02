---
title: "MCP-CONFIG · Model Context Protocol para Academ'IA"
description: "Configuração MCP para que os agentes leiam o HUB Academ'IA em tempo de execução"
tags: [mcp, model-context-protocol, sync, agents, runtime]
version: 1.0.0
last_updated: 2026-06-02
---

# 🔌 MCP-CONFIG · Model Context Protocol para Academ'IA

> Especificação dos servidores **Model Context Protocol (MCP)** que permitem aos agentes do runtime **ler as pastas do Lab Nexus e da Lib Nexus em tempo de execução** para calibrar seus próprios prompts do sistema.

## 🎯 Por que MCP

O MCP é o padrão aberto que conecta LLMs a fontes de dados externas. No Nexus, ele faz a ponte entre:
- **LLM primário** (executor de skill)
- **LLM Judge** (avaliador)
- **HUB Academ'IA** (fonte de verdade sobre copy, ferramentas, regras)

Isso significa que, quando você atualiza uma copy no Lab, **o agente já conhece a nova versão no próximo batch** — sem redeploy.

## 🗂️ Servidores MCP Configurados

### 1. `academia-courses` (leitura)

```json
{
  "mcpServers": {
    "academia-courses": {
      "command": "npx",
      "args": ["-y", "@nexus/mcp-server-academia", "--path", "./AcademIA/cursos"],
      "env": {
        "NEXUS_API_KEY": "${NEXUS_RUNTIME_KEY}",
        "READ_ONLY": "true"
      }
    }
  }
}
```

**Permissões:** apenas leitura.
**Quem usa:** `copywriter-persuasivo` (calibra tom por nível do afiliado), `judge-revisor` (regras regulatórias por trilha).

### 2. `lab-nexus-tools` (leitura)

```json
{
  "mcpServers": {
    "lab-nexus-tools": {
      "command": "npx",
      "args": ["-y", "@nexus/mcp-server-lab", "--path", "./AcademIA/Lab-Nexus"],
      "env": {
        "NEXUS_API_KEY": "${NEXUS_RUNTIME_KEY}",
        "READ_ONLY": "true"
      }
    }
  }
}
```

**Permissões:** apenas leitura.
**Quem usa:** `copywriter-persuasivo` (templates), `audience-segmenter` (regras de segmentação), `roi-attributor` (modelos de atribuição).

### 3. `lib-nexus-specs` (leitura)

```json
{
  "mcpServers": {
    "lib-nexus-specs": {
      "command": "npx",
      "args": ["-y", "@nexus/mcp-server-lib", "--path", "./AcademIA/Lib-Nexus"],
      "env": {
        "NEXUS_API_KEY": "${NEXUS_RUNTIME_KEY}",
        "READ_ONLY": "true"
      }
    }
  }
}
```

**Permissões:** apenas leitura.
**Quem usa:** `judge-revisor` (LGPD, CONAR), todas as skills avançadas (contratos de agente).

### 4. `sync-bridge` (escrita)

```json
{
  "mcpServers": {
    "sync-bridge": {
      "command": "npx",
      "args": ["-y", "@nexus/mcp-server-bridge", "--path", "./AcademIA/sync"],
      "env": {
        "NEXUS_API_KEY": "${NEXUS_BRIDGE_KEY}",
        "READ_ONLY": "false"
      }
    }
  }
}
```

**Permissões:** leitura + escrita (apenas em `sync/audit.log`).
**Quem usa:** Orchestrator (registra eventos de progressão), Judge (registra alinhamentos).

## 🛡️ Segurança

| Aspecto | Implementação |
|---|---|
| **Autenticação** | API Key por servidor (rotacionada a cada 30 dias) |
| **Auditoria** | Toda chamada MCP é logada em `sync/audit.log` |
| **Read-only por padrão** | Apenas `sync-bridge` tem escrita, e somente em log |
| **Rate limit** | 100 req/min por servidor |
| **PII** | Mesmo gate que a federação: 14 tipos de PII detectados |

## 🧪 Como Testar

```bash
# Em ambiente local
npx @nexus/mcp-server-academia --path ./AcademIA/cursos --dry-run

# Em produção (runtime)
nexus mcp ping academia-courses
# Saída esperada: { ok: true, latency_ms: 12, files_indexed: 16 }
```

## 🔄 Como Atualizar

1. Editar este arquivo (`sync/MCP-CONFIG.md`)
2. Commit + push
3. O runtime detecta mudança em < 60s
4. Reinicia os servidores MCP com nova config (zero downtime)

## 📊 Métricas

- **Latência média:** 15ms (P95: 45ms)
- **Cache hit rate:** 87%
- **Falhas 24h:** < 0.1%

## 🆘 Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Agente "não conhece" curso novo | MCP cache não invalidou | Reiniciar servidor: `nexus mcp restart academia-courses` |
| Latência > 200ms | Path muito grande | Indexar apenas a pasta relevante |
| Auth error | API key expirada | Rotacionar: `nexus mcp rotate-key` |

---

**Versão 1.0** · Atualizado 2026-06-02
