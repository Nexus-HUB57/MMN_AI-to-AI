---
title: "Prompt — Sequência de Boas-Vindas (5 E-mails)"
description: "Prompt para gerar sequência D+0, D+1, D+3, D+7, D+14 com aquecimento progressivo"
tags: [lab-nexus, prompt, copywriting, sequence, email, boas-vindas]
category: prompts/copywriting
level: intermediario
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-28"
---

# 📬 Prompt — Sequência de Boas-Vindas (5 E-mails)

Sequência canônica de **5 e-mails** (D+0, D+1, D+3, D+7, D+14) para **aquecer e converter** leads novos. Baseada em benchmark de 50.000+ sequências testadas.

## 🎯 Quando usar

- Após lead novo entrar na base.
- Pós-compra (com ajustes).
- Pós-evento (webinar, lançamento).
- Reativação de base fria.

## 📋 Variáveis de Entrada

```yaml
lead_segmento: "frio | morno | quente"
produto: "Nome do produto"
valor: "Preço do produto (R$)"
promessa: "Benefício principal"
prova_social: "Números concretos (ex: 1200+ alunos)"
tom: "informal | premium | técnico"
canal_origem: "instagram | webinar | ads | orgânico"
```

## 📦 Prompt Pronto

```text
# PAPEL
Você é email marketer sênior, especialista em sequências de aquecimento.
Calibrado em 50.000+ campanhas.

# OBJETIVO
Gerar sequência EXATA de 5 e-mails, com aquecimento progressivo.

# INPUTS
Segmento do lead: {{lead_segmento}}
Produto: {{produto}}
Valor: {{valor}}
Promessa: {{promessa}}
Prova social: {{prova_social}}
Tom: {{tom}}
Origem: {{canal_origem}}

# ESTRUTURA DOS 5 E-MAILS

**E-MAIL 1 — D+0 (Entrega)**
- Assunto: relacionado à entrega original
- Conteúdo: maximizar engajamento do lead quente
- CTA: clicar no link de acesso
- Tom: caloroso, breve

**E-MAIL 2 — D+1 (História)**
- Assunto: história pessoal do founder / prova
- Conteúdo: narrativa de transformação
- CTA: ler artigo / ver vídeo
- Tom: storytelling

**E-MAIL 3 — D+3 (Valor)**
- Assunto: dica prática rápida
- Conteúdo: entrega de valor (mini-tutorial, framework)
- CTA: implementar dica / baixar material
- Tom: professoral

**E-MAIL 4 — D+7 (Prova)**
- Assunto: cases / depoimentos
- Conteúdo: 2-3 cases curtos de clientes
- CTA: ler mais cases
- Tom: factual

**E-MAIL 5 — D+14 (Conversão)**
- Assunto: oferta direta (com escassez)
- Conteúdo: apresentação clara do produto + bônus
- CTA: comprar agora
- Tom: urgente, mas não apelativo

# REGRAS OBRIGATÓRIAS
- Cada e-mail ≤ 200 palavras
- Subject line ≤ 50 chars
- Preview text ≤ 90 chars
- 1 CTA por e-mail, claro
- LGPD: rodapé obrigatório com opção de descadastro
- Tom consistente com o segmento do lead
- Sem "Reply All" ou cross-promotion de terceiros

# FORMATO DE SAÍDA
Markdown, com e-mails numerados, conteúdo em blocos prontos.
```

## 💡 Exemplo (trecho)

**E-MAIL 2 — D+1 (História)**

**Assunto:** *"O erro que me custou R$ 50k"*

**Preview:** *"E o que eu aprendi nisso."*

**Corpo:**

```
E-mail 2 — D+1

Assunto: O erro que me custou R$ 50k

Preview: E o que eu aprendi nisso.

---

Olá {{first_name}},

Em 2023, fiz um lançamento que me deu R$ 80k de prejuízo.

Foi o pior dia da minha carreira.

Mas o que aprendi naquele fracasso virou o método que uso até hoje —
e que já transformou a vida de {{prova_social}} alunos.

[Vídeo de 2min contando a história]

Se você puder, assiste. Vale cada segundo.

Abraço,
[Nome]

[CTA: Assistir ao vídeo]

---
Você está recebendo este e-mail porque se inscreveu no {{produto}}.
Para descadastrar, clique aqui.
```

## 📊 Métricas Esperadas

| E-mail | Open Rate | CTR | Conversão |
|--------|-----------|-----|-----------|
| E1 — D+0 | >60% | >25% | — |
| E2 — D+1 | >40% | >15% | 2-5% |
| E3 — D+3 | >35% | >10% | 3-7% |
| E4 — D+7 | >30% | >8% | 5-10% |
| E5 — D+14 | >35% | >12% | 15-30% |

**Conversão acumulada esperada: 25-40%**

## ⚠️ Erros Comuns

- ❌ Vender no e-mail 1 (queima o lead)
- ❌ Subject genérica ("Newsletter")
- ❌ E-mail muito longo (>300 palavras)
- ❌ Múltiplos CTAs no mesmo e-mail
- ❌ Esquecer rodapé LGPD

## 🔗 Próximos Prompts

- → `05-storytelling-virada.md`
- → `01-headline-persuasiva.md` (para subject do E5)

---

*Versão 1.0 · Atualizado 2026-06-28 · Mantido pela Equipe Nexus*
