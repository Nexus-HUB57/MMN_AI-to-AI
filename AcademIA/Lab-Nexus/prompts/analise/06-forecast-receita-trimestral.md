# 📈 Prompt 06 · Forecast de Receita Trimestral

**Categoria:** analise
**Nível:** Master → Elite
**Quando usar:** Mensalmente, para C-Suite + conselho
**Tempo:** 30 min
**Versão:** 1.0

---

## 🎯 Objetivo

Gerar **forecast de receita dos próximos 3-12 meses** com cenários (otimista/base/pessimista), identificar drivers e recomendar ações.

## 📥 Inputs

```yaml
empresa: "Nome"
produto_principal: "Descrição"
receita_atual_mrr: "R$ X"
crescimento_mensal_atual: "X% a.m."
churn_mensal_atual: "X%"
cac: "R$ X"
ltv: "R$ X"
orcamento_marketing: "R$ X / mês"
equipe_vendas: "X pessoas"
pipeline_atual: "R$ X em deals abertos"
horizonte_forecast: "3-12 meses"
eventos_conhecidos: "Lançamentos, sazonalidade, mudanças conhecidas"
```

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um CFO/AI Sênior especializado em previsões de receita SaaS e
infoprodutos. Tem 15 anos de experiência com forecast para empresas de
R$ 100k a R$ 50M MRR. Domina:
- Bottom-up forecasting (cohort-based)
- Top-down forecasting (market sizing)
- Monte Carlo simulation
- Análise de coorte e retenção
- Modelo de unidade econômica (LTV, CAC, payback)
- Framework FORCAST (Dave Kellogg)

# OBJETIVO
Gerar forecast trimestral de MRR para {empresa} considerando:
- MRR atual: {receita_atual_mrr}
- Crescimento atual: {crescimento_mensal_atual}
- Churn atual: {churn_mensal_atual}
- CAC: {cac}
- LTV: {ltv}
- Orçamento marketing: {orcamento_marketing}
- Equipe vendas: {equipe_vendas}
- Pipeline: {pipeline_atual}
- Horizonte: {horizonte_forecast}
- Eventos: {eventos_conhecidos}

# ESTRUTURA DA RESPOSTA

## 1. SUMÁRIO EXECUTIVO (150 palavras)
- Cenário base: MRR em {horizonte_forecast} meses = R$ X (crescimento Y%)
- Cenário otimista: R$ X
- Cenário pessimista: R$ X
- Probabilidade de cada cenário (%)
- Ação crítica recomendada

## 2. ANÁLISE DE DRIVERS
Quais variáveis mais impactam o forecast?

| Driver | Peso | Estado atual | Ação |
|--------|------|--------------|------|
| Aquisição (leads/mês) | 30% | X | |
| Conversão lead→cliente | 25% | X% | |
| Ticket médio | 15% | R$ X | |
| Churn mensal | 20% | X% | |
| Expansão (upsell) | 10% | R$ X | |

## 3. FORECAST MÊS-A-MÊS (3 cenários)

### CENÁRIO BASE (probabilidade 60%)
| Mês | MRR | Novos | Churn | Expansão |
|-----|-----|-------|-------|----------|
| M+1 | | | | |
| M+2 | | | | |
| M+3 | | | | |
| ... | | | | |

### CENÁRIO OTIMISTA (probabilidade 20%)
(mesma estrutura, valores +20-30%)

### CENÁRIO PESSIMISTA (probabilidade 20%)
(mesma estrutura, valores -20-30%)

## 4. ANÁLISE DE COORTE
Se sua base atual entrou nos últimos 12 meses, qual a retenção esperada
em M+3, M+6, M+12?

Tabela ou curva:
| Cohort | M+0 | M+3 | M+6 | M+12 |
|--------|-----|-----|-----|------|
| Jan-2026 | 100% | 85% | 78% | 65% |
| Fev-2026 | 100% | 87% | 80% | ... |
| ... | | | | |

## 5. UNIT ECONOMICS PROJETADA

| Métrica | Hoje | M+3 | M+6 | M+12 |
|---------|------|------|------|-------|
| LTV | R$ X | R$ X | R$ X | R$ X |
| CAC | R$ X | R$ X | R$ X | R$ X |
| LTV/CAC | X× | X× | X× | X× |
| Payback | X meses | X | X | X |
| Margem bruta | X% | X | X | X |

## 6. ANÁLISE DE SENSIBILIDADE
O que acontece com o forecast se:

| Cenário | Δ MRR |
|---------|-------|
| Aquisição cai 20% | -R$ X |
| Churn sobe 1pp | -R$ X |
| Ticket médio sobe 10% | +R$ X |
| +1 vendedor (R$ 8k/mês) | +R$ X (em Y meses) |
| Black Friday forte | +R$ X |

## 7. GARGALOS IDENTIFICADOS
Top 3 gargalos que limitam crescimento:
1. ...
2. ...
3. ...

Recomendação para cada um:
- Ação
- Investimento necessário
- ROI esperado
- Prazo

## 8. METAS INTERMEDIÁRIAS
Para chegar no forecast base, quais marcos mensais precisamos?

| Marco | Meta | Como medir | Se vermelho |
|-------|------|------------|-------------|
| M+1 | | | |
| M+2 | | | |
| M+3 | | | |

## 9. RECOMENDAÇÃO FINAL

✅ / ⚠️ / 🚨 Status: ...

Justificativa: ...

Confiança (0-100%): ...

Próxima revisão: ...

# ESTILO
- Linguagem executiva, baseada em dados
- Tabelas e números concretos
- Citar premissas (não só conclusões)
- Trade-offs explícitos

# AUDIÊNCIA
C-Suite + sócio humano. Pessoas que decidem com base nesse forecast.

# REGRAS
1. SEMPRE apresentar 3 cenários (não só 1)
2. SEMPRE declarar premissas de cada cenário
3. SEMPRE calcular confidence interval
4. SEMPRE ter sensitivity analysis
5. SEMPRE identificar top 3 gargalos
6. SEMPRE recomendar ações concretas
7. SEMPRE basear em dados, não wishful thinking
8. NUNCA esconder incerteza (forecast é previsão, não promessa)
9. Se dados insuficientes, pedir antes de calcular
```

## 🎯 Exemplo de Output (parcial)

```markdown
## 1. SUMÁRIO EXECUTIVO

Cenário base (60%): MRR em 6 meses = R$ 145k (crescimento 11% a.m.).
Cenário otimista (20%): R$ 180k. Pessimista (20%): R$ 110k.

Recomendação: dobrar investimento em aquisição + focar em reduzir
churn de 4% para 3%. Sem isso, atingimos base. Com isso, otimista.

## 3. FORECAST BASE

| Mês | MRR | Novos | Churn | Expansão |
|-----|-----|-------|-------|----------|
| Atual | 87k | 320 | 280 | 40 |
| M+1 | 92k | 380 | 290 | 50 |
| M+2 | 99k | 420 | 305 | 55 |
| M+3 | 108k | 460 | 320 | 65 |
| M+6 | 145k | 580 | 380 | 80 |

## 4. ANÁLISE DE COORTE

| Cohort | M+0 | M+3 | M+6 | M+12 |
|--------|-----|-----|-----|------|
| Q1-2026 | 100% | 88% | 79% | 68% |
| Q2-2026 | 100% | 91% | 84% | ? |

## 7. GARGALOS

1. **CAC subindo** — R$ 67 → R$ 95 últimos 3 meses. Investigar.
2. **Churn de mês 4-6** — 8% dos clientes cancelam nesse intervalo. Onboarding?
3. **Conversão lead→trial** estagnada em 22%. Copy saturada?

## 9. RECOMENDAÇÃO

✅ Status: atingível com ações corretivas
Confiança: 70%
Revisão: mensalmente
```

## 📊 Métricas de Avaliação do Forecast

- **Acurácia:** forecast vs real (meta: ±15%)
- **Calibração:** probabilidade dos cenários bate com a realidade
- **Lead time:** quantas semanas antes o forecast detecta problema
- **Bias:** tendência a superestimar ou subestimar

## 🚨 Anti-Patterns Comuns

- ❌ Forecast sem premissas explícitas
- ❌ Só cenário base (sem upside/downside)
- ❌ Confiança 95%+ em tudo (overconfidence)
- ❌ Ignorar churn no forecast
- ❌ Crescimento linear perpétuo (raro)
- ❌ Não atualizar forecast mensalmente

---

*Lab-Nexus · prompt/06 · 2026*