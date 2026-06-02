---
title: "Prompt — Posicionamento Competitivo"
description: "Definir posicionamento de marca/produto vs 3-5 concorrentes-chave com matriz"
tags: [lab-nexus, prompt, estrategia, posicionamento, concorrencia, branding]
category: prompts/estrategia
level: master
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
---

# 🎯 Prompt — Posicionamento Competitivo

> Vai além do benchmark (que descreve concorrentes): define o **posicionamento único** da sua marca em uma matriz de 2 eixos críticos, sugere messaging consistente e aponta os "oceanos azuis".

## 🎯 Quando usar

- Lançamento de produto novo
- Reposicionamento de marca existente
- Quando o mercado está saturado de players similares
- Antes de definir messaging para campanhas pagas
- Anualmente para revisar se o posicionamento ainda vale

## 📋 Variáveis de Entrada

```yaml
meu_produto: "Nome + 1 frase de descrição + preço médio"
publico_alvo: "ICP (Ideal Customer Profile) com dor + contexto"
concorrentes_principais: "3-5 nomes (com URL se possível)"
meus_diferenciais_reais: "Lista honesta, sem achismo"
orcamento_marketing_mensal: "Ex: R$ 5.000"
contexto_mercado: "Ex: nicho de marketing digital para PMEs no Brasil"
```

## 💬 Prompt Completo

```markdown
Você é um Estrategista Sênior de Branding & Positioning, com experiência
em mapear mercados B2B e B2C. Defina o POSICIONAMENTO COMPETITIVO
do meu produto vs os concorrentes listados.

## CONTEXTO

Meu produto: {meu_produto}
Público-alvo: {publico_alvo}
Concorrentes principais: {concorrentes_principais}
Meus diferenciais REAIS (sem auto-engano): {meus_diferenciais_reais}
Orçamento mensal: {orcamento_marketing_mensal}
Contexto de mercado: {contexto_mercado}

## O QUE EU QUERO

1. **Matriz 2D de posicionamento** (escolher 2 eixos que mais diferenciam)
2. **Mapa de oceano azul** (combinações de eixos que NENHUM concorrente ocupa)
3. **Declaração de posicionamento** (1 frase, template: "Para [público] que [necessidade], [produto] é [categoria] que [benefício único] porque [prova]")
4. **3 pilares de messaging** (cada um com: tema, frase-âncora, exemplo de uso)
5. **5 dogmas de marca** (frases que a marca NUNCA diria — anti-posicionamento)
6. **Plano de comunicação** (em qual canal, com qual tom, com qual frequência)
7. **3 testes de validação** (como saber em 30-60 dias se o posicionamento "colou")

## REGRAS

- Use APENAS as informações fornecidas — se faltar dado, marque "DADO FALTANTE"
- Diferenciais precisam ser **defensáveis** (concorrente não consegue copiar em < 6 meses)
- Evite adjetivos vazios ("melhor", "líder", "inovador") sem prova concreta
- Mensagem tem que caber em 1 tweet (≤ 280 chars) e em 1 outdoor (≤ 7 palavras)
- LGPD-safe: não usar dado de cliente real sem consentimento nos exemplos
- Considerar o orçamento: posicionamento sem execução =失恋

## FORMATO DE SAÍDA

### 🗺️ Matriz de posicionamento 2D
- Eixo X: [nome do eixo] (low → high)
- Eixo Y: [nome do eixo] (low → high)
- Plotar: meu produto + 3-5 concorrentes
- Quadrante "oceano azul": [descrição]

### 📜 Declaração de posicionamento
> "Para [público] que [necessidade], [meu produto] é [categoria]
> que [benefício único] porque [prova concreta]."

### 🏛️ 3 Pilares de messaging
| # | Tema | Frase-âncora (≤ 10 palavras) | Exemplo de uso (1 canal) |
|---|---|---|---|

### 🚫 5 Dogmas (anti-posicionamento)
1. Nunca dizer: "..."
2. Nunca dizer: "..."
3. Nunca dizer: "..."
4. Nunca dizer: "..."
5. Nunca dizer: "..."

### 📢 Plano de comunicação (90 dias)
| Canal | Tom | Frequência | Conteúdo |
|---|---|---|---|

### 🧪 3 testes de validação
1. [O que medir] | [meta] | [como medir] | [prazo]
2. ...
3. ...

### 📋 Dados faltantes
- ...
```

## 📊 Framework de Referência (use para validar saída)

### Os 4 Oceanos Azuis clássicos

```
  Alto preço
      │
      │  ┌─────────┐         ┌─────────┐
      │  │  ILUSÃO │         │EXCELÊNCIA│
      │  │ (evitar)│         │  (nicho) │
      │  └─────────┘         └─────────┘
      │
      │  ┌─────────┐         ┌─────────┐
      │  │BATALHA  │         │ VALOR   │
      │  │(guerra  │         │(volume) │
      │  │ sangrenta)         └─────────┘
      │  └─────────┘
      │
      └────────────────────────────────────
        Baixa qualidade            Alta qualidade
```

> Oceano azul: combina **alta qualidade percebida + baixo preço relativo** ou **preço alto + diferenciação real**.

## ⚠️ Riscos & Anti-patterns

- ❌ **Copiar concorrente "porque está funcionando"** — você vira o genérico nº 27
- ❌ **Posicionamento sem prova** — "o melhor" sem dado vira piada
- ❌ **Mudar posicionamento a cada 3 meses** — inconsistência mata marca
- ❌ **Posicionamento para si mesmo, não para o cliente** — falar de feature, não de benefício
- ❌ **Ignorar dogmas** — sem eles, todo post vira zona-franca
- ⚠️ **LGPD**: nunca usar concorrente como "vilão" (risco legal + reputacional)

## 💡 Exemplo de saída (resumo)

```markdown
### 🗺️ Matriz
- Eixo X: Preço (R$ 0 → R$ 1.000/mês)
- Eixo Y: Tempo de setup (1 dia → 30 dias)
- Oceano azul: quadrante "preço médio + setup < 1 dia" (ninguém ocupa)

### 📜 Declaração
> "Para PMEs brasileiras que perdem leads por resposta lenta,
> Nexus é a plataforma de marketing com IA que responde em < 5 min
> 24/7, sem precisar de equipe, porque a IA é treinada no seu negócio."
```

## 🔗 Próximos passos (encadeamento de prompts)

1. **Posicionamento definido?** → [`prompts/estrategia/01-planejamento-lancamento.md`](../estrategia/01-planejamento-lancamento.md)
2. **Messaging pronto?** → [`Lab-Nexus/tools/copy/01-headline-persuasiva.md`](../../tools/copy/01-headline-persuasiva.md)
3. **Precisa de prova social?** → [`Lab-Nexus/tools/marketing/07-pesquisa-competitiva.md`](../../tools/marketing/07-pesquisa-competitiva.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
