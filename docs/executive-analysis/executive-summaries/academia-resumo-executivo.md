---
title: "Resumo Executivo · Academ'IA"
description: "TL;DR de 1 página — entrada única para entender a Academ'IA em 60 segundos"
tags: [resumo, executivo, tldr, overview, academia]
version: 1.1.0
last_updated: 2026-06-02
---

# 📌 Resumo Executivo · Academ'IA

> **TL;DR de 1 página.** Se você só tiver 60 segundos, leia isto.

## 🎯 O que é

A **Academ'IA** é o HUB de Conhecimento & Sabedoria do Nexus Affil'IA'te. Ensina afiliados e operadores a usar a plataforma (IOAID + SHO + agentes autônomos) e centraliza todas as ferramentas práticas.

## 🏛️ Estrutura (3 camadas)

```
        ┌──────────────────────────────────────────────┐
        │   📚  CURSOS & TREINAMENTOS                   │  ← 4 trilhas progressivas
        │                                               │     (15 cursos + 3 workshops)
        ├──────────────────────────────────────────────┤
        │   🧪  Lab-Nexus (HUB de Ferramentas IA)       │  ← 40 tools + 8 prompts
        │                                               │     + 3 templates + 3 workflows
        ├──────────────────────────────────────────────┤
        │   📖  Lib-Nexus (Biblioteca Canônica)         │  ← 15 docs técnicos
        │                                               │     (glossário, IOAID, specs, APIs)
        └──────────────────────────────────────────────┘
                            │
                            ▼
            🔄 sync/  (bridge com agentes de runtime)
            · agent-bridge.json
            · skill-manifest.json
            · MCP-CONFIG.md
```

## 👥 Quem usa + quando

| Você é... | Entre por... | Em quanto tempo |
|---|---|---|
| 🌱 Afiliado novo | `cursos/fundamental/00-boas-vindas.md` | 15 min |
| 🤖 Quer operar agentes | `cursos/agente/00-primeiro-agente.md` | 30 min |
| 📊 Quer otimizar conversão | `cursos/master/00-otimizacao-conversao.md` | 45 min |
| 💎 Top 10% da rede | `cursos/elite/00-blueprints-elite.md` | 60 min |
| 🧪 Quer uma ferramenta pronta | `Lab-Nexus/tools/` | prático |
| 📖 Quer consultar referência | `Lib-Nexus/knowledge-base/` | direto |

## 🏆 4 Níveis progressivos

| Nível | Status | Trilhas | Permissões |
|---|---|---|---|
| 🥉 Iniciante | Cadastrado | Fundamental | Ler tudo, executar tools básico |
| 🥈 Operador | 1º ciclo ativo | + Agente | + Skills intermediárias |
| 🥇 Estrategista | 3+ ciclos | + Master | + Skills avançadas + selo |
| 💎 Elite | Top 10% | + Elite | + White-label + Federação + contribuição na Lib |

## 📦 Conteúdo atual (v1.1.0)

- **15 cursos** (4 fundamental + 4 agente + 4 master + 3 elite)
- **40 ferramentas no Lab** (marketing 9, copy 13, analytics 6, automation 7, design 5)
- **8 prompts testados** (copywriting 2, análise 3, estratégia 3)
- **3 templates HTML** (email 3, landing 2, social 1)
- **3 workflows JSON** (n8n 2, make 1)
- **15 docs na Lib** (4 knowledge-base, 4 agents-specs, 3 api-docs, 3 best-practices, 1 glossário)
- **14 tutoriais** how-to (15 min ou menos)
- **7 playbooks** de operação (rotina, lançamento, crise, LGPD)
- **3 workshops** gravados
- **3 webinars** (2 históricos + 1 Open House)
- **3 certificações** (CON, CEN, CEN+) + modelo de avaliação

## 🔗 Bridge com o Runtime

```
Curso concluído → skill_entitlement += level_up
Certificação obtida → agents.certifications.push()
Nível promovido → sh.confidenceThreshold = level_default
```

Catálogo runtime:
- **15 skills operacionais** (validadas no `skill-manifest.json`)
- **1 skill planejada** (`cohort-analyzer`, Q3-2026)
- **27 handlers .ts** no monorepo (`backend/src/agentic/skills/`)
- **4 servidores MCP** (`academia-courses`, `lab-nexus-tools`, `lib-nexus-specs`, `sync-bridge`)

## 🛡️ Princípios canônicos

1. **LGPD-safe** — nenhum dado pessoal em exemplos
2. **Code-first** — exemplos > prosa
3. **Cross-linked** — tags transversais (`#copy`, `#agentes`, `#funil`, `#lgpd`, ...)
4. **Obsidian-ready** — frontmatter YAML em todos os .md
5. **Versionamento semântico** — MAJOR.MINOR.PATCH
6. **Read-mostly na Lib** — só Elite contribui via PR + 2 aprovações

## 🚀 Onde começar AGORA

1. Se você é afiliado novo: 👉 [`cursos/fundamental/00-boas-vindas.md`](cursos/fundamental/00-boas-vindas.md)
2. Se você é dev/integrador: 👉 [`INDEX.md`](INDEX.md) (mapa completo) + [`sync/MCP-CONFIG.md`](sync/MCP-CONFIG.md)
3. Se você é mantenedor: 👉 [`CHANGELOG.md`](CHANGELOG.md) + [`sync/skill-manifest.json`](sync/skill-manifest.json)

## 📞 Contato

- **Suporte:** Painel → canto inferior direito → Suporte
- **Discord:** `#academy-master` (geral) · `#lib-nexus-maintainers` (técnico)
- **Email:** equipenexus@oneverso.com.br
- **Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI

---

**Versão 1.1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus Affil'IA'te
