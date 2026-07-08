# 📊 Tutorial 19 · Ler e Interpretar Métricas do SHO

**Nível:** Master
**Tempo:** 30 min

---

## 🎯 Objetivo

Entender o dashboard de métricas do **Sistema Híbrido de Orquestração (SHO)** e tomar decisões data-driven.

## 📊 Onde acessar

```
https://app.oneverso.com.br/admin/sho/metrics
```

## 📈 As 8 Métricas-Chave

### 1. Taxa de Execução Autônoma (TEA)

```
TEA = decisões_executadas_S3+ / total_decisões
```

- **< 30%:** Subutilizando autonomia
- **30-60%:** Operacional saudável
- **60-80%:** Maduro, escala alta
- **> 80%:** ⚠️ Risco de over-autonomy (auditar)

### 2. Taxa de Aprovação Judge (TAJ)

```
TAJ = aprovações_judge / total_submetidas
```

- **< 70%:** Judge muito rigoroso, revisar thresholds
- **70-85%:** Saudável
- **> 95%:** Judge muito permissivo, calibrar

### 3. Latência Média p95

- **< 2s:** Excelente
- **2-5s:** Aceitável
- **> 5s:** Otimizar

### 4. Custo por Decisão (CPD)

```
CPD = USD_total / num_decisões
```

Benchmark Nexus: **$0.02-0.05** por decisão complexa.

### 5. Taxa de Rollback

```
TR = operacoes_revertidas / operacoes_executadas
```

- **< 1%:** Saudável
- **1-3%:** Atenção, revisar causas
- **> 3%:** Crítico, suspender S3

### 6. Distribuição SHO Levels

```
[ S0, S1, S2, S3, S4 ] por %
```

Distribuição saudável para operação madura:
- S0: 0%
- S1: 5%
- S2: 25%
- S3: 60%
- S4: 10%

### 7. Skills Mais Executadas

Top 10 skills por volume de execução. Útil para:
- Identificar gargalos
- Otimizar skills mais usadas
- Decidir quais promover para S3

### 8. Erros por Categoria

Breakdown de erros (timeout, validation, API, etc).

## 🎯 Comandos Úteis

```bash
# Relatório consolidado
nexus sho report --window 7d --format markdown

# Drill-down em métrica
nexus sho metric TEA --breakdown-by skill --window 30d

# Export para análise
nexus sho export --window 90d --format csv > sho_metrics_q2.csv

# Alerta se métrica fora do range
nexus sho watch --metric TAJ --alert-if-below 0.70
```

## 📊 Interpretação Comum

**Cenário A — TEA 25%, Latência 3s**
Diagnóstico: sistema conservador, muitas aprovações humanas
Ação: promover 2-3 skills seguras para S3

**Cenário B — TEA 75%, TAJ 65%**
Diagnóstico: alta autonomia mas Judge reprovando muito
Ação: revisar thresholds do Judge Revisor

**Cenário C — CPD subindo 20% mês a mês**
Diagnóstico: skills usando modelos mais caros que necessário
Ação: migrar para modelos menores onde apropriado

---

*Acad. Nexus · 2026 · Master*
