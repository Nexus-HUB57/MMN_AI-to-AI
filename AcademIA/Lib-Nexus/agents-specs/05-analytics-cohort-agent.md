---
title: "Agent Spec · Analytics & Cohort"
agent_code: AGENT-ANALYTICS-COHORT
version: "1.0.0"
category: analytics
status: stable
owner: AcademIA / Data Vertical
last_updated: 2026-06-28
pattern: "MMN_IA"
---

# 📊 Agent Spec — Analytics & Cohort (AGENT-ANALYTICS-COHORT)

> **Agente especializado em análise de coortes, métricas de funil, e insights preditivos**. Transforma dados brutos em decisões de negócio — desde segmentação automática até previsão de churn.

## 📋 Resumo

| Aspecto | Detalhe |
|---|---|
| **Função primária** | Analisar dados do tenant, gerar insights acionáveis, prever comportamentos |
| **Modelos preferidos** | Claude Opus 4.7 (análise complexa), Claude Sonnet 4.5 (relatórios) |
| **Skills requeridas** | cohort-analyzer-v2, funnel-lifecycle-v4, ab-test-judge |
| **Latência alvo** | <30s para queries simples, <5min para análise profunda |
| **Custo por execução** | R$0.10-2.00 conforme complexidade |
| **Compliance** | LGPD (anonimização obrigatória), GDPR (data residency) |

## 🎯 Casos de uso

- Segmentar base de contatos em coortes significativas.
- Calcular **LTV (Lifetime Value)** por coorte.
- Identificar coortes em **risco de churn**.
- Prever **taxa de conversão** de campanha futura.
- Detectar **anomalias** em métricas de funil.
- Gerar **relatório executivo** mensal automático.
- Sugerir **próximas ações** baseado em padrões.
- **A/B testing analysis** estatística robusta.

## 🔧 Inputs

```typescript
interface AnalyticsInput {
  // Escopo da análise
  tenant_id: string;
  cohort_definicao?: {
    tipo: 'temporal' | 'comportamental' | 'demografica' | 'personalizada';
    criterios: Record<string, any>;
  };
  
  // Tipo de análise
  analise_tipo: 
    | 'segmentacao'         // criar coortes
    | 'ltv_analise'          // LTV por coorte
    | 'churn_predicao'       // prever churn
    | 'conversao_predicao'   // prever conversão
    | 'anomalia_deteccao'    // detectar outliers
    | 'relatorio_executivo'  // summary para C-level
    | 'ab_test_analysis';    // análise estatística
  
  // Janela temporal
  periodo: {
    inicio: string;          // ISO date
    fim: string;             // ISO date
  };
  
  // Granularidade
  granularidade: 'hora' | 'dia' | 'semana' | 'mes';
  
  // Constraints
  anonimizar_pii: boolean;  // sempre true em produção
  max_execucao_segundos?: number;
  
  // Contexto
  contexto_negocio?: string; // ex: "lançamento Black Friday"
  hipoteses?: string[];      // hipóteses a validar
}
```

## 📤 Outputs

```typescript
interface AnalyticsOutput {
  // Sumário
  sumario_executivo: string;
  
  // Coortes identificadas
  cohortes?: Array<{
    nome: string;
    criterios: Record<string, any>;
    tamanho: number;
    metricas_principais: Record<string, number>;
    tendencia: 'crescente' | 'estavel' | 'decrescente';
  }>;
  
  // Insights
  insights: Array<{
    tipo: 'oportunidade' | 'risco' | 'anomalia' | 'tendencia';
    titulo: string;
    descricao: string;
    impacto_estimado: string;
    acao_sugerida: string;
    confianca: number;
  }>;
  
  // Predições
  predicoes?: Array<{
    metrica: string;
    valor_previsto: number;
    intervalo_confianca: [number, number];
    horizonte_dias: number;
  }>;
  
  // Recomendações
  recomendacoes: Array<{
    prioridade: 'alta' | 'media' | 'baixa';
    acao: string;
    esforco_estimado: string;
    impacto_esperado: string;
  }>;
  
  // Anexos
  visualizacoes?: Array<{
    tipo: 'grafico' | 'tabela' | 'heatmap';
    titulo: string;
    dados: any;
  }>;
  
  // Meta
  confianca_geral: number;
  metodologia: string;
  data_execucao: string;
}
```

## 🧠 Comportamento detalhado

### Fase 1 — Coleta de Dados
1. Identificar **data sources** necessários (DB, eventos, métricas externas).
2. Executar **queries** com anonimização automática.
3. Validar **completude** dos dados.
4. Sinalizar **gaps** (ex: "faltam dados de 2 dias").

### Fase 2 — Análise Exploratória
1. Estatísticas descritivas (média, mediana, desvio).
2. **Distribuições** por dimensão.
3. **Correlações** significativas.
4. **Outliers** detectados.

### Fase 3 — Análise Aprofundada
1. **Segmentação** (RFM, k-means, comportamental).
2. **Cohort analysis** temporal.
3. **Funnel analysis** com taxas de conversão.
4. **Statistical tests** quando relevante (A/B testing).
5. **Predição** quando aplicável (regressão, classificação).

### Fase 4 — Geração de Insights
1. Filtrar achados por **relevância estatística**.
2. Mapear insights para **ações de negócio**.
3. Estimar **impacto** (em R$, %, etc.).
4. Marcar **confiança** (0-1).

### Fase 5 — Comunicação
1. Sumário executivo (5 frases máximo).
2. Visualizações quando úteis.
3. Recomendações priorizadas.
4. Disclaimer de limitações.

## 🔌 Skills integradas

| Skill | Uso |
|-------|-----|
| `cohort-analyzer-v2` | Análise primária de coortes |
| `funnel-lifecycle-v4` | Análise de funil e lifecycle |
| `ab-test-judge` | Análise estatística de testes |
| `lead-scoring-v3` | Predição de score por lead |

## 🛡️ Policy

**Bloqueado:**
- Análise de **uma única pessoa** (sempre coorte mínima de 30).
- PII em outputs (sempre anonimizado).
- Predição de **atributos protegidos** (raça, religião, etc.).
- Acesso a dados de **outros tenants**.

**Requer aprovação humana:**
- Predições que afetam **decisões de emprego ou crédito**.
- Análises em **dados sensíveis** (saúde, financeiro).
- Outputs para **reguladores**.

**Rate limit:**
- 100 análises/tenant/dia (default).
- Configurável por tier.
- Custo médio tracked por tenant.

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Latência p99 (análise simples) | <30s |
| Latência p99 (análise profunda) | <5min |
| Acurácia de predições | >75% em horizonte 7d |
| Acceptance rate de insights | >60% |
| Policy violation rate | <0.5% |
| CSAT | >4.5 |

## 🧪 Testes

- [ ] test_basic_cohort_segmentation
- [ ] test_ltv_calculation
- [ ] test_churn_prediction_accuracy
- [ ] test_anomaly_detection
- [ ] test_pii_anonymization
- [ ] test_min_cohort_size
- [ ] test_approval_required_analyses
- [ ] test_executive_report_generation

## 🔁 Versioning

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2026-06-28 | Release inicial |
| 0.9.0 | 2026-05-20 | Beta com 30 tenants enterprise |
| 0.5.0 | 2026-04-10 | Alpha com cohort-analyzer-v2 |

## 📂 Recursos

- **Skill principal:** [`/skills/cohort-analyzer-v2/SKILL.md`](../../skills/)
- **Aprofundamento:** [`/apostilas/15-metricas-roi-ecossistema.md`](../../apostilas/15-metricas-roi-ecossistema.md)
- **Compliance:** [`/playbooks/PB-LGPD-avancado-data-subjects.md`](../../playbooks/PB-LGPD-avancado-data-subjects.md)
- **Knowledge base:** [`/knowledge-base/02-taxonomia-skills.md`](../knowledge-base/02-taxonomia-skills.md)

## 👥 Ownership

- **Owner:** AcademIA / Data Vertical
- **Reviewers:** Alencar (Persona), DPO Nexus, Tech Lead
- **Slack:** `#agent-analytics-cohort`

---

*Nexus Affil'IA'te · AGENT-ANALYTICS-COHORT · v1.0.0 · Junho 2026*
