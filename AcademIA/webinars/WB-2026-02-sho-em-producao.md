---
title: "WB-2026-02 · SHO em Produção"
webinar_code: WB-2026-02
date: 2026-05-22
duration: 75min
speaker: "Eng. SHO + Estrategista convidado"
tags: [webinar, sho, orquestracao, judge, tuning]
last_updated: 2026-06-02
---

# 🧬 WB-2026-02 · SHO em Produção

> **Data:** 22/05/2026 · **Duração:** 75 min · **Palestrante:** Eng. SHO + Estrategista convidado

## 🎯 Tema

Aprofundamento técnico no **Sistema SHO** com casos reais de produção. Como calibrar o Judge, ajustar confiança e ler métricas de autonomia.

## 📋 Agenda

| Tempo | Bloco |
|---|---|
| 00:00–00:05 | Recap rápido do IOAID |
| 00:05–00:20 | **SHO internals** — fluxograma de decisão |
| 00:20–00:35 | **Calibração do Judge** — thresholds por tipo de ação |
| 00:35–00:55 | **Caso real** — afiliado Estrategista mostra 90 dias de dados |
| 00:55–01:10 | **Live tuning** — ajustar parâmetros ao vivo |
| 01:10–01:15 | Q&A |

## 🎬 Materiais

- **Slides:** [link para PDF]
- **Planilha de calibração:** [`Lab-Nexus/tools/analytics/02-comparador-taxas-conversao.md`](../../Lab-Nexus/tools/analytics/02-comparador-taxas-conversao.md)
- **Gravação:** [link do vídeo]

## 💡 Takeaways principais

1. **Threshold 0.75** é o sweet spot para 80% dos casos
2. **Judge alinhamento** meta: 75–85% (não mais, não menos)
3. **Block rate** é a métrica que mais correlaciona com ban permanente
4. **Calibração** é contínua — reavaliar a cada 30 dias
5. **Documentação** dos ajustes é obrigatória para o Estrategista

## ❓ Q&A Highlights

**P: O Judge pode ser tendencioso?**
R: Sim. Por isso o alinhamento humano-Judge é a métrica-chave. Se ficar > 95%, está repetindo o Judge (perde valor); se < 60%, precisa recalibrar.

**P: Posso desativar o Judge?**
R: Sim, mas só para skills de baixo risco (ex: transcrição). Para disparo ou copy, é obrigatório.

**P: Como sei se meu SHO está descalibrado?**
R: 3 sinais: (1) Judge reprovando > 20%, (2) Fila sempre cheia, (3) Autonomy Score caindo sem mudança de skill.

## 📊 Estatísticas do Evento

- **Inscritos:** 982
- **Presentes:** 487
- **Replays:** 1.523
- **NPS:** 84

## ⏭️ Próximo Webinar

👉 WB-2026-03 · Academ'IA Open House — 15/06/2026

---

**Versão 1.0** · Atualizado 2026-06-02
