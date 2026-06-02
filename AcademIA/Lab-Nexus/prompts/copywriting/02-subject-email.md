title: "Prompt — Subject Line de E-mail"
description: "Gerar 5 subject lines com taxa de abertura acima de 35%"
tags: [lab-nexus, prompt, copywriting, email, subject-line]
category: prompts/copywriting
level: fundamental
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
📧 Prompt — Subject Line de E-mail
Prompt para gerar 5 subject lines de alta abertura (target: 35-50%).

🎯 Quando usar

Antes de enviar qualquer e-mail (newsletter, promocional, transacional)

Em testes A/B de assunto

Para reativar leads inativos

📋 Variáveis de Entrada
yaml

Copy
objetivo: "open | click | reply | conversion"

conteudo_resumo: "1 frase do que o e-mail entrega"

segmento: "quem vai receber (frio, morno, quente, inativo)"

tom: "curioso | urgente | pessoal | valor | fofoca"

tamanho_max: 50  # caracteres (ideal mobile)
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um especialista em email marketing com expertise em subject lines

que geram alta taxa de abertura no mercado brasileiro.


# OBJETIVO

Gerar 5 subject lines de e-mail com alto potencial de abertura.


# INPUTS

Objetivo principal: {{objetivo}}

Conteúdo do e-mail (resumo): {{conteudo_resumo}}

Segmento de audiência: {{segmento}}

Tom preferido: {{tom}}

Tamanho máximo: {{tamanho_max}} caracteres


# ESTRUTURA — 5 VARIANTES


1. CURIOSIDADE — Fazer o leitor querer abrir sem entregar o assunto

2. URGÊNCIA — Escassez real ou prazo (não fake)

3. VALOR DIRETO — Benefício concreto em 1 linha

4. PESSOAL/INTIMISTA — Como se fosse de um amigo

5. POLÊMICA/PROVOCATIVA — Quebra de expectativa


# REGRAS

- SEMPRE teste em minúscula (aumenta sensação de pessoal)

- NUNCA comece com "RE:" ou "FWD:" falso (spam trigger)

- NUNCA use "GRÁTIS" em caixa alta (spam trigger)

- EVITE palavras spam: "dinheiro fácil", "100% garantido", "clique aqui"

- USE emojis com moderação (0-1, no início ou final)

- MÁXIMO 1 exclamação


# FORMATO DE SAÍDA

Tabela markdown:


| # | Variante | Caract. | Hook | Open Rate Esperado | Uso |

|---|----------|---------|------|-------------------|-----|

| 1 | ... | XX | ... | X% | ... |

| 2 | ... | XX | ... | X% | ... |

| 3 | ... | XX | ... | X% | ... |

| 4 | ... | XX | ... | X% | ... |

| 5 | ... | XX | ... | X% | ... |


# GUARDRAIL

- Indicar se algum subject é risco de spam (>30% palavras gatilho)

- Sugerir preheader text para cada variante
💡 Exemplo de Saída
Input:

text

Copy
Objetivo: open

Conteúdo: 5 erros de funil que estão matando sua conversão

Segmento: Morno (já abriu 3+ e-mails)

Tom: Valor

Tamanho: 50
Output esperado:

#	Variante	Caract.	Hook	Open Rate	Uso
1	você está cometendo (pelo menos) 3 desses	42	Auto-crítica	38%	Morno
2	5 erros de funil (o #3 é sutil)	36	Curiosidade	41%	Lead qualificado
3	corrigi esses 5 e dobrei conversão	38	Prova pessoal	35%	Lead frio
4	esses 5 erros custam R$ 5k/mês	35	Perda financeira	44%	Lead quente
5	pode apagar se quiser 😅	30	Anti-marketing	32%	Reativação
Recomendação: Variante 4 (maior impacto para lead quente).

📊 Métricas de Sucesso
Métrica	Meta
Open rate	≥ 35% (target 50%)
Click-through	≥ 4%
Spam complaint	< 0.05%
Judge score	≥ 0.80
⚠️ Erros Comuns

❌ Subject genérico ("Newsletter #45")

❌ Caixa alta excessiva

❌ Palavras-gatilho de spam

❌ Subject > 70 caracteres (corte no mobile)

❌ Emoji em todo e-mail (perde personalização)

🔗 Próximos Prompts

→ 03-cta-persuasivo.md — finalize com CTA

→ 04-preview-text.md — preheader

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus