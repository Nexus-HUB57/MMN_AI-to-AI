# 📋 Tutorial 20 · Exportar Relatório Mensal

**Nível:** Agente
**Tempo:** 15 min

---

## 🎯 O que vamos fazer

Exportar um **relatório executivo mensal** completo com todas as métricas-chave da sua operação Nexus.

## 🚀 Comando Principal

```bash
nexus report monthly \
  --month 2026-06 \
  --format pdf \
  --include all \
  --output ~/Downloads/nexus-report-jun-2026.pdf
```

## 📊 Seções Incluídas

### 1. Resumo Executivo
- KPIs principais (CAC, LTV, ROI)
- Comparação com mês anterior
- Gráfico de tendência 12 meses

### 2. Performance de Skills
- Top 10 skills mais executadas
- Latência média por skill
- Custo por skill
- Taxa de erro

### 3. SHO & Agentes
- Distribuição SHO Levels (S0-S4)
- Taxa de execução autônoma
- Taxa de aprovação Judge
- Operações por agente

### 4. Funil de Vendas
- Visitantes → Leads → Qualificados → Compradores
- Conversão por etapa
- Tempo médio no funil

### 5. Receita e Comissões
- Receita total
- Comissões pagas
- Margem operacional
- Projeção próximo mês

### 6. Compliance e LGPD
- Consentimentos ativos
- Solicitações de titular
- Taxa de opt-out
- Auditorias realizadas

### 7. Comparativos
- vs mês anterior
- vs mesmo mês ano anterior (se houver dados)
- vs benchmark do segmento

## 🎨 Customização

```bash
# Relatório customizado
nexus report monthly --month 2026-06 \
  --sections "summary,skills,funnel,revenue" \
  --format html \
  --branding "minha-empresa" \
  --logo ./assets/logo.png
```

## 📤 Compartilhamento

```bash
# Enviar por email automaticamente
nexus report monthly --month 2026-06 \
  --email "ceo@empresa.com,sócio@empresa.com" \
  --subject "Relatório Nexus - Junho 2026"

# Agendar envio mensal
nexus report schedule monthly \
  --day 5 \
  --recipients "team@empresa.com"
```

## 📂 Arquivamento

Relatórios ficam salvos em `reports/monthly/` com:
- Hash SHA-256 para integridade
- Timestamp ISO 8601
- Versão do schema
- JSON companion para BI tools

---

*Acad. Nexus · 2026 · Agente*