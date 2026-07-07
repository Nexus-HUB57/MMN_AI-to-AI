---
title: "WB-2026-02 · SHO em Produção"
webinar_code: WB-2026-02
date: "2026-04-12"
duration: "90min"
speaker: "Equipe Nexus + Convidados"
tags: [webinar, sho, producao, incidentes, mttr]
last_updated: 2026-06-30
status: "disponivel-gravado"
pattern: "MMN_IA"
---

![Capa — SHO em Produção](../../../assets/ebook_covers/WB-2026-02-thumb.webp)

**WB-2026-02 · SHO em Produção**

*4 meses de operação em produção, 312 incidentes resolvidos automaticamente, e 3 falhas que precisaram de intervenção humana. O que aprendemos.*

**Por Equipe Nexus + Rafael Tanaka · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este webinar**

Este webinar aconteceu 1 mês depois do lançamento do IOAID. O objetivo era apresentar a experiência real de operação do SHO (Self-Healing Orchestrator) após 4 meses em produção.

Foi um webinar **técnico-operacional**: apresentou dados reais, métricas reais, e (principalmente) os erros que aconteceram.

---

# 🎯 Sumário

> **•** 1. O que é SHO (revisão rápida)
> **•** 2. 312 incidentes em 4 meses (categorias)
> **•** 3. O caso das 3 da manhã (incidente crítico)
> **•** 4. MTTR: meta vs real
> **•** 5. Falhas que o SHO não conseguiu curar
> **•** 6. Lições aprendidas (5 takeaways)
> **•** 7. Melhorias implementadas pós-incidente
> **•** 8. Roadmap do SHO 2.0
> **•** 9. Q&A ao vivo

---

**1. O que é SHO (revisão rápida)**

SHO (Self-Healing Orchestrator) é o sistema imunológico do IOAID. Tem 4 papéis:

- **Monitora** — pings cada agente a cada 30s
- **Diagnostica** — classifica a falha (timeout, OOM, API down, etc)
- **Cura** — aplica fix automático (restart, fallback, retry, scale)
- **Aprende** — registra incidente e ajusta thresholds

Em 4 meses, processou 312 incidentes automaticamente. Destes, 309 foram curados sem humano. 3 precisaram de intervenção.

---

**2. 312 incidentes em 4 meses (categorias)**

| Categoria | Qtd | % | Tempo médio de cura |
|-----------|-----|---|---------------------|
| Timeout de API externa (Meta, Telegram) | 87 | 28% | 47s |
| Sobrecarga de memória (OOM) | 64 | 21% | 23s |
| Erro de LLM (rate limit OpenAI) | 58 | 19% | 1m12s |
| Disco cheio (logs) | 41 | 13% | 8m23s |
| Falha de rede (datacenter) | 29 | 9% | 4m17s |
| Latência acima do SLA | 18 | 6% | 2m41s |
| Falha de Judge (regra mal calibrada) | 9 | 3% | 14m52s |
| Outros (raros) | 6 | 1% | variável |
| **TOTAL** | **312** | **100%** | **média: 1m47s** |

A categoria **"Falha de Judge"** é a mais longa (14m52s médio) porque exige análise de regra + ajuste + teste.

---

**3. O caso das 3 da manhã (incidente crítico)**

Em **15 de março de 2026, às 03:14 da manhã**, o SHO detectou falha em **3 dos 5 watchers** simultaneamente. Diagnóstico: **disco cheio** (97% usado) no nó primário.

Ação automática do SHO:
- Migrou tráfego para watchers secundários (réplicas)
- Comprimiu logs antigos (recuperou 18GB)
- Acionou alarme P2 (alta prioridade) para SRE de plantão

Resultado: **zero downtime**, tudo resolvido em 8 minutos.

O SRE de plantão era **o próprio Rafael Tanaka**, que estava monitorando remotamente. Ele confirmou: "Eu vi o alarme, vi o SHO atuando, vi a resolução. Eu não fiz nada. O SHO fez tudo."

Esse caso virou **case study interno** da Nexus.

---

**4. MTTR: meta vs real**

**Meta de MTTR**: < 2 minutos para 90% dos incidentes.

**Real**:
- **P50** (mediano): 47 segundos ✅
- **P90**: 1m52s ✅
- **P95**: 4m17s ⚠️
- **P99**: 14m52s (no caso de Judge mal calibrada) ❌
- **P99.9**: 23 minutos (worst case, 1 vez) ❌

Meta atingida em **92% dos incidentes**. 8% acima de 2 minutos foram, em sua maioria, problemas de Judge ou rede (categorias menos comuns).

---

**5. Falhas que o SHO não conseguiu curar**

Em 4 meses, **3 incidentes** necessitaram intervenção humana direta:

**Falha 1 — Loop infinito em agent (08/abr/2026)**
Um agente entrou em loop infinito consumindo tokens. SHO detectou o padrão (3x consumo normal) em 90s, matou o processo, mas **a causa raiz foi um bug no system prompt**. Intervenção: engenheiro corrigiu o prompt em 4h.

**Falha 2 — Datacenter inteiro caiu (22/mai/2026)**
Queda de energia em Hortolândia. SHO tentou failover para São Paulo, mas a latência era > 2s (muito alta). Decisão: **aguardar datacenter voltar** (intervenção manual). Voltou em 47 minutos. Sem perda de dados.

**Falha 3 — Judge aprovou mensagem problemática (12/jun/2026)**
Judge aprovou mensagem com claim financeiro exagerado. Cliente reclamou. SHO não detectou (não era "falha técnica", era "falha de julgamento"). Intervenção: ajuste de regra + auditoria de claims.

---

**6. Lições aprendidas (5 takeaways)**

1. **SHO funciona bem para falhas técnicas** (97% dos casos). Não funciona para falhas semânticas.

2. **Logs estruturados salvam vidas.** Sem logs centralizados, MTTR seria 10x maior.

3. **Custos podem subir.** SHO consumiu ~R$ 800/mês em LLM para diagnóstico. Custo aceitável, mas precisa monitorar.

4. **Threshold learning funciona.** SHO ajusta thresholds baseado em histórico. Reduziu falsos positivos em 47% em 4 meses.

5. **Intervenção humana ainda é necessária** (em 1% dos casos). SHO não substitui engenheiros — substitui **alertas noturnos**.

---

**7. Melhorias implementadas pós-incidente**

Após cada falha crítica, melhorias foram implementadas:

- **Falha 1 (loop)**: adicionado detector de loop infinito no SHO (verifica taxa de chamadas consecutivas)
- **Falha 2 (datacenter)**: adicionado failover automático multi-região
- **Falha 3 (Judge)**: adicionada auditoria semanal de Judge (sample 20%)

Resultado em junho/2026 (vs abril): **73% redução em incidentes críticos**.

---

**8. Roadmap do SHO 2.0**

Anunciado no webinar:

**2026 Q3 — SHO 2.0**
- **Predictive healing**: SHO prevê incidentes antes de acontecerem (baseado em padrões)
- **Custo-aware healing**: SHO escolhe fix mais barato (ex: restart vs scale, considerando custo de cada)
- **Auto-documentação**: SHO gera automaticamente post-mortem após cada incidente

**2026 Q4 — SHO Multi-tenant**
- SHO gerencia incidentes isolados por tenant (sem afetar outros)
- SLA por tenant configurável

**2027 — SHO Federado**
- SHO coordena com SHO de outras instâncias Nexus (federação de saúde)

---

**9. Q&A ao vivo (30 min)**

As perguntas mais frequentes:

1. **"Como o SHO aprende sem causar mais incidentes?"** Modo "shadow" — roda em paralelo sem aplicar fix, só sugere. Humano valida. Depois de N validações, vira fix automático.

2. **"E se o SHO matar o próprio processo?"** Watcher health check detecta SHO morto em 10s, reinicia automaticamente.

3. **"Quanto custa o SHO em produção?"** ~R$ 800/mês (LLM de diagnóstico + storage de logs + watchers).

4. **"Como vocês testam o SHO sem colocar produção em risco?"** Chaos engineering — usar falhas sintéticas em staging.

5. **"SHO pode falhar silenciosamente?"** Sim. Por isso, há **SHO do SHO** (chamamos de "meta-SHO"). Ele monitora se o SHO está funcionando.

---

# 📋 Especificações

| Item | Detalhe |
|------|---------|
| **Data** | 12 de abril de 2026 |
| **Duração** | 90 minutos |
| **Participantes** | 1.923 ao vivo |
| **Visualizações da gravação** | 28.471 |
| **Formato** | Ao vivo + gravado |

---

# 🎓 O que você vai sair sabendo

1. SHO é **99% automático, 1% humano** (mas o 1% importa).
2. **312 incidentes** em 4 meses, categorizados.
3. **MTTR real** vs meta (92% abaixo de 2 min).
4. As **3 falhas críticas** e o que aprendemos.
5. SHO 2.0 com **predictive healing** (Q3 2026).

---

*WB-2026-02 · SHO em Produção · Abril 2026*

*Por MMN AI-to-AI · 2026 · Licença: CC BY-SA 4.0*

*"Sistema imunológico não é perfeito. Mas 99% das vezes, é o suficiente para dormir tranquilo."*