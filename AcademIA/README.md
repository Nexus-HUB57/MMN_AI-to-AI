---
title: "Academ'IA · Nexus Affil'IA'te"
description: "HUB de Conhecimento & Sabedoria — Cursos, Treinamentos, Ferramentas e Biblioteca para Afiliados Nexus"
tags: [academia, knowledge-hub, afiliados, nexus]
version: 1.0.0
last_updated: 2026-06-02
status: production
---

# 🎓 Academ'IA · Nexus Affil'IA'te

> **HUB de Conhecimento & Sabedoria** — Cursos, Treinamentos, Ferramentas e Biblioteca para Afiliados Nexus Affil'IA'te

## 🌟 Visão Geral

A **Academ'IA** é o sub-diretório educacional e de ferramentas dentro da arquitetura do **Nexus Affil'IA'te**. Ela existe para capacitar afiliados e operadores a dominar a **Infraestrutura Operacional de Inteligência Distribuída (IOAID)**, o **Sistema Híbrido de Orquestração (SHO)** e a malha de agentes autônomos.

A Academ'IA funde três pilares em um único HUB:

- 📚 **Academ'IA Core**: Cursos, treinamentos e certificações progressivas.
- 🧪 **Lab Nexus**: HUB Central de Ferramentas IA (prompts, templates, workflows n8n/Make).
- 📖 **Lib Nexus**: Biblioteca canônica de referência técnica (knowledge base, specs, API docs).
- 👤 **Personas**: Identidade e diretrizes de atuação dos Agentes Nexus (Sra. Nexus Ive, Sir. Nexus Alencar).

## 🏛️ Arquitetura do HUB

```
AcademIA/                          # HUB de Conhecimento & Sabedoria (Obsidian Ready)
├── README.md                      # Este arquivo — Manual Geral, governança e regras de níveis
├── INDEX.md                       # Índice semântico e mapeamento de habilidades transversais
├── personas/                      # Identidade e diretrizes de atuação dos Agentes
│   ├── sra_nexus_ive.md           # Ficha de Identidade da Sra. Nexus Ive
│   ├── diretrizes_voz_sra_nexus_ive.md # Guia de voz e atuação
│   ├── diretrizes_interacao_ive_alencar.md # Guia de co-atuação (Ive & Alencar)
│   ├── sra_nexus_ive.png          # Avatar visual
│   ├── voz_sra_nexus_ive.wav      # Amostra de voz oficial
│   └── dialogo_ive_alencar.wav    # Amostra de diálogo em dupla
│   └── alencar/                   # Pasta Completa: Sir Nexus Alencar
│       ├── identity.md            # Ficha de Identidade
│       ├── sir_nexus_alencar.png   # Imagem Oficial
│       ├── voz_sir_nexus_alencar.wav # Voz Oficial
│       ├── roteiro-aula01.md      # Roteiro Aula 01
│       └── slides-aula01.md       # Slides Aula 01
├── cursos/                        # Conteúdo Markdown estruturado das Trilhas de Aprendizado
│   ├── fundamental/               # Nível 1: Boas-vindas, IOAID, Sistema SHO e Uso do Painel
│   │   ├── 00-boas-vindas.md
│   │   ├── 01-introducao-sra-nexus-ive.md
│   │   └── aula01/                # Aula 01: Entendendo o IOAID
│   │       ├── roteiro-aula01.md
│   │       └── slides-aula01.md
│   ├── agente/                    # Nível 2: Setup de Agentes, Skills base, WhatsApp e Judge Revisor
│   ├── master/                    # Nível 3: Otimização, Lifecycle, A/B Testing e Análise de Coortes
│   └── elite/                     # Nível 4: Multi-tenant, White-label e Federação de Agentes Zero-Trust
├── treinamentos/                  # Workshops práticos gravados
├── certificacoes/                 # Sistema de Certificação progressiva
├── webinars/                      # Gravações de eventos e lives
├── tutoriais/                     # How-to rápidos (15 min)
├── playbooks/                     # Manuais de operação para crises e campanhas
├── Lab-Nexus/                     # HUB Central de Ferramentas IA
│   ├── tools/                     # 38 ferramentas categorizadas
│   ├── prompts/                   # Biblioteca de Prompts testados
│   ├── templates/                 # Templates ricos editáveis
│   └── workflows/                 # Blueprints de workflows operacionais
├── Lib-Nexus/                     # Biblioteca de Referência Técnica (Imutável)
│   ├── knowledge-base/            # Glossário, IOAID, Taxonomia, LGPD
│   ├── agents-specs/              # Especificações contratuais de agentes
│   ├── api-docs/                  # Documentação de APIs
│   └── best-practices/            # Padrões recomendados
└── sync/                          # Bridge com os Agentes de Runtime
    ├── agent-bridge.json          # Mapeamento Academ'IA ↔ Runtime
    ├── skill-manifest.json        # Skills por trilha
    └── MCP-CONFIG.md              # Configuração do Model Context Protocol
```

## 🎯 Níveis de Progressão e Permissões de Acesso

| Nível | Status do Afiliado | Trilhas | Lab Nexus | Lib Nexus |
|---|---|---|---|---|
| 🥉 **Iniciante** | Cadastrado | Fundamental | Básico | Leitura |
| 🥈 **Operador** | 1º ciclo ativo | Fundamental + Agente | Essencial | Leitura |
| 🥇 **Estrategista** | 3+ ciclos concluídos | Fundamental + Agente + Master | Completo | Leitura + Comentário |
| 💎 **Elite** | Top 10% da rede | Todas + Blueprints | Completo + Submissão | Leitura + PR |

## 🔄 Sincronização Nativa com os Agentes

Os agentes do runtime conhecem os níveis de conhecimento da Academ'IA. Quando um afiliado conclui uma certificação ou trilha, o progresso é refletido no **Agent Profile** (`agents.skills_entitlement`).

O barramento principal reside em `sync/agent-bridge.json` e é carregado pelo **CentralOrchestrator** durante o bootstrap.

## 🚀 Quick Start (15 min)

1. **Novo afiliado** → Comece em [`cursos/fundamental/00-boas-vindas.md`](cursos/fundamental/00-boas-vindas.md)
2. **Quer operar agentes** → Vá para [`cursos/agente/00-primeiro-agente.md`](cursos/agente/00-primeiro-agente.md)
3. **Quer ferramentas prontas** → Explore [`Lab-Nexus/tools/`](Lab-Nexus/tools/)
4. **Quer consultar referência** → Abra [`Lib-Nexus/knowledge-base/`](Lib-Nexus/knowledge-base/)

## 🛡️ Governança e Padrões

- **Versionamento Semântico**: Toda mudança significativa bump da versão.
- **LGPD-safe**: Nenhum dado pessoal em exemplos — sempre dados sintéticos.
- **Code-first**: Exemplos > prosa. Toda skill tem trecho de código.
- **Obsidian-ready**: Frontmatter YAML em todos os arquivos .md.
- **Cross-linked**: Tags transversais (`#copy`, `#agentes`, `#funil`, `#federação`).

## 🤝 Como Contribuir

| Nível do Afiliado | Pode contribuir em |
|---|---|
| 🥈 Operador | Tutoriais, playbooks |
| 🥇 Estrategista | Lab-Nexus/tools/, treinamentos |
| 💎 Elite | Tudo (incluindo cursos e Lib-Nexus via PR) |

Toda contribuição passa por PR + revisão de um mentor.

## 📞 Contato

- **Suporte**: Via painel → canto inferior direito → Suporte
- **Discord**: canal `#academy-master`
- **Email**: equipenexus@oneverso.com.br

---

**Versão 1.0.0** · Atualizado em 2026-06-02 · Equipe Nexus Affil'IA'te
