---
title: "PB-GOVERN · Post-Mortem Blameless"
description: "Playbook para conduzir post-mortem sem culpados, focado em aprendizado"
tags: [playbook, governanca, postmortem, blameless, sre, incidente, aprendizado]
nivel: Master
duracao: "60-90 min para reunião + 2-3 dias para finalizar doc"
pre_requisitos: ["Incidente real aconteceu (ou simulação)"]
autor: "Otavio Nexus Ops (COO/AI)"
date: 2026-07-14
---

# 🛠️ PB-GOVERN · Post-Mortem Blameless

> Playbook para conduzir post-mortem blameless de incidente, gerar documento de aprendizado e garantir que ações corretivas sejam executadas.

## 🎯 Quando usar

- Após qualquer **incidente com impacto real** (downtime, breach, data loss)
- Após **incidente de segurança** (mesmo que pequeno)
- Após **falha em produção** que afetou clientes
- Em **simulados/ game days** trimestralmente

## 🚫 Quando NÃO usar

- Para mudanças que não chegaram a ser incidentes
- Para "quase-acidentes" (use outro framework, ex: Near-Miss Report)
- Para problemas conhecidos em desenvolvimento (use PR review)

## 📋 Pré-requisitos

- [ ] Incidente foi resolvido (sistema estável)
- [ ] Logs preservados (mínimo 30 dias)
- [ ] Time envolvido disponível para 60-90 min
- [ ] Facilitador definido (pode ser o COO/AI ou pessoa designada)
- [ ] Template de post-mortem pronto (use o prompt 02)

## 📋 Fluxo (5 passos em 5 dias)

### DIA 1: AGENDAR

**Owner:** COO/AI ou designee

1. Enviar email/Slack para participantes:
   ```
   ASSUNTO: Post-mortem incidente INC-2026-XXX
   QUANDO: [data/hora] 60-90 min
   ONDE: [Zoom/sala]
   PARTICIPANTES: [time envolvido + C-Suite]
   PRÉ-LEITURA: nenhum (apenas contexto no convite)
   ```

2. Participantes sugeridos:
   - Quem detectou
   - Quem respondeu (on-call, líder técnico)
   - Quem executou a correção
   - Quem se comunicou com stakeholders
   - **Facilitador** (não esteve envolvido na correção)

3. Bloquear agenda com antecedência (mínimo 2 dias)

### DIA 2-3: COLETAR DADOS (antes da reunião)

**Owner:** Facilitador + líder técnico

Coletar:
- [ ] Linha do tempo (de logs, alertas, Slack, calls)
- [ ] Métricas de impacto (downtime, usuários, receita)
- [ ] Logs relevantes (screenshot ou excerpts)
- [ ] Comunicação enviada (Slack, email, status page)
- [ ] Ações tomadas durante o incidente
- [ ] Tickets relacionados

### DIA 4: REUNIÃO DE POST-MORTEM (60-90 min)

**Facilitador:** pessoa designada (não envolvida na execução)

#### AGENDA DA REUNIÃO

##### 1. Abertura (5 min)
- Agradeça a presença
- Reforce regras blameless:
  - "Foco no sistema, não na pessoa"
  - "Cada um fez o melhor com a info que tinha"
  - "Saímos com ações, não com culpados"
- Confirme confidencialidade (a não ser que combinado)

##### 2. Linha do tempo (15 min)
- Facilitador apresenta timeline reconstruída
- Time valida e completa
- Pergunte: "o que está faltando?"
- Documente em tempo real

##### 3. Impacto (5 min)
- Quantitativo: downtime, usuários, receita, SLA
- Qualitativo: moral, percepção, aprendizado

##### 4. 5 Whys (20 min) — MAIS IMPORTANTE
- "Por quê o incidente aconteceu?" → resposta 1
- "Por quê [resposta 1]?" → resposta 2
- Continue até chegar em **causa sistêmica** (processo, não pessoa)
- Se chegar em "fulano errou", reformule: "o sistema permitiu que..."

##### 5. O que deu certo (5 min)
- Listar 3-5 coisas que funcionaram bem
- Reconhecer o time
- Não subestimar este momento

##### 6. Ações corretivas (20 min)
- Para cada causa raiz identificada, gerar 1-3 ações
- Cada ação precisa de:
  - Descrição clara
  - Tipo: Preventiva / Detecção / Mitigação
  - Owner (pessoa, não "time")
  - Prazo (data específica)
  - Como medir sucesso
- Discutir e validar com time

##### 7. Encerramento (5 min)
- Resumir decisões
- Agradecer participação
- Próximos passos (publicação + check-in 30/60/90)

### DIA 5: PUBLICAR (24-48h após reunião)

**Owner:** Facilitador

1. **Escrever documento** usando template
2. **Revisão** por 1-2 participantes (sanity check)
3. **Publicar em:**
   - Notion/Confluence: `post-mortems/INC-2026-XXX.md`
   - Indexar por: data, sistema, severidade, tags
4. **Apresentar** no weekly all-hands (15 min, opcional mas recomendado)
5. **Comunicar externamente** se necessário (clientes, blog)

### DIA 30/60/90: CHECK-IN

**Owner:** COO/AI

Três pontos de verificação:

| Marco | Verificar |
|-------|-----------|
| **D+30** | Ações de 2 semanas foram concluídas? |
| **D+60** | Ações de 1 mês foram concluídas? Métricas melhoraram? |
| **D+90** | Incidente similar aconteceu de novo? (meta: 0) |

Se ação atrasada: cobrar owner, renegociar prazo ou escalar.
Se incidente similar: **ação corretiva falhou** — re-analisar.

## 📋 Template de Post-Mortem (Resumo)

```markdown
# Post-Mortem: [Título]

**ID:** INC-YYYY-XXX
**Severidade:** SEV1/2/3/4
**Data:** YYYY-MM-DD
**Autor:** Nome
**Reviewers:** Nomes
**Status:** [Rascunho | Em revisão | Finalizado]

## Resumo
[200 palavras: o que, impacto, causa raiz, ação]

## Linha do tempo
[Tabela cronológica]

## Impacto
[Quantitativo + qualitativo]

## Causa raiz (5 Whys)
[5 níveis de profundidade]

## O que deu certo
[3-5 itens]

## O que pode melhorar
[3-5 itens]

## Ações corretivas
[Tabela com owner + prazo]

## Lições aprendidas
[3-5 lições]

## Anexos
- Logs
- Screenshots
- Comunicação enviada
```

## 📋 Regras Blameless (Invioláveis)

1. **Foco no sistema, não na pessoa**
   - ❌ "O João fez deploy sem testar"
   - ✅ "O processo permitiu deploy sem teste integration"

2. **Reconhecer o contexto**
   - ❌ "Foi um erro estúpido"
   - ✅ "Com a informação que ele tinha naquele momento, a decisão fazia sentido"

3. **Falhas são dados, não crimes**
   - Toda falha é uma oportunidade de aprender sobre o sistema
   - Se 1 pessoa errou, provavelmente 10 fariam o mesmo

4. **Quem errou geralmente é quem trabalhou mais**
   - Reconhecer o esforço, não só o erro

5. **Preservar confiança do time**
   - Se time não se sente seguro, não vai reportar problemas
   - Transparência > aparência de perfeição

## 📋 Erros Comuns a Evitar

- ❌ **Pular o post-mortem** (incidente grave vira lenda urbana)
- ❌ **Demorar mais de 1 semana** (memória perde detalhes)
- ❌ **Sem ações** (análise sem execução = teatro)
- ❌ **Ações vagas** ("comunicar melhor" não é ação)
- ❌ **Sem owner** (responsabilidade difusa = zero execução)
- ❌ **Apontar culpados** (pessoas vão se proteger, não reportar)
- ❌ **Nunca fazer check-in** (ações esquecem, incidentes repetem)

## 📋 Quando é Incidente "Real" vs "Quase"

| Incidente Real | "Quase" (Near-Miss) |
|----------------|---------------------|
| Afetou usuários | Poderia ter afetado mas foi contido |
| Teve downtime | Deploy falhou mas rollback rápido |
| Breach de segurança | Vulnerabilidade descoberta antes de explorar |
| Perda de dados | Dados em risco mas salvos |
| **→ Fazer post-mortem completo** | **→ Fazer near-miss report (mais simples)** |

## 📋 Cultura de Post-Mortem

**Sinais de cultura saudável:**
- Time reporta problemas proativamente
- Post-mortems são celebrados (não temidos)
- Ações são executadas (não ignoradas)
- Pessoas aprendem com erros (não se escondem)
- Discussões são técnicas, não pessoais

**Sinais de cultura doente:**
- Esconde-se incidentes
- Post-mortem vira "caça às bruxas"
- Ações nunca são executadas
- Mesma causa raiz aparece 3+ vezes
- Time tem medo de reportar

## 📚 Materiais Relacionados

- `governanca/RATIFICACAO-LOOP-M4-M5-M7.md` — quando incidente vira decisão C-Suite
- `Lab-Nexus/prompts/governanca/01-decisao-csuite-ratificar.md` — template de proposta
- `Lab-Nexus/prompts/governanca/02-postmortem-incidente.md` — template completo
- `playbooks/PB-CRISES-gestao-crise-data-loss.md` — resposta a data loss
- `playbooks/PB-CRISES-gestao-crise-autonomia.md` — crise de autonomia
- `tutoriais/15-debugar-agente-lento.md` — debug técnico

---

*AcademIA · Playbook PB-GOVERN · 2026*