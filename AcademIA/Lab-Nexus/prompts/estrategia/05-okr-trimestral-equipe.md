# 🎯 Prompt 05 · OKR Trimestral para Equipe

**Categoria:** estrategia
**Nível:** Master
**Quando usar:** Início de trimestre, planejamento de equipe
**Tempo:** 90 min
**Versão:** 1.0

---

## 🎯 Objetivo

Gerar **OKRs completos do trimestre para uma equipe de 3-15 pessoas**, com Key Results mensuráveis e iniciativas táticas.

## 📥 Inputs

```yaml
empresa: "Nome da empresa"
trimestre: "Ex: Q3-2026"
equipe: "Time específico (ex: marketing, vendas, produto)"
tamanho_time: "Nº de pessoas"
orcamento_disponivel: "R$ X / mês"
contexto_estrategico: "1 parágrafo: o que mudou, prioridade macro"
principal_desafio: "O que está impedindo crescimento hoje"
visao_12_meses: "Onde a empresa quer chegar em 12 meses"
```

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um Estrategista Sênior de OKRs. Implementou OKRs em 50+
empresas (startups, scale-ups, mid-market). Domina:
- Framework original Andy Grove (Intel)
- Variação Google (Moonshots + Roofshots)
- CFR (Conversations, Feedback, Recognition)
- Weekly Check-in ritual
- Anti-patterns de OKRs (targets de performance disfarçados)

# OBJETIVO
Gerar OKRs completos do {trimestre} para {equipe} da {empresa}.
Tamanho do time: {tamanho_time}. Orçamento: {orcamento_disponivel}/mês.
Contexto: {contexto_estrategico}.
Desafio principal: {principal_desafio}.
Visão 12 meses: {visao_12_meses}.

# REGRAS FUNDAMENTAIS DE OKRs
1. **Poucos e ambiciosos** — 3-5 Objectives por time, 3-5 Key Results por Objective
2. **Key Results são mensuráveis** — número, %, $, não "melhorar X"
3. **70% de atingimento é sucesso** — se bater 100%, não era ambicioso
4. **Outcome, não output** — "crescer receita 30%" não "publicar 100 posts"
5. **Time-level, não individual** — foco no coletivo
6. **Públicos e visíveis** — todos da empresa veem
7. **Trimestral, não anual** — revisado a cada 3 meses
8. **Iniciativas ≠ Key Results** — iniciativas são os COMOS, KRs são os ONDE CHEGAMOS

# ESTRUTURA DA RESPOSTA

## 1. CONTEXTO ESTRATÉGICO (150 palavras)
- Resumo do momento da empresa
- Por que este trimestre é crítico
- Como se conecta à visão 12 meses
- O que está em jogo (R$, market position, reputation)

## 2. TOP 3 PRIORIDADES DO TRIMESTRE (não-óbvias)
Em vez de "fazer mais", defina onde ganhar/perder foco:

1. **DOBRAR EM:** [área onde vamos investir pesado]
2. **MANTER:** [área funcionando bem, manter como está]
3. **PARAR DE FAZER:** [área que vamos cortar/descontinuar]

Justificativa de cada uma.

## 3. OKRS DO TIME (3 Objectives, 3-5 KRs cada)

### OBJECTIVE 1: [Verbo no infinitivo] [resultado aspiracional]
**Por que agora:** [contexto]
**Owner:** [nome/papel]
**Dependências:** [outras equipes/sistemas]

- **KR 1.1:** [métrica] de [baseline] para [target]
  - Baseline: ___
  - Target: ___
  - Source: ___
- **KR 1.2:** ...
- **KR 1.3:** ...

**Iniciativas (COMO):**
1. [Iniciativa 1] — Owner: X, Entrega: data
2. [Iniciativa 2] — Owner: Y, Entrega: data
3. [Iniciativa 3] — Owner: Z, Entrega: data

[Repetir para Objective 2 e 3]

## 4. CAPACIDADES NECESSÁRIAS
O que o time precisa ter/saber para executar:
- [Capacidade técnica]
- [Capacidade de processo]
- [Capacidade de ferramenta]
- [Capacidade de headcount]

Contratar vs. treinar vs. automatizar — recomende para cada.

## 5. RITUAL DE ACOMPANHAMENTO
- **Weekly Check-in (60 min):** o que avançou, bloqueios, decisões
- **Monthly Review (4h):** progresso dos KRs, ajustar se necessário
- **Quarterly Retro (4h):** o que aprendemos, próximos 90 dias

## 6. RISCOS E MITIGAÇÕES
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| 1 | Alta/Média/Baixa | Alto/Médio/Baixo | ... |
| 2 | | | |

## 7. BUDGET ALLOCATION
| Linha | R$/mês | Justificativa |
|-------|--------|---------------|
| Pessoas (X FTEs) | | |
| Ferramentas | | |
| Tráfego pago | | |
| Conteúdo/produção | | |
| Buffer | | |
| **Total** | | |

## 8. DEFINIÇÃO DE SUCESSO
Se em {trimestre} atingirmos [X% dos KRs + lista de qualitativos],
consideramos o trimestre um sucesso porque [razão].

# ESTILO
- Linguagem simples e direta
- KRs em formato "[métrica] de [baseline] para [target] até [data]"
- Sem jargão corporativo vazio
- Pronto para apresentar pro time

# AUDIÊNCIA
Time de {tamanho_time} pessoas. Nível médio-alto. Quer clareza,
não teoria.

# REGRAS ADICIONAIS
- NUNCA misture output com outcome
- NUNCA coloque iniciativa como KR
- NUNCA use "ou mais" nos KRs (vira desculpa)
- SEMPRE tenha baseline claro
- SEMPRE tenha source de dados do KR
- Se orçamento < R$ 10k/mês, ser muito conservador nas metas
```

## 🎯 Exemplo de Output (parcial)

```markdown
## 1. CONTEXTO ESTRATÉGICO

Empresa está em R$ 80k MRR, crescendo 15% a.a. mas aquém do plano.
Visão 12 meses: R$ 250k MRR. Trimestre atual é decisivo para validar se
escala ou se estagna. Desafio: converter leads de trial em pago (atualmente
8%, meta 25%).

## 2. TOP 3 PRIORIDADES

1. **DOBRAR EM:** Trial → conversão (passar de 8% para 25%)
2. **MANTER:** NPS atual (>50), churn mensal (<3%)
3. **PARAR DE FAZER:** Posts diários LinkedIn (ROI baixo, baixa audiência)

## 3. OKRS

### OBJECTIVE 1: CONVERTER trial em pago com machine learning
**Owner:** Head de Growth

- **KR 1.1:** Taxa trial → pago de 8% para 25% até fim do trimestre
  - Source: Stripe dashboard + Mixpanel
- **KR 1.2:** Tempo médio de conversão (trial start → paid) de 11 dias para 6 dias
- **KR 1.3:** NPS pós-trial de +42 para +60

**Iniciativas:**
1. Email personalizado da Sra. Ive no D+7, D+10, D+13 — Owner: CS, Entrega: 15/jul
2. WhatsApp com case de sucesso para trial ativo há 10+ dias — Owner: CS, Entrega: 22/jul
3. Oferta de downgrade para plano Starter no D+11 — Owner: Produto, Entrega: 30/jul
```

## 📊 Métricas de Avaliação

- **Atingimento:** % de KRs cumpridos (meta: 70-80% é saudável)
- **Velocidade:** tempo entre definição e primeira ação (meta: < 1 semana)
- **Engajamento do time:** % do time que sabe os OKRs de cor (meta: > 80%)
- **Ajuste:** % de KRs revisados durante o trimestre (meta: < 20% — sinal de má definição inicial)

## 🚨 Anti-Patterns Comuns (EVITE)

- ❌ "Aumentar engajamento" — sem métrica clara
- ❌ "Lançar 5 features" — output, não outcome
- ❌ "Ficar acima de X" — sem teto superior claro
- ❌ "Reduzir tempo de Y" — sem baseline especificado
- ❌ Copiar OKRs do concorrente — vocês têm contexto diferente
- ❌ Ter 10 Objectives — time perde foco

---

*Lab-Nexus · prompt/05 · 2026*