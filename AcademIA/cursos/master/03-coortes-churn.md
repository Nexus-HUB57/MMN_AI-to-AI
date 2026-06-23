---
title: "03 · Análise de Coortes e Churn"
level: master
duration: 45min
prerequisites: ["02-ab-test-judge"]
tags: [coorte, churn, retencao, ltv, analytics]
last_updated: 2026-06-15
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Análise de Coortes e Churn](../../../assets/ebook_covers/ACAD-apostila-02-cases-orquestracao-autonoma.webp)

**03 · Análise de Coortes e Churn**

*Trilha Master · 45 minutos · Pré-requisito: 02-A/B testing*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Coorte é um agrupamento de clientes com característica comum (mês de entrada, produto, origem). A análise de coorte é a técnica que mostra **quando, onde, e por que seus clientes somem**. Em 45 minutos, você vai aprender a construir uma matriz de coorte, identificar padrões de churn, e usar isso para tomar decisões de retenção. É a skill mais valiosa do Master.

---

## ⚡ TL;DR — Resumo Executivo

> Churn é o vilão silencioso do LTV. Você vai aprender a construir matriz de coortes em planilha, calcular churn mensal/trimestral/anual, e formular hipóteses para recuperar a coorte de pior retenção.

### 🗺️ Posição na Trilha

**Anterior:** [← 02-ab-test-judge](02-ab-test-judge.md)
**Próximo:** [→ ../elite/00-blueprints-elite](../elite/00-blueprints-elite.md)



**Sumário**

> **•** 1. O que é análise de coorte
> **•** 2. A matriz de coorte explicada
> **•** 3. Como construir a matriz no Nexus
> **•** 4. Lendo a matriz: 4 padrões clássicos
> **•** 5. O que é churn e como calcular
> **•** 6. Causas-raiz de churn
> **•** 7. Ações de retenção por estágio
> **•** 8. Quando uma coorte vale salvar
> **•** 9. O ROI de salvar clientes
> **•** 10. Próximo curso (trilha Elite)

---

**1. O que é análise de coorte**

**Análise de coorte** = segmentar clientes por característica comum e rastrear comportamento ao longo do tempo.

A análise tradicional (média de churn) esconde padrões. A análise de coorte **revela**:
- Quando exatamente os clientes somem.
- Qual coorte tem melhor retenção.
- Por que uma coorte performa diferente de outra.

**2. A matriz de coorte explicada**

A matriz tem **linhas** (coortes, ex: mês de entrada) e **colunas** (períodos, ex: M0, M1, M2, M3, ...). Cada célula mostra % de clientes da coorte ainda ativos naquele mês.

**Exemplo:**

| Coorte | M0 | M1 | M2 | M3 | M6 | M12 |
|--------|----|----|----|----|----|-----|
| Jan/26 | 100% | 65% | 48% | 41% | 32% | 25% |
| Fev/26 | 100% | 68% | 51% | 44% | 35% | ? |
| Mar/26 | 100% | 72% | 55% | 47% | ? | ? |
| Abr/26 | 100% | 70% | 53% | ? | ? | ? |

**Lendo:** clientes de Mar/26 retêm melhor que Jan/26 (72% no M1 vs 65%). **Algo mudou em fevereiro/março que melhorou a retenção.** Você descobriu uma alavanca.

**3. Como construir a matriz no Nexus**

**Caminho:** `/dashboard/analytics/cohort`

1. **Selecione métrica**: "ainda ativo" / "comprou" / "respondeu".
2. **Defina granularidade temporal**: dia, semana, mês.
3. **Defina cohort-by**: data de entrada, produto, origem, etc.
4. **Visualize**: tabela de cores (verde = alta retenção, vermelho = churn).
5. **Exporte CSV** para análise custom.

A skill `analytics-cohort` faz a mesma coisa via API/automação.

**4. Lendo a matriz: 4 padrões clássicos**

**Padrão 1 — Churn constante**
- Mesma % de churn a cada mês.
- Indica: problema fundamental no produto.
- Ação: revisar oferta, não apenas copy.

**Padrão 2 — Cliff no M1**
- Grande churn no M0-M1, depois estabiliza.
- Indica: falha no onboarding/ativação.
- Ação: melhorar D+0 a D+7.

**Padrão 3 — Cliff no M3-M6**
- Retenção boa no início, churn no médio prazo.
- Indica: produto não sustenta engagement.
- Ação: adicionar recursos, comunidade, novos casos de uso.

**Padrão 4 — Outlier positivo**
- Uma coorte retém muito melhor.
- Indica: você descobriu algo que funciona.
- Ação: replicar as condições daquela coorte em outras.

**5. O que é churn e como calcular**

**Churn rate** = % de clientes que saíram em um período.

**Fórmula:** `Churn = (Clientes perdidos no mês / Clientes no início do mês) × 100`

**Exemplo:** você começou abril com 100 clientes, perdeu 15, terminou com 85. Churn = 15%.

**Tipos de churn:**

- **Churn voluntário**: cliente cancelou.
- **Churn involuntário**: cartão expirou, falha de cobrança.
- **Churn silencioso**: cliente parou de usar sem cancelar formalmente.

**6. Causas-raiz de churn**

**Causa 1 — Onboarding falho** (M0-M1)
- Cliente não entendeu o produto.
- Solução: tutorial em vídeo no D+1, e-mail D+3 com caso de uso.

**Causa 2 — Produto não resolve o problema** (M2-M3)
- Cliente percebeu que não serve.
- Solução: ajuste de oferta, FAQ, suporte proativo.

**Causa 3 — Concorrente melhor** (M3-M6)
- Cliente migrou para concorrente.
- Solução: pesquisa de saída, diferenciação.

**Causa 4 — Custo percebido alto** (qualquer momento)
- Cliente acha caro demais.
- Solução: plano alternativo, programa de fidelidade.

**7. Ações de retenção por estágio**

| Estágio | Ação | Ferramenta |
|---------|------|------------|
| D+0 a D+7 | Onboarding intensivo | E-mail + tutorial |
| D+7 a D+30 | Engajamento de valor | Newsletter + casos |
| D+30 a D+90 | Recompra / upsell | Ofertas contextuais |
| D+90+ | Indicação | Programa de refs |
| Churn iminente | Win-back | Copy agressiva (Judge calibrado) |

**8. Quando uma coorte vale salvar**

Nem todo churn vale ser combatido. Regra:

- **Salvar se:** LTV da coorte × (% de挽回 possível) > Custo do win-back.
- **Deixar ir se:** o coorte é pequeno (< 50 pessoas) ou tem LTV baixo.

Exemplo: coorte de 200 clientes com LTV R$ 500 cada, e você consegue salvar 20% com custo de R$ 30 por salvamento. Vale (200 × 500 × 20% = R$ 20k recuperados, custo 200 × R$ 30 = R$ 6k).

**9. O ROI de salvar clientes**

**Regra empírica:** recuperar 1 cliente custa 5-7× menos que adquirir 1 novo.

Por isso, retenção > aquisição. Por isso, análise de coorte > análise de tráfego.

**Tabela de comparação:**

| Ação | Custo | Tempo | Efeito |
|------|-------|-------|--------|
| Adquirir 1 novo cliente | R$ 24 (CAC médio) | 14 dias | 1 venda |
| Recuperar 1 cliente churn | R$ 5 (win-back) | 3 dias | 1 venda + LTV |
| Reter 1 cliente | R$ 0.50 (e-mail) | contínuo | 1 venda + recorrência |

**Conclusão:** invista em retenção.

**10. Próximo curso (trilha Elite)**

Você completou a **Trilha Master**. Próximo passo:

👉 [`../elite/00-blueprints-elite.md`](../elite/00-blueprints-elite.md) — Blueprints Elite · 60 min

**O que você vai aprender na trilha Elite:**
- Estratégias de top 10% (não para iniciantes).
- Multi-tenant e white-label.
- Federação entre nós.

**Recursos extras:**
- **Apostila 02**: Cases Reais (Marina, Carlos, Equipe Prime).
- **Apostila 07**: Skill `analytics-cohort` (detalhes técnicos).

---

**03 · Análise de Coortes e Churn** --- Trilha Master

---

## 🎯 Exercícios Práticos — Curso: Coortes e Churn

> **Tempo sugerido:** 45-90 minutos
> **Formato:** individual, com consulta ao painel/ambiente real
> **Entrega:** não há prova formal; use este espaço para fixar o aprendizado

**Exercício 1 — Matriz**

Construa uma matriz de coortes (linhas: mês de cadastro, colunas: mês de atividade). Identifique a coorte com pior retenção.

**Exercício 2 — Churn**

Calcule seu churn mensal, trimestral, e anual. Qual é o mais crítico para seu modelo?

**Exercício 3 — Hipótese**

Para a coorte de pior retenção, formule 3 hipóteses de por que estão churnando. Defina 1 experimento para validar.

---

## ✅ Checklist de Conclusão

Marque conforme for completando:

- [ ] Li o curso inteiro sem pular seções.
- [ ] Fiz os 3 exercícios práticos.
- [ ] Respondi às 5 questões de auto-avaliação (mentalmente, sem colar).
- [ ] Anotei 1 dúvida que surgiu (para perguntar no webinar ou fórum).
- [ ] Identifiquei 1 ação concreta que vou tomar nas próximas 24h.
- [ ] Compartilhei meu progresso com pelo menos 1 pessoa (mentor, par, ou comunidade).

---

## 🧠 Auto-Avaliação (5 questões)

Tente responder **sem consultar o curso**. Depois, valide:

1. Qual a diferença entre churn voluntário e involuntário?
2. Como construir uma matriz de coortes em planilha?
3. O que é "retenção de curva" e qual o formato ideal (reta, decrescente)?
4. Qual a métrica de churn mais importante para o LTV?
5. Quando considerar um cliente "recuperado" vs. "novo"?

---

## 🚀 Próximos Passos Recomendados

1. **Aplicar imediatamente:** pegue 1 insight deste curso e aplique HOJE.
2. **Medir em 7 dias:** meça o impacto (mesmo que qualitativo).
3. **Compartilhar:** documente o que aprendeu (post, conversa, diário).
4. **Avançar:** siga para o próximo curso da trilha.


*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
