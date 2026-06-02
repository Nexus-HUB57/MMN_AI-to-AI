---
title: "📖 Lib Nexus · Biblioteca de Referência"
description: "A fonte da verdade técnica do ecossistema Nexus Affil'IA'te"
tags: [lib-nexus, knowledge-base, referencia, canonica]
version: 1.0.0
last_updated: 2026-06-02
---

# 📖 Lib Nexus · Biblioteca de Referência

> A **fonte da verdade técnica** do ecossistema Nexus Affil'IA'te.

## 🎯 O que é a Lib Nexus

A Lib Nexus é a **biblioteca técnica canônica** — tudo que é referenciado por múltiplas partes do sistema vive aqui. É **read-mostly**: alterações passam por **PR + revisão técnica**.

## 🗂️ Estrutura

```
Lib-Nexus/
├── knowledge-base/           # Conceitos, glossário, taxonomias
├── agents-specs/             # Contratos de cada agente
├── api-docs/                 # Documentação de APIs
└── best-practices/           # Padrões recomendados
```

| Pasta | O que tem | Quem consulta |
|---|---|---|
| `knowledge-base/` | Conceitos, glossário, taxonomias, modelos mentais | Afiliados + devs |
| `agents-specs/` | Contratos técnicos de cada agente (inputs, outputs, erros) | Devs + power users |
| `api-docs/` | Referência das APIs internas e externas (tRPC, REST, webhooks) | Devs + integrações |
| `best-practices/` | Padrões recomendados de qualidade, segurança, performance | Todos |

## 🔒 Princípios

1. **Read-mostly** — escrita só via PR + aprovação
2. **Versionado** — toda mudança tem changelog
3. **LGPD-safe** — nenhum dado pessoal em exemplos
4. **Code-first** — exemplos > prosa
5. **Source of truth** — se está na Lib, é canônico

## 🔄 Sincronização

A Lib é a **fonte**. O que muda aqui reflete em:

- `../cursos/` (cursos usam os conceitos)
- `../Lab-Nexus/` (ferramentas usam as specs)
- `../../backend/src/` (código segue os contratos)
- `../../docs/canonical/` (documentação canônica)

## 📚 Catálogo Completo

### `knowledge-base/` (4 documentos)
- `00-glossario.md` — Glossário canônico (termos do ecossistema)
- `01-modelo-ioaid.md` — Arquitetura IOAID em 5 camadas
- `02-taxonomia-skills.md` — Catálogo unificado de 45 skills
- `03-conformidade-lgpd.md` — Mapeamento canônico LGPD

### `agents-specs/`
- `00-base-agent.md` — Especificação do `baseAgent`
- `01-marketing-agent.md` — Especificação do `marketingAgent`
- `02-judge-revisor.md` — Especificação do Judge
- `03-federation-gate.md` — Especificação do PII Gate

### `api-docs/`
- `00-trpc-overview.md` — Visão geral tRPC
- `01-webhooks.md` — Webhooks Hotmart, Shopee, Stripe
- `02-rest-public.md` — API REST pública

### `best-practices/`
- `00-prompt-engineering.md` — Padrões de prompt
- `01-error-handling.md` — Tratamento de erros
- `02-performance.md` — Boas práticas de performance

## 🤝 Como Contribuir

> ⚠️ **Lib Nexus é escrita apenas por contribuidores Elite** (top 10% da rede).

1. Abrir PR descrevendo a mudança
2. Revisão por **2 contribuidores Elite**
3. Aprovação do **mantenedor** da área
4. Merge + changelog automático

## 📞 Contato

- **Mantenedores:** `#lib-nexus-maintainers` (Discord)
- **Email:** equipenexus@oneverso.com.br

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
