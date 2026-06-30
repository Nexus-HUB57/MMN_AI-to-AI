---
title: "WB-2026-06 · A/B Testing Estatístico: Como Não Ser Enganado pelos Seus Próprios Dados"
level: "master"
duracao: "90-120min"
data: "2026-08-12"
formato: "webinar-ao-vivo + gravado"
palestrante: "Equipe Nexus + 2 estatísticos convidados"
tags: [ab-test, estatistica, confianca, armadilhas]
pattern: "MMN_IA"
status: "planejado"
---

![Capa — A/B Testing Estatístico](../../assets/ebook_covers/ACAD-apostila-07-18-skills-operacionais.webp)

**WB-2026-06 · A/B Testing Estatístico: Como Não Ser Enganado pelos Seus Próprios Dados**

*O guia anti-bobagem para testes A/B. Por que 80% dos "vencedores" são falsos positivos, e como evitar tomar decisões erradas baseado em dados ruins.*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este webinar**

A/B testing parece simples: testa A vs B, vê qual converte mais, escolhe o vencedor. Mas 80% das pessoas que fazem A/B testing em marketing cometem **erros estatísticos que invalidam o resultado**.

Neste webinar, **2 estatísticos profissionais** vão desmascarar as armadilhas mais comuns e dar o framework correto.

---

# 🎯 Sumário

> **•** 1. Por que A/B testing é perigoso
> **•** 2. Os 2 convidados (estatísticos)
> **•** 3. O caso clássico: botão verde vs azul
> **•** 4. Erro 1 — Parar cedo demais (peeking)
> **•** 5. Erro 2 — Testar muitas variantes ao mesmo tempo
> **•** 6. Erro 3 — Ignorar variância temporal
> **•** 7. Erro 4 — Confundir correlação com causalidade
> **•** 8. Erro 5 — Não calcular poder estatístico
> **•** 9. Framework correto em 5 passos
> **•** 10. Q&A ao vivo

---

**1. Por que A/B testing é perigoso**

A/B testing é, em teoria, a forma mais "científica" de tomar decisão em marketing. Você testa, mede, escolhe.

Na prática, **é onde mais gente toma decisões erradas**. Por 3 motivos:

1. **Estatística é difícil** — 90% dos marqueteiros não entendem p-value, poder estatístico, ou intervalo de confiança.
2. **Ferramentas escondem a complexidade** — plataformas mostram "vencedor" após 100 visitas, mas 100 visitas **não é estatisticamente significativo**.
3. **O instinto quer parar cedo** — quando você vê uma variante "vencendo" por 30%, a tentação é parar e implementar. Mas isso é **peeking**, e é o erro mais comum.

Resultado: 80% dos "vencedores" em A/B testing de marketing são **falsos positivos**.

---

**2. Os 2 convidados**

**Dr. Pedro Sávio, 47 anos, São Paulo**
- Estatístico PhD pela USP
- Trabalhou 12 anos no Google, liderando experimentos de busca
- Hoje consultor de A/B testing para 14 empresas (incluindo Nubank, iFood)
- Publicou "A/B Testing for Humans" (2024)

**Dra. Mariana Ribeiro, 39 anos, Recife**
- Estatística PhD pela UFPE
- Trabalhou 8 anos no Spotify, na equipe de experimentation
- Hoje consultora de growth analytics
- Co-autora do paper "The Peeking Problem in Online Experimentation" (2023)

---

**3. O caso clássico: botão verde vs azul**

Uma loja online queria testar: botão "Comprar" verde vs azul.

Cenário típico:
- Variante A (verde): 2.3% conversão em 200 visitas = 4.6 conversões
- Variante B (azul): 3.1% conversão em 200 visitas = 6.2 conversões

**Reação típica**: "B venceu! Vamos implementar azul!"

**O que a estatística diz**: com 200 visitas por variante, a **diferença não é estatisticamente significativa**. O intervalo de confiança de 95% para B inclui 2.3%. Pode ser que B seja realmente melhor, ou pode ser que os dados foram sorte.

**O que fazer**: rodar até atingir **poder estatístico de 80%** com **confiança de 95%**. Para detectar uma diferença de 0.8 pontos percentuais (3.1% - 2.3%), você precisa de ~3.500 visitas por variante.

**Tempo necessário**: se a loja recebe 100 visitas/dia, são 35 dias de teste. Não 1 dia.

---

**4. Erro 1 — Parar cedo demais (peeking)**

**Peeking** = olhar o resultado do teste várias vezes durante a execução e parar quando "vencedor" aparece.

**Por que é errado**: cada "olhada" aumenta a chance de falso positivo. Se você olha 10x durante o teste, a chance de encontrar um "vencedor" por acaso é de ~40%, não 5%.

**Como evitar**: defina o tamanho da amostra ANTES de começar. Não pare antes de atingir. Use ferramentas que **escondem** os resultados parciais (ex: Optimizely, VWO).

**Caso real**: uma fintech brasileira parou um teste após 3 dias (1.500 visitas) porque B estava "vencendo" por 50%. Migrou 100% dos usuários para B. **Após 30 dias, A voltou a ficar à frente**. Decisão errada custou R$ 200k.

---

**5. Erro 2 — Testar muitas variantes ao mesmo tempo**

Testar A, B, C, D, E ao mesmo tempo (5 variantes) **não é o mesmo** que testar A vs B em sequência.

**Problema**: com 5 variantes, a chance de falso positivo em algum par é ~20% (vs 5% com 2 variantes). Para corrigir, precisa aplicar **correção de Bonferroni** (dividir p-value por 5).

**Recomendação**: máximo 4 variantes por teste (incluindo controle). Para mais, faça testes sequenciais.

---

**6. Erro 3 — Ignorar variância temporal**

Conversão varia por dia da semana, hora do dia, mês. Um teste de 1 semana pode pegar padrões sazonais errados.

**Exemplo**: testar dia 1-7 (quarta a terça). Se a "vitória" foi puxada pelo fim de semana (que naturalmente converte mais), você está confundindo dia da semana com variante.

**Recomendação**: teste por **pelo menos 2 ciclos completos** (14 dias mínimo, ideal 28). Use bloqueios por dia/hora se necessário.

---

**7. Erro 4 — Confundir correlação com causalidade**

A variante B converteu 3.1%, e a A converteu 2.3%. Conclusão típica: "B é melhor".

Mas talvez **B atendeu usuários diferentes**. Se B foi mostrado, por acaso, para usuários de São Paulo (que naturalmente convertem mais), a "vitória" de B é **ilusória**.

**Como evitar**: use **randomização estratificada** — garanta que cada variante veja o mesmo perfil de usuário. Ou ajuste por covariáveis (cidade, dispositivo, hora) na análise.

---

**8. Erro 5 — Não calcular poder estatístico**

**Poder estatístico** = probabilidade de detectar uma diferença real, se ela existir.

Se seu teste tem 50% de poder, você tem 50% de chance de perder uma vitória real. Isso é "falso negativo".

**Como calcular**: precisa de 3 coisas:
1. **Tamanho de efeito mínimo** que importa detectar (ex: 0.5 pontos percentuais)
2. **Variância** da métrica (geralmente desconhecida)
3. **Nível de significância** (típico: 5%)

Ferramenta: <https://www.optimizely.com/sample-size-calculator/>

**Regra prática**: para detectar 10% de lift (B sendo 10% melhor que A) com baseline de 5%, precisa ~3.000 variantes por braço.

---

**9. Framework correto em 5 passos**

Pedro e Mariana convergem no seguinte framework:

```
PASSO 1: HIPÓTESE
   "Se eu mudar [X], então [Y] vai aumentar [Z]%"
   Ex: "Se eu trocar CTA verde por azul, conversão vai aumentar 10%"

PASSO 2: MÉTRICA PRIMÁRIA
   Qual é a métrica de sucesso? (conversão? receita? retenção?)
   Não pode mudar durante o teste.

PASSO 3: CÁLCULO DE AMOSTRA
   Use uma calculadora de poder estatístico.
   Defina n ANTES de começar.

PASSO 4: RANDOMIZAÇÃO
   Split 50/50 (ou outra proporção) de forma aleatória.
   Verifique que A e B têm perfis similares (cidade, device, etc).

PASSO 5: ANÁLISE
   Quando atingir n, ANALISE. Não antes.
   Use intervalo de confiança de 95%.
   Se intervalo inclui 0% lift, é empate.
   Reporte: "B converteu X% (CI: [Y%, Z%]). Empate/vitória estatisticamente significativa."
```

---

**10. Q&A ao vivo**

Os convidados responderão sobre:
- Como rodar testes em baixo volume (e.g., 50 visitas/dia)
- Quando usar testes sequenciais vs paralelos
- Como integrar A/B testing com Judge Revisor
- Métricas secundárias (revenue per user, retention, etc)
- Quando parar um teste "perdendo" prematuramente

---

# 📋 Especificações

| Item | Detalhe |
|------|---------|
| **Data** | 12 de agosto de 2026 |
| **Duração** | 90-120 min (60 painel + 30 Q&A) |
| **Público-alvo** | Alunos da Trilha Master, ou marqueteiros com alguma experiência em A/B |
| **Pré-requisito** | Curso 02-ab-test-judge.md |
| **Gravação** | Liberada 48h após |
| **Inscrição** | R$ 97 (grátis para membros Nexus) |

---

*"A estatística é a forma que a matemática tem de dizer 'calma, não é tão simples quanto parece'. E isso, no marketing, é uma bênção."*

**Por MMN AI-to-AI · 2026**