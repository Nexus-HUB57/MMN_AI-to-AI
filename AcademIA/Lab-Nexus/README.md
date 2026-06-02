---
title: "🧪 Lab Nexus · HUB Central de Ferramentas IA"
description: "Bancada prática do afiliado Nexus. Prompts testados, templates editáveis, workflows prontos."
tags: [lab-nexus, ferramentas, prompts, templates, workflows]
version: 1.0.0
last_updated: 2026-06-02
---

# 🧪 Lab Nexus · HUB Central de Ferramentas IA

> A bancada prática do afiliado Nexus. **Prompts testados, templates editáveis, workflows prontos.**

## 🎯 O que é o Lab Nexus

O Lab Nexus é o **HUB Central de Ferramentas IA** da Academ'IA. Ele centraliza tudo que você precisa para **executar o que aprendeu nos cursos**, em 4 categorias:

| Categoria | O que tem | Quem usa |
|---|---|---|
| 📣 `tools/marketing/` | Calendário, segmentação, jornada, funil, plano 90d | Estrategista |
| ✍️ `tools/copy/` | Headlines, e-mails, scripts, copies, SMS | Copywriter |
| 📊 `tools/analytics/` | Dashboards, KPIs, funis, coortes | Estrategista |
| 🤖 `tools/automation/` | Bots, webhooks, integrações | Agente |
| 🎨 `tools/design/` | Briefings, prompts visuais | Design |

> **Regra:** toda ferramenta no Lab tem 3 camadas — **spec** (o que é), **playbook** (como usar), **asset** (o arquivo pronto).

## 🗂️ Estrutura Completa

```
Lab-Nexus/
├── tools/                          # 40 ferramentas categorizadas
│   ├── marketing/                  # 9 ferramentas — Estrategista
│   ├── copy/                       # 13 ferramentas — Copywriter
│   ├── analytics/                  # 6 ferramentas — Estrategista
│   ├── automation/                 # 7 ferramentas — Agente
│   └── design/                     # 5 ferramentas — Design
├── prompts/                        # Biblioteca de prompts testados
│   ├── copywriting/                # 2 prompts
│   ├── analise/                    # 3 prompts
│   └── estrategia/                 # 3 prompts
├── templates/                      # Templates editáveis
│   ├── email/                      # 3 templates
│   ├── landing/                    # 2 templates
│   └── social/                     # 1 template
└── workflows/                      # Blueprints de automação
    ├── n8n/                        # 2 workflows
    └── make/                       # 1 workflow
```

**Total:** 40 ferramentas + 8 prompts + 6 templates + 3 workflows = **57 assets**.

## 🔄 Sincronização com agentes

As ferramentas do Lab são a **entrada do runtime**. Quando você usa um prompt do Lab numa skill do agente, a relação é mapeada em [`../sync/skill-manifest.json`](../sync/skill-manifest.json).

**Exemplo:**

| Lab | Skill que executa | Judge que avalia |
|---|---|---|
| `tools/copy/01-headline-persuasiva.md` | `copywriter-persuasivo` (`backend/src/agentic/skills/copywriterPersuasivo.ts`) | `judge-revisor` |
| `tools/analytics/02-comparador-taxas-conversao.md` | `roi-attributor` | `judge-revisor` |
| `tools/automation/01-webhooks-payload.md` | `webhook-router` | `compliance-auditor` |

## 🚀 Como Usar

### Cenário 1 — Você quer uma copy nova

1. Vá em `tools/copy/`
2. Escolha o tipo (headline, e-mail frio, sequência)
3. Copie o prompt + template
4. Cole no chat do agente (ou use a skill direto)

### Cenário 2 — Você quer um workflow pronto

1. Vá em `workflows/n8n/`
2. Baixe o JSON do workflow
3. Importe no seu n8n
4. Conecte às suas credenciais (WhatsApp, e-mail, etc.)

### Cenário 3 — Você quer um template visual

1. Vá em `templates/landing/` ou `templates/email/`
2. Copie o HTML / Figma link
3. Personalize
4. Publique

## 📐 Padrão de Qualidade

Toda ferramenta segue o template **Lab-Quality-Standard.md**:

```yaml
metadata:
  name: "Headline Persuasiva"
  category: copy
  level: fundamental
  estimated_time: "10 min"
  author: "Equipe Nexus"
  version: "1.0"
  last_review: "2026-06-02"

spec: |
  O que é, quando usar, pré-requisitos

playbook: |
  Passo a passo com exemplos

asset: |
  Arquivo pronto (prompt, template, workflow)

metrics: |
  Como medir o sucesso

risks: |
  LGPD, CONAR, anti-patterns
```

## 🤝 Como Contribuir

| Nível do Afiliado | Pode contribuir em |
|---|---|
| 🥈 Operador | Tutoriais, playbooks |
| 🥇 Estrategista | `tools/`, `treinamentos/` |
| 💎 Elite | Tudo (incluindo cursos e Lib-Nexus via PR) |

Toda contribuição passa por **PR + revisão de 1 mentor**.

## 📞 Contato

- **Suporte:** Via painel → canto inferior direito → Suporte
- **Discord:** canal `#lab-nexus`
- **Email:** equipenexus@oneverso.com.br

---

**Versão 1.1** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
