---
title: "Tutorial 22 · Criar Playbook Operacional do Zero"
description: "Estrutura completa para escrever playbook operacional de crise, lançamento ou rotina"
tags: [tutorial, playbook, operacional, runbook, documentacao, processos]
nivel: Intermediário
duracao: 90 min
pre_requisitos: ["Processo definido na cabeça de alguém", "Decisão de documentar"]
autor: "Otavio Nexus Ops (COO/AI)"
date: 2026-07-14
---

# 📋 Tutorial 22 · Criar Playbook Operacional do Zero

> **Objetivo:** estruturar um playbook operacional (crise, lançamento, rotina) em 90 minutos, com clareza suficiente para que outra pessoa execute sem te perguntar nada.

## 🎯 O que você vai aprender

- ✅ Identificar quando um processo precisa virar playbook
- ✅ Estruturar playbook em 8 seções padrão
- ✅ Escrever passos "à prova de executor diferente"
- ✅ Testar playbook com pessoa leiga
- ✅ Manter playbook vivo (atualização)

## 📋 Por que playbooks importam

- **Pessoas saem, processos ficam** — se tá na sua cabeça, tá em risco
- **Escalar time** — playbook permite treinar novos mais rápido
- **Reduzir heroísmo** — sem playbook, depende de "pessoas especiais"
- **Resposta a crises** — em crise, ninguém lembra de tudo
- **Compliance** — auditoria quer ver processo documentado
- **Onboarding** — playbooks aceleram integração

## 📋 Quando criar playbook

**Sinais de que precisa de playbook:**
- [ ] Você explicou o mesmo processo 3+ vezes
- [ ] Alguém te pergunta "como faz?" toda semana
- [ ] Em crise, "ninguém sabia o que fazer"
- [ ] Time é > 3 pessoas (complexidade aumenta)
- [ ] O processo é crítico (afeta receita/clientes)
- [ ] Está na cabeça de 1 pessoa só (risco de saída)

**Tipos de playbook:**
- **Rotina** (operação diária/semanal)
- **Lançamento** (campanha, produto, parceria)
- **Crise** (incidente, breach, falha em massa)
- **Onboarding** (novo cliente, novo funcionário, novo afiliado)
- **Compliance** (LGPD, ANATEL, auditoria)

## 📋 Estrutura Padrão (8 Seções)

Todo playbook segue esta estrutura. Use como template:

### 1. METADADOS (header)

```yaml
---
title: "PB-[CATEGORIA]-[nome-curto]"
description: "1 linha do que resolve"
tags: [playbook, categoria, contexto]
nivel: Básico | Intermediário | Master | Elite
duracao: "X horas/dias para executar"
pre_requisitos: ["O que precisa estar pronto antes"]
autor: "Nome + cargo"
date: "YYYY-MM-DD"
ultima_revisao: "YYYY-MM-DD"
---
```

### 2. QUANDO USAR / QUANDO NÃO USAR

**Quando usar (sinais claros):**
- ✅ Sintoma A aconteceu
- ✅ Métrica B caiu para X
- ✅ Solicitação de Y chegou
- ✅ Contexto Z é esse

**Quando NÃO usar (também é importante):**
- ❌ Não é o playbook certo se [condição]
- ❌ Caso X é tratado em outro playbook
- ❌ Se algo é Y, escalar imediatamente

### 3. PRÉ-REQUISITOS

O que precisa estar pronto ANTES de começar:
- [ ] Acesso a [sistema X]
- [ ] Permissão de [ação Y]
- [ ] Material [Z] preparado
- [ ] Pessoas [A, B] avisadas
- [ ] Budget aprovado: R$ X

### 4. ROLES (quem faz o quê)

| Papel | Quem | Responsabilidade |
|-------|------|------------------|
| **Owner** | Nome/role | Dono do playbook, decide, escala |
| **Executor principal** | Nome/role | Faz o passo-a-passo |
| **Apoio** | Nome/role | Auxilia em X |
| **Escalação** | Nome/role | Pra quem escalar se travar |
| **Comunicação** | Nome/role | Quem fala com cliente/time/mídia |

### 5. PASSO-A-PASSO (coração do playbook)

Cada passo com:
- **Ação** clara (verbo no infinitivo)
- **Tempo estimado**
- **Output esperado**
- **Como saber se deu certo**
- **O que fazer se der errado**

Exemplo:
```
PASSO 3: Notificar cliente sobre incidente
- Tempo: 5 min
- Ação: Enviar email template `incidente-notificacao.html`
  via Customer.io para todos os clientes afetados
- Output: Email enviado
- Sucesso: Taxa de abertura > 70%
- Se falhar: Enviar via SendGrid (fallback)
- Escalar se: taxa de bounce > 5% (lista errada)
```

### 6. COMUNICAÇÃO

- **Interna:** quem avisar, quando, como (Slack/email/presencial)
- **Externa:** clientes, parceiros, mídia
- **Templates:** emails, posts, mensagens prontas
- **Frequência:** durante crise, comunicar a cada X min/horas

### 7. CHECKLIST FINAL

- [ ] Todos os passos executados?
- [ ] Outputs verificados?
- [ ] Stakeholders avisados?
- [ ] Métricas monitoradas nas próximas 24h?
- [ ] Post-mortem agendado (se incidente)?
- [ ] Playbook precisa atualização?

### 8. APÊNDICES

- Templates de mensagem
- Links de sistemas
- Contatos de escalação
- Histórico de versões

## 📋 Processo de Criação (90 min)

### PASSO 1: Definir escopo (10 min)

Pergunte a si mesmo:
- Qual processo estou documentando?
- Quem é o público? (técnico, leigo, misto)
- Quando esse playbook é ativado?
- Qual o output esperado?

**Defina 1 frase:**
> "Este playbook serve para [X] quando [Y], resultando em [Z]."

### PASSO 2: Listar pré-requisitos (10 min)

Tudo que precisa estar pronto ANTES de começar.
Se a maioria dos pré-requisitos não está automatizada, documente-os também.

### PASSO 3: Esboçar passos (20 min)

Brainstorm TODOS os passos sem se preocupar com ordem.
Depois organize em sequência lógica.

### PASSO 4: Detalhar cada passo (30 min)

Para cada passo:
- Verbo claro (verbo no infinitivo)
- Sistema/ferramenta
- Tempo estimado
- Output esperado
- Critério de sucesso
- Fallback se der errado

### PASSO 5: Identificar pontos de escalação (10 min)

Para cada passo, responda:
- "Em que situação eu escalo?"
- "Pra quem eu escalo?"
- "Como eu escalo (Slack/ligação/email)?"

### PASSO 6: Escrever comunicação (10 min)

Prontos os templates:
- Mensagem inicial (interna)
- Mensagem para cliente (se aplicável)
- Mensagem de resolução
- Mensagem de follow-up

### PASSO 7: Revisar com leigo (teste crítico)

**Pega alguém que NUNCA executou o processo.** Dá o playbook e pede:
- "Você consegue executar isso?"

Se a pessoa travar em algum passo ou te perguntar algo:
- Reescreva aquele passo
- Adicione link/screenshot
- Simplifique linguagem

**Esse é o melhor teste de qualidade.**

### PASSO 8: Publicar e indexar (5 min)

- Salvar em `AcademIA/playbooks/PB-[CATEGORIA]-[nome].md`
- Adicionar tags para busca
- Comunicar ao time
- Agendar revisão em 6 meses

## 📋 Exemplo: Playbook de Lançamento

```yaml
---
title: "PB-LANCAMENTO-black-friday"
description: "Lançamento Black Friday 11 dias com metas agressivas"
tags: [playbook, lancamento, black-friday, sazonal]
nivel: Master
duracao: 11 dias
pre_requisitos:
  - "Produto validado com NPS > 50"
  - "Budget marketing aprovado: R$ 60k"
  - "Email list com 10k+ leads"
  - "Customer.io configurado"
  - "Equipe de CS disponível 12h/dia durante lançamento"
autor: "Helena (CMO/AI)"
---

# PB-LANCAMENTO · Black Friday 11 dias

[estrutura padrão 8 seções]

## 5. PASSO-A-PASSO

### D-30: PREPARAÇÃO
[...]

### D-7: PRÉ-AQUECIMENTO
[...]

### D0: LIVE DE ABERTURA
[...]

### D+10: ÚLTIMO DIA
[...]

## 6. COMUNICAÇÃO
- Email a cada 48h para leads frios
- WhatsApp diário para leads quentes
- Status page atualizado 1x/dia
```

## 📋 Manutenção do Playbook

**Quem é dono:** sempre 1 pessoa (não "o time")

**Quando atualizar:**
- Após executar o playbook (mesmo que bem-sucedido)
- Após falha (sempre — o playbook falhou também)
- A cada 6 meses (revisão agendada)
- Quando sistema/ferramenta muda

**Como atualizar:**
- PR (pull request) no repo
- Review por 1+ pessoa
- Histórico de versões no frontmatter
- Comunicar mudanças no Slack #playbooks

**Sinal de playbook morto:**
- Não foi revisado em 12+ meses
- 3+ itens de "se der errado" sem fallback
- Autor original saiu e ninguém assumiu
- Última execução foi há 6+ meses

**Ação para playbook morto:**
- Atualizar OU arquivar (não deixar enganar)

## 📋 Checklist do Playbook Pronto

- [ ] Metadados completos
- [ ] Quando usar / não usar claro
- [ ] Pré-requisitos listados
- [ ] Roles definidas
- [ ] Passos com tempo + output + sucesso + fallback
- [ ] Comunicação especificada
- [ ] Checklist final
- [ ] Templates prontos (se aplicável)
- [ ] Testado com pessoa leiga
- [ ] Publicado em local acessível
- [ ] Dono definido
- [ ] Data de próxima revisão marcada

## 📋 Categorização dos Playbooks Nexus

| Categoria | Prefixo | Exemplo |
|-----------|---------|---------|
| Operação diária | PB-XXX-operacao | PB-WHATSAPP-operacao-diaria |
| Lançamento | PB-LANCAMENTO- | PB-LANCAMENTO-black-friday |
| Crise | PB-CRISES- | PB-CRISES-gestao-crise-ban-whatsapp |
| Onboarding | PB-ONBOARDING- | PB-ONBOARDING-novo-afiliado |
| Compliance | PB-LGPD- ou PB-ANATEL- | PB-LGPD-direitos-titular |
| Financeiro | PB-FINANCEIRO- | PB-FINANCEIRO-decisao-investimento |
| Governança | PB-GOVERN- | PB-GOVERN-postmortem-blame-free |

**Convenção:** `PB-[CATEGORIA]-[nome-descritivo-kebab-case].md`

## 📚 Materiais Relacionados

- `playbooks/PB-CRISES-gestao-crise-data-loss.md` — exemplo de crise
- `playbooks/PB-EMAIL-operacao-diaria.md` — exemplo de rotina
- `playbooks/PB-LANCAMENTO-lancamento-7-dias.md` — exemplo de lançamento
- `playbooks/PB-ONBOARDING-novo-afiliado.md` — exemplo de onboarding
- `playbooks/PB-FINANCEIRO-decisao-investimento.md` — financeiro
- `playbooks/PB-GOVERN-postmortem-blame-free.md` — governança
- `Lab-Nexus/prompts/governanca/02-postmortem-incidente.md` — template de post-mortem

---

*AcademIA · Tutorial 22 · 2026*