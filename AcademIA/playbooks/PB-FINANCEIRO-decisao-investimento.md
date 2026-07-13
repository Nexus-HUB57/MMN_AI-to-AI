---
title: "PB-FINANCEIRO · Decisão de Investimento"
description: "Playbook completo para aprovar/rejeitar investimento > R$ 50k"
tags: [playbook, financas, investimento, roi, cac, ltv, decisao]
nivel: Elite / Executivo
duracao: "1-2 semanas para análise + 1 dia para decidir"
autor: "Otto Cardoso (CFO/AI) + Equipo Nexus"
date: 2026-07-07
---

# 💰 PB-FINANCEIRO · Decisão de Investimento

> Playbook para **aprovar, rejeitar ou adiar** investimentos > R$ 50k. Pensado para C-Suite + sócio humano.

## 🎯 Quando usar

- ✅ Contratar pessoa nova (≥ R$ 50k/ano all-in)
- ✅ Lançar produto novo
- ✅ Investir em marketing (campanha > R$ 50k)
- ✅ Comprar ferramenta/infraestrutura (≥ R$ 50k/ano)
- ✅ Abrir mercado novo (escritório, novo país)
- ❌ Não usar para decisões < R$ 50k (overhead não compensa)

## 📋 Fluxo (10 passos em 2 semanas)

### DIA 1-3: PROPOSTA INICIAL

**Passo 1: Quem propõe documenta (2-4h)**
- Preencher template `proposta-investimento.md`:
  - O que está sendo proposto (1 frase)
  - Quanto custa (R$ X total ou R$ Y/mês)
  - Qual o retorno esperado (R$ em 12 meses)
  - Quais os riscos principais (3 bullets)
  - Qual o reverso se der errado

**Passo 2: Reunião 1:1 com proponente + CFO/AI (1h)**
- CFO/AI faz perguntas cegas
- Preenche modelo financeiro preliminar (ROI, payback, IRR)
- Devolve ao proponente com ajustes pedidos

### DIA 4-7: ANÁLISE APROFUNDADA

**Passo 3: CFO/AI prepara business case (4-8h)**
- 3 cenários (otimista/base/pessimista)
- Análise de sensibilidade (variação em 3-5 variáveis)
- Comparação com alternativa "não fazer nada"
- Impacto no orçamento mensal (%)
- Impacto no runway (meses)

**Passo 4: Reunião com C-Suite estendida (2h)**
- Proponente apresenta (15 min)
- CFO/AI apresenta business case (30 min)
- Discussão aberta (45 min)
- Pré-voto informal de cada C-Suite (30 min)

**Passo 5: Due diligence complementar (se aplicável, 8-16h)**
- Pesquisas de mercado
- Conversas com fornecedores
- Benchmarking com concorrentes
- Validação de premissas com clientes

### DIA 8-10: DECISÃO

**Passo 6: Decisão via Governance Loop M4**
- Submeter para ratificação C-Suite
- Quorum necessário: ≥ 3/5 (decisão tática R$ 50k-500k)
- Cada C-level vota com rationale
- CFO/AI documenta votos + decisão final

**Passo 7: Comunicação da decisão (mesmo dia)**
- Email para time (aprovação/rejeição/adiamento)
- Justificativa pública (1 parágrafo)
- Próximos passos claros (quem, quando, o quê)

### DIA 11-14: EXECUÇÃO

**Passo 8: Kick-off com owner designado**
- COO/AI designa executor
- Define milestones de 30-60-90 dias
- KPIs de sucesso
- Plano de reversão (se aplicável)

**Passo 9: Monitoramento (mensal)**
- Dashboard de progresso
- Comparação forecast vs real
- Auto-revisão em marcos (30-60-90)

**Passo 10: Post-mortem (em 90 dias)**
- Atingiu KPIs?
- Lição aprendida
- Atualizar baseline

## 📊 Modelo Financeiro (Preencher)

```yaml
investimento_total: "R$ X"
custo_mensal_recorrente: "R$ Y/mês (salário, ferramenta, etc)"
duracao_esperada: "Z meses (tempo até ver retorno)"
receita_adicional_esperada: "R$ W em 12 meses"
economia_custo_esperada: "R$ V em 12 meses (se aplicável)"
roi_12_meses: "X%"  # (receita + economia - custo) / custo
payback_meses: "M meses"
sensibilidade: "Se receita for 50% do esperado, ROI ainda é positivo?"
alternativa_nao_fazer: "Custo de oportunidade de R$ Z em 12 meses"
reversibilidade: "Total | Parcial | Irreversível"
```

## 🧮 Matriz de Decisão (Pontuação 1-5)

| Critério (peso) | Nota (1-5) | Ponderado |
|-----------------|------------|-----------|
| ROI esperado (25%) | | |
| Alinhamento estratégico (20%) | | |
| Risco (15%) | | |
| Velocidade execução (10%) | | |
| Reversibilidade (10%) | | |
| Impacto equipe (10%) | | |
| Compliance/legal (5%) | | |
| **TOTAL** | | **X / 5** |

**Interpretação:**
- **< 2.5**: rejeitar (ROI baixo, risco alto)
- **2.5-3.5**: adiar (premissas precisam amadurecer)
- **3.5-4.5**: aprovar com condições
- **> 4.5**: aprovar e executar com prioridade

## ❌ Red Flags (Rejeição Automática)

- ROI projetado < 0 (não paga nem o custo)
- Payback > 24 meses (longo demais)
- Sem alternativa "não fazer" considerada
- Sem KPIs definidos para medir sucesso
- Sem plano de reversão se for investimento significativo
- Riscos não identificados (proponente não pensou em falhas)
- Queima > 30% do runway mensal

## ✅ Green Flags (Aprovação Rápida)

- ROI > 3× em 12 meses
- Payback < 6 meses
- Reversível totalmente
- Alinha com foco estratégico
- Já validado em menor escala
- Owner experiente + comprometido

## 📋 Templates e Ferramentas

| Recurso | Onde está |
|---|---|
| Template proposta | `Lab-Nexus/templates/financeiro/proposta-investimento.md` |
| Planilha business case | `Lab-Nexus/tools/financas/01-business-case-template.md` |
| Matriz de decisão | incluir no template acima |
| Governance Loop | `governanca/RATIFICACAO-LOOP-M4-M5-M7.md` |
| Prompt CFO/AI | `Lab-Nexus/prompts/analise/06-forecast-receita-trimestral.md` |

## 🎯 Exemplos Práticos

### Exemplo 1: Contratar Engenheiro Sênior (R$ 80k/ano)

```
Investimento: R$ 80k/ano (R$ 6.7k/mês all-in)
Expectativa: acelerar 2 features que travam receita
Receita esperada: +R$ 25k/mês em 6 meses (R$ 150k em 6m)
ROI 12m: (150k - 80k) / 80k = 87% em 12 meses, 250% em 18m
Payback: 4 meses
Risco: médio (depende da contratação certa)
Reversibilidade: alta (demitir é viável)

✅ APROVAR com condição:
- Contratação validada em 90 dias
- 2 features entregues em 120 dias
- Receita incremental medida em 180 dias
- Se não, realocar para projeto diferente
```

### Exemplo 2: Campanha Black Friday (R$ 60k)

```
Investimento: R$ 60k (1 mês)
Expectativa: receita bruta R$ 300k, líquida R$ 200k (após fees + devoluções)
ROI: 233% em 1 mês
Payback: imediato
Risco: baixo (campanha tem janela clara)
Reversibilidade: baixa (dinheiro gasto em ads não volta)

✅ APROVAR SEM CONDIÇÃO
Owner: CMO/AI (Helena)
Prazo: definir 2026-10-15
Métricas: ROAS ≥ 4×, conversão ≥ 3%
```

### Exemplo 3: Abrir escritório SP (R$ 180k/ano)

```
Investimento: R$ 180k/ano fixo + R$ 50k setup = R$ 230k ano 1
Expectativa: +R$ 600k/ano receita SP
ROI ano 1: (600k - 230k) / 230k = 160% (mas requer execução)
Payback: 4-6 meses se executado bem, 12+ se mal
Risco: ALTO (primeira operação física fora do RJ)
Reversibilidade: baixa (contratos aluguel, demissões caras)

⚠️ APROVAR COM 3 CONDIÇÕES:
1. Contratar country manager validado em 60 dias (senão abortar)
2. 3 clientes-piloto em pipeline em 30 dias
3. Review formal em 90 dias com go/no-go
```

## 🆘 Em Caso de Decisão Adiada

- Definir **data de revisão** (não deixar indefinido)
- Especificar **o que precisa mudar** pra reavaliar
- Documentar em ata pra histórico
- Reavaliar com novos dados, não repetir argumentos

## 📚 Materiais Relacionados

- `governanca/C-SUITE-AI.md` — quem decide
- `governanca/RATIFICACAO-LOOP-M4-M5-M7.md` — fluxo formal
- `Lab-Nexus/prompts/governanca/01-decisao-csuite-ratificar.md` — template
- `Lab-Nexus/prompts/analise/06-forecast-receita-trimestral.md` — forecast
- `apostilas/13-monetizacao-avancada-escala.md` — contexto
- `webinars/WB-2026-08-financeiro-ia.md` — live Otto

---

*AcademIA · Playbook PB-FINANCEIRO · 2026*