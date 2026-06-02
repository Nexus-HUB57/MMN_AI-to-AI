---
title: "Prompt — Diagnóstico Completo de Funil"
description: "Diagnóstico 360° de funil: gargalos + causa raiz + ações priorizadas"
tags: [lab-nexus, prompt, analise, funil, diagnostico, causa-raiz]
category: prompts/analise
level: master
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
---

# 🔬 Prompt — Diagnóstico Completo de Funil

> Diagnóstico 360° que vai além do gargalo: investiga causa raiz, prioriza ações por impacto/esforço e sugere testes A/B.

## 🎯 Quando usar

- Quando o funil "não está convertendo" mas você não sabe onde mexer
- Antes de investir em tráfego pago (descobrir se o problema é funil ou aquisição)
- Em revisão trimestral (Estrategista)
- Quando o CPL subiu sem mudança óbvia de canal

## 📋 Variáveis de Entrada

```yaml
dados_funil: "Tabela com estágios, volumes, taxas de conversão entre eles"
periodo: "Ex: últimos 30 dias (2026-05-02 a 2026-05-31)"
referencia_anterior: "Ex: mesmo período de 2026-04"
orcamento_para_acao: "Ex: R$ 5.000 para mudanças no mês"
restricoes: "Ex: não posso mexer em preço / canal X está em manutenção"
```

## 💬 Prompt Completo

```markdown
Você é um Estrategista Sênior de Growth, especialista em funis de
marketing digital. Faça um DIAGNÓSTICO 360° do funil abaixo.

## CONTEXTO

Dados do funil atual (últimos 30 dias):
{dados_funil}

Dados de referência (período anterior):
{referencia_anterior}

Restrições:
{restricoes}

Orçamento disponível para mudanças:
{orcamento_para_acao}

## O QUE EU QUERO

1. **Mapa de gargalos** (estágio com maior drop-off absoluto E relativo)
2. **Causa raiz** de cada gargalo (3 hipóteses ranqueadas por probabilidade)
3. **Impacto estimado** se o gargalo for resolvido (em R$ e em % de conversão)
4. **Top 5 ações** priorizadas por matriz Impacto × Esforço
5. **2 testes A/B** sugeridos (hipótese + variação + métrica primária)
6. **1 quick win** que pode ser feito em < 7 dias com < R$ 500
7. **Red flag** se houver (sinal de problema estrutural, não operacional)

## REGRAS

- Use APENAS os dados fornecidos — não invente números
- Se faltar dado para uma análise, marque como "DADO FALTANTE" e diga qual coletar
- Toda recomendação deve ter **esforço estimado** (P/M/G) e **prazo** (semanas)
- Marque suposições vs fatos com [SUPOSTO] ou [FATO]
- LGPD-safe: nunca sugira ações que dependam de dado pessoal sem base legal

## FORMATO DE SAÍDA

Use este template exato:

### 🎯 Resumo executivo (3 linhas)
[resumo]

### 📊 Mapa de gargalos
| Estágio | Drop-off | Tendência vs período anterior | Severidade (1-5) |
|---|---|---|---|

### 🧠 Causa raiz (top 3)
1. [Gargalo X] → [SUPOSTO/FATO] causa mais provável: ...
2. ...

### 🚀 Plano de ação (top 5, ordenado por ROI)
| # | Ação | Impacto (R$/%) | Esforço | Prazo | Risco |
|---|---|---|---|---|---|

### 🧪 Testes A/B sugeridos (2)
1. **Hipótese:** ...
   **Variação A vs B:** ...
   **Métrica primária:** ...
   **Tamanho mínimo de amostra:** ...
2. ...

### ⚡ Quick win (< 7 dias, < R$ 500)
[ação concreta]

### 🚨 Red flag
[se houver, senão escrever "Nenhum identificado"]

### 📋 Dados faltantes para análise mais profunda
- ...
```

## 📊 Quando aplicar

| Cenário | Use este prompt? |
|---|---|
| CPL subiu 30% mês a mês | ✅ Sim |
| "Funil não está convertendo" sem detalhe | ✅ Sim |
| Queda em 1 estágio específico conhecido | ⚠️ Use o `02-analise-funil-conversao` (mais focado) |
| Antes de lançar produto novo | ❌ Use `01-analise-coorte-churn` para entender retenção |
| Trimestral (visão macro) | ✅ Sim, + 02 em sequência |

## ⚠️ Riscos

- ❌ **Tratar causa como efeito** — o prompt tenta ranquear, mas sempre valide com 1+ fonte de dados secundária
- ❌ **Rodar sem dados de referência** — sem comparar com período anterior, vira chute
- ❌ **Ignorar red flag** — se o prompt marcar 🚨, pare e investigue antes de otimizar
- ❌ **Aplicar top 5 de uma vez** — execução em paralelo mata atribuição

## 💡 Exemplo de saída (resumo)

```markdown
### 🎯 Resumo executivo
- Gargalo principal: Checkout (78% de drop-off, 2.3x a referência)
- Causa raiz #1 [SUPOSTO]: friction de cadastro (campo CPF pedindo dígito verificador)
- Quick win: remover campo CPF do checkout, mover para pós-compra (1 dev, 3 dias)
- Red flag: nenhum
```

## 🔗 Próximos passos (encadeamento de prompts)

1. **Achou gargalo no checkout?** → [`prompts/estrategia/03-posicionamento-competitivo.md`](../estrategia/03-posicionamento-competitivo.md) para revisar oferta
2. **Causa raiz é copy?** → [`Lab-Nexus/tools/copy/05-landing-page.md`](../../tools/copy/05-landing-page.md)
3. **Causa raiz é UX?** → pedir protótipo Figma ao designer + A/B test sugerido
4. **Causa raiz é preço?** → [`Lab-Nexus/tools/marketing/08-estrategia-preco.md`](../../tools/marketing/08-estrategia-preco.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
