---
title: "01 · Skills essenciais: copywriter + audience-segmenter"
level: agente
duration: 30min
prerequisites: ["00-primeiro-agente"]
tags: [skills, copywriter, segmenter, copy, audiencia, coorte]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Skills Essenciais](../../../assets/ebook_covers/ACAD-apostila-07-18-skills-operacionais.webp)

**01 · Skills essenciais: copywriter + audience-segmenter**

*Trilha Agente · 30 minutos · Pré-requisito: 00-Primeiro Agente*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Você já tem 1 agente rodando com 3 skills básicas. Agora é hora de dominar as 2 skills mais importantes do dia a dia: **copywriter** (que gera mensagens persuasivas) e **audience-segmenter** (que segmenta sua base em coortes acionáveis). Em 30 minutos, você vai entender como cada uma funciona, quais parâmetros ajustar, e como combiná-las para campanhas de alta conversão. Para o catálogo completo das 18 skills, consulte a **Apostila 07**.

---

## ⚡ TL;DR — Resumo Executivo

> Skills são as capacidades do seu agente. Você vai conhecer as 18 skills base, aprender a criar skills customizadas para seu nicho, e montar seu primeiro workflow encadeado (3 skills em série).

### 🗺️ Posição na Trilha

**Anterior:** [← 00-primeiro-agente](00-primeiro-agente.md)
**Próximo:** [→ 02-disparo-whatsapp](02-disparo-whatsapp.md)



**Sumário**

> **•** 1. Por que essas 2 skills são essenciais
> **•** 2. Skill copywriter: anatomia
> **•** 3. Configurando copywriter para WhatsApp
> **•** 4. Prompt engineering para copywriter
> **•** 5. Skill audience-segmenter: anatomia
> **•** 6. As 4 coortes padrão
> **•** 7. Criando coortes custom
> **•** 8. Combinando copywriter + segmenter
> **•** 9. Erros comuns
> **•** 10. Próximo curso

---

**1. Por que essas 2 skills são essenciais**

A maioria das operações de afiliada se resume a:
- **Enviar a mensagem certa** (copywriter).
- **Para a pessoa certa** (segmenter).

Sem segmentação, você dispara a mesma mensagem para todo mundo = 1% de conversão. Sem copy, você tem a pessoa certa mas a mensagem não engaja = 0% de conversão. As duas juntas = 5-15% de conversão.

Por isso essas 2 skills são as **fundacionais**. Outras (analytics, automation, design) agregam valor, mas essas 2 são o core.

**2. Skill copywriter: anatomia**

**O que faz:** gera texto persuasivo para qualquer canal (WhatsApp, e-mail, Instagram, landing page).

**Inputs típicos:**
- Produto ou tema.
- Objetivo (reativar, vender, bem-vindar, lembrar).
- Coorte (público-alvo).
- Tom (consultivo, urgente, inspirador, técnico).
- Tamanho máximo (caracteres).
- Restrições (palavras proibidas, claims a evitar).

**Outputs típicos:**
- 3-5 variações de copy.
- Cada uma com abordagem diferente.
- CTA (call-to-action) claro.
- Personalização pronta (placeholders `[nome]`, `[produto]`).

**3. Configurando copywriter para WhatsApp**

**Caminho:** `/dashboard/agents/<id>/skills/copywriter-whatsapp/config`

**Parâmetros recomendados para WhatsApp:**

| Parâmetro | Valor | Por quê |
|-----------|-------|---------|
| Tom | consultivo | Conversão mais alta em reativação |
| Idioma | pt-BR | Padrão Brasil |
| Tamanho máx | 240 caracteres | WhatsApp corta > 240 |
| CTA | pergunta (sim/não) | Maior resposta do que "clique aqui" |
| Personalização | nome + último produto | Aumenta abertura em 35% |
| Variações | 3 | Suficiente para A/B sem confundir |

**Tom de voz por objetivo:**

- **Reativação de frios**: consultivo, pergunta inicial.
- **Venda direta**: urgente + escassez honesta.
- **Bem-vindos**: caloroso, oferece valor antes da venda.
- **Lembrete**: curto, direto, com data/hora específica.

**4. Prompt engineering para copywriter**

A copywriter funciona melhor quando você dá **contexto rico**, não comando seco.

**Exemplo BOM (funciona):**
```
Objetivo: reativar leads frios do produto X
Coorte: frios (60+ dias sem interação)
Tom: consultivo, sem pressão
Tamanho: até 240 caracteres
Restrições: NÃO usar "GRÁTIS", "URGENTE", "CLIQUE AGORA"
CTA: pergunta (responda sim/não)
Personalização: nome + último produto visualizado
```

**Exemplo RUIM (não funciona):**
```
Escreve uma mensagem de WhatsApp para vender o produto X.
```

A diferença: o primeiro dá **6 parâmetros** que o LLM usa para calibrar. O segundo dá 0. Resultado: copy genérica.

**5. Skill audience-segmenter: anatomia**

**O que faz:** categoriza contatos em coortes baseando-se em comportamento (data de entrada, última interação, compras, engajamento).

**Inputs típicos:**
- Base completa de contatos.
- Critérios (data, produto, frequência).

**Outputs típicos:**
- Lista de IDs por coorte.
- Estatísticas (tamanho médio, LTV, taxa de engajamento).
- 3 insights em linguagem natural.

**6. As 4 coortes padrão**

Ao importar base, o sistema cria automaticamente 4 coortes:

| Coorte | Critério | Tamanho típico | Estratégia |
|--------|----------|----------------|------------|
| **Novos** | Entraram na base nos últimos 7 dias | 10-20% | Bem-vindos, oferta de valor |
| **Ativos** | Compraram nos últimos 30 dias | 15-30% | Recompra, upsell |
| **Frios** | 30-90 dias sem comprar | 30-40% | Reativação com desconto |
| **Muito frios** | 90+ dias sem comprar | 20-30% | Reativação agressiva ou descarte |

**7. Criando coortes custom**

**Caminho:** `/dashboard/cohorts/new`

**Casos comuns:**

**A — Caros (alto ticket)**
- Regra: "comprou produto X" (produto com ticket > R$ 1.000).
- Tamanho típico: 5-10% da base.
- Estratégia: ofertas premium, programa de fidelidade.

**B — Compradores recorrentes**
- Regra: "comprou > 1 vez" E "última compra < 60 dias".
- Tamanho típico: 5-15% da base.
- Estratégia: programa de indicação, recompra preventiva.

**C — Quase convertidos**
- Regra: "clicou em link" E "não comprou" E "dias_desde_clique < 7".
- Tamanho típico: 5-15% da base.
- Estratégia: follow-up agressivo, FAQ, prova social.

**8. Combinando copywriter + segmenter**

O fluxo ideal de uma campanha:

**Passo 1**: Segmenter filtra base → coorte X (ex: 800 frios).

**Passo 2**: Copywriter gera 3 variações para essa coorte + objetivo.

**Passo 3**: Judge revisa as 3 → aprova 2 ou 3 (ou reprova todas).

**Passo 4**: Você escolhe a melhor das aprovadas.

**Passo 5**: Disparar (a skill de disparo usa a mensagem + a coorte).

**Custo total:** R$ 0,012 (copy) + R$ 0,016 (segmenter) + R$ 0,004 (judge) = **R$ 0,032 por campanha** (independente do tamanho da base).

**9. Erros comuns**

- **Erro 1**: Disparar mesma copy para todas as coortes. Resultado: 1% conversão.
- **Erro 2**: Criar coorte com regra contraditória (ex: comprou E nunca comprou). Resultado: base vazia.
- **Erro 3**: Não re-segmentar a base. Resultado: coortes desatualizadas.
- **Erro 4**: Confiar no LLM para "descobrir" o tom certo. Resultado: copy inconsistente.
- **Erro 5**: Não testar 3 variações. Resultado: nunca sabe qual é a melhor.

**10. Próximo curso**

👉 [`02-disparo-whatsapp.md`](02-disparo-whatsapp.md) — Disparando no WhatsApp · 30 min

**Recursos extras:**
- **Apostila 07**: 18 Skills Operacionais Base (catálogo completo).
- **Apostila 09**: Campanhas Automatizadas (3 modelos WhatsApp + 2 Instagram).

---

**01 · Skills Essenciais** --- Trilha Agente

---

## 🎯 Exercícios Práticos — Curso: Skills Essenciais

> **Tempo sugerido:** 45-90 minutos
> **Formato:** individual, com consulta ao painel/ambiente real
> **Entrega:** não há prova formal; use este espaço para fixar o aprendizado

**Exercício 1 — Catálogo**

Liste as 18 skills do catálogo. Para cada uma, marque: já uso, quero aprender, não preciso. Foque nas 3 primeiras.

**Exercício 2 — Skill custom**

Crie 1 skill nova para seu nicho (ex: copywriter para sua vertical). Use o template da apostila 07.

**Exercício 3 — Combinação**

Monte um workflow de 3 skills encadeadas (ex: audience-segmenter → copywriter → disparador). Rode em teste.

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

1. Qual a diferença entre "skill" e "ferramenta" no Nexus?
2. Cite 3 skills que todo afiliado deveria dominar (independente do nicho).
3. Como versionar skills (controle de mudança)?
4. O que é "skill library" e como contribuir?
5. Qual a economia estimada ao dominar 5 skills essenciais?

---

## 🚀 Próximos Passos Recomendados

1. **Aplicar imediatamente:** pegue 1 insight deste curso e aplique HOJE.
2. **Medir em 7 dias:** meça o impacto (mesmo que qualitativo).
3. **Compartilhar:** documente o que aprendeu (post, conversa, diário).
4. **Avançar:** siga para o próximo curso da trilha.


*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
