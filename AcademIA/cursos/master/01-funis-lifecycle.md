---
title: "01 · Funis e Lifecycle"
level: master
duration: 45min
prerequisites: ["00-otimizacao-conversao"]
tags: [funil, lifecycle,retencao,churn,ativacao]
last_updated: 2026-06-15
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Funis e Lifecycle](../../assets/ebook_covers/ACAD-apostila-09-campanhas-automatizadas.webp)

**01 · Funis e Lifecycle**

*Trilha Master · 45 minutos · Pré-requisito: 00-Otimização de Conversão*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Um funil não termina na venda. **Ele começa na venda.** O ciclo de vida do cliente (lifecycle) é o que separa quem fatura R$ 5k/mês de quem fatura R$ 20k/mês. Em 45 minutos, você vai entender o funil completo (do primeiro clique ao cliente evangelista), as 5 fases do lifecycle, e como configurar seu agente para **maximizar cada fase**.

**Sumário**

> **•** 1. O que é funil (e o que está além dele)
> **•** 2. As 5 etapas do funil tradicional
> **•** 3. As 5 fases do lifecycle
> **•** 4. A transição funil → lifecycle
> **•** 5. Métricas por fase
> **•** 6. Como configurar o agente para lifecycle
> **•** 7. Análise de coorte no lifecycle
> **•** 8. O funil infinito (o objetivo final)
> **•** 9. Erros comuns
> **•** 10. Próximo curso

---

**1. O que é funil (e o que está além dele)**

**Funil tradicional** = sequência linear: lead → cliente.

**Lifecycle** = ciclo virtuoso: lead → cliente → recompra → indicação → novo lead.

A maioria dos afiliados para no funil. **Os top 10% operam no lifecycle.**

**2. As 5 etapas do funil tradicional**

**Etapa 1 — Atração (Topo)**
- Como o lead te encontra: anúncio, busca orgânica, indicação, lead magnet.
- Métrica: impressões, cliques, CTR.
- Custo: alto (CAC inicial).

**Etapa 2 — Consideração (Meio)**
- Lead conhece seu produto, mas não comprou.
- Métrica: taxa de abertura de e-mail, tempo na landing, interação.
- Custo: médio.

**Etapa 3 — Decisão (Fundo)**
- Lead está decidindo comprar.
- Métrica: taxa de conversão, abandono de carrinho.
- Custo: baixo (lead está quente).

**Etapa 4 — Compra**
- Lead vira cliente.
- Métrica: vendas, ticket médio.
- Custo: marginal.

**Etapa 5 — Onboarding (Pós-venda imediato)**
- Cliente está aprendendo a usar o produto.
- Métrica: ativação, retenção D7.
- Custo: marginal.

**3. As 5 fases do lifecycle**

**Fase 1 — Ativação**
- Cliente usa o produto pela primeira vez.
- Meta: fazer o cliente ter o "aha moment" em 24-48h.
- Automação: e-mail de boas-vindas + tutorial.

**Fase 2 — Retenção (D7-D30)**
- Cliente continua usando.
- Meta: pelo menos 1 uso significativo por semana.
- Automação: lembrete de uso, conteúdo de valor.

**Fase 3 — Recompra (D30-D90)**
- Cliente compra novamente (se produto permite).
- Meta: taxa de recompra > 20%.
- Automação: oferta de reposição, programa de fidelidade.

**Fase 4 — Upsell (D60-D180)**
- Cliente compra produto de maior ticket.
- Meta: 10-30% dos clientes ativos fazem upsell.
- Automação: oferta contextual no momento certo.

**Fase 5 — Evangelização (D90+)**
- Cliente indica outros.
- Meta: pelo menos 1 indicação por cliente/ano.
- Automação: programa de indicação, comunidade.

**4. A transição funil → lifecycle**

O funil termina na compra. O lifecycle começa **no dia seguinte à compra**.

**Operacionalmente:**

- **Funil**: copywriter + segmenter + judge + disparos. **Foco em conversão.**
- **Lifecycle**: copywriter + analytics + automation + judge. **Foco em retenção.**

O mesmo agente pode fazer os dois, mas com **personas diferentes**:
- Persona "Aquisição": foco em venda.
- Persona "Retenção": foco em uso e recompra.

**5. Métricas por fase**

| Fase | Métrica principal | Meta |
|------|-------------------|------|
| Ativação | % de clientes que usam em 7 dias | > 60% |
| Retenção | DAU/MAU (daily/monthly active users) | > 20% |
| Recompra | % de clientes que recompram em 90 dias | > 20% |
| Upsell | % de clientes ativos que compram ticket maior | > 10% |
| Evangelização | NPS + referrals/cliente/ano | NPS > 50, refs > 1 |

**6. Como configurar o agente para lifecycle**

**Skill essencial: `automation-cron-trigger`**

Permite agendar mensagens automáticas em momentos específicos:
- D+0: e-mail de boas-vindas.
- D+3: tutorial em vídeo.
- D+7: lembrete de uso.
- D+30: oferta de recompra.
- D+60: oferta de upsell.
- D+90: pedido de indicação.

**Total: 6 mensagens automáticas por cliente**, sem você fazer nada.

**7. Análise de coorte no lifecycle**

A skill `analytics-cohort` permite ver:
- **Coorte J/2026** (janeiro 2026): quantos ainda ativos em junho?
- **Coorte F/2026** (fevereiro): taxa de recompra?
- Comparar coortes = identificar sazonalidade e padrões.

Se uma coorte tem 80% de churn em 30 dias, **algo no onboarding está falhando**.

**8. O funil infinito (o objetivo final)**

O **funil infinito** é o estado em que:
- Cliente compra.
- Recompra automaticamente.
- Indica novos leads.
- Novos leads viram clientes.
- O ciclo se auto-alimenta.

**Exemplo real:** Marina (case da Apostila 02) atinge funil infinito em 8 meses. 78% das vendas vêm de recompra + indicação. CAC efetivo = R$ 0 (só orgânico).

**9. Erros comuns**

- **Erro 1**: Tratar funil como produto, lifecycle como afterthought. Errado: lifecycle é o produto.
- **Erro 2**: Parar de comunicar pós-venda. Errado: cliente esquecido = churn em 60 dias.
- **Erro 3**: Upsell agressivo. Errado: cliente no D7 não quer ouvir sobre ticket maior.
- **Erro 4**: Esquecer do Judge no lifecycle. Errado: spam de recompra queima a base.
- **Erro 5**: Não medir fase por fase. Errado: você não sabe onde otimizar.

**10. Próximo curso**

👉 [`02-ab-test-judge.md`](02-ab-test-judge.md) — A/B testing com judge · 45 min

**Recursos extras:**
- **Apostila 08**: Rotina de Disparo (integra com lifecycle).
- **Apostila 07**: 18 Skills Operacionais (catálogo completo).

---

**01 · Funis e Lifecycle** --- Trilha Master

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
