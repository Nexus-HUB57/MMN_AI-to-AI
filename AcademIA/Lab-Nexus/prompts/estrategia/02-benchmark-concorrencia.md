title: "Prompt — Benchmark Competitivo"
description: "Analisar concorrentes e identificar posicionamento e oportunidades"
tags: [lab-nexus, prompt, estrategia, benchmark, concorrencia]
category: prompts/estrategia
level: agente
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
🔍 Prompt — Benchmark Competitivo
Mapeia 5-10 concorrentes principais, identifica posicionamento, gaps de mercado e oportunidades estratégicas.

🎯 Quando usar

Antes de lançar um produto novo

Trimestralmente para revisar posicionamento

Antes de pivotar

Ao definir pricing e messaging

📋 Variáveis de Entrada
yaml

Copy
nicho: "Ex: Cursos de marketing digital para afiliados"

meu_produto: "Nome + 1 frase de descrição"

publico_alvo: "Persona primária"

concorrentes_conhecidos: "Lista opcional (se não houver, usar 'descobrir')"

objetivo: "Lançar | Reposicionar | Precificar | Expandir"
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um analista de mercado sênior com expertise em marketing digital brasileiro,

especializado em análise competitiva, posicionamento estratégico e identificação de oceano azul.


# OBJETIVO

Realizar benchmark competitivo completo do nicho {{nicho}} e entregar:

1. Mapa de players (top 5-10 concorrentes)

2. Matriz de posicionamento (preço × personalização)

3. Análise SWOT dos 3 principais

4. Gaps de mercado (3-5 oportunidades não exploradas)

5. Recomendação estratégica de posicionamento

6. Plano de diferenciação (curto/médio/longo prazo)


# INPUTS

Nicho: {{nicho}}

Meu produto: {{meu_produto}}

Público-alvo: {{publico_alvo}}

Concorrentes conhecidos: {{concorrentes_conhecidos}}

Objetivo da análise: {{objetivo}}


# ESTRUTURA DA ANÁLISE


## 1. Sumário Executivo (5 linhas)

- Visão geral do mercado

- Nível de competição (intensidade 1-10)

- 1 oceano azul identificado

- Recomendação principal


## 2. Mapa de Players (Top 5-10)

Tabela com: Concorrente | Preço | Público | Promessa | Canal Principal | Força | Fraqueza


## 3. Matriz de Posicionamento

- Eixo X: Preço (baixo → alto)

- Eixo Y: Personalização (baixo → alto)

- 4 quadrantes explicados

- Posicionar cada concorrente no gráfico

- Identificar quadrante mais vazio (oportunidade)


## 4. SWOT dos 3 Principais

Para cada um dos top 3:

- Forças (2-3)

- Fraquezas (2-3)

- Oportunidades (2-3)

- Ameaças (2-3)


## 5. Gaps de Mercado (3-5)

Para cada gap:

- Descrição

- Tamanho do público não atendido

- Dificuldade de entrada (1-10)

- ROI estimado (alto/médio/baixo)


## 6. Recomendação de Posicionamento

- Ângulo sugerido (1 frase)

- 3 argumentos para defender

- 1-2-3 de pricing (básico, recomendado, premium)

- Público-alvo refinado


## 7. Plano de Diferenciação

- 30 dias: 3 ações táticas

- 90 dias: 2 ações estruturais

- 180 dias: 1 visão de longo prazo


# REGRAS

- SEMPRE citar fonte dos dados

- NUNCA inventar números (se não souber, indicar "estimativa" com confiança)

- Indicar confiança (alta/média/baixa) por afirmação

- LGPD: anonimizar PII em qualquer menção

- Incluir players menores (pode haver disruption)


# FORMATO

Markdown estruturado, com tabelas para comparações.

Use emojis: 🟢 oportunidade | 🟡 neutro | 🔴 ameaça


# GUARDRAIL

- Se o nicho for muito nichado, alertar sobre TAM pequeno

- Se concorrentes > 20, focar em top 5

- Se houver player dominante (>50% market share), alertar sobre barreira de entrada
💡 Exemplo de Saída (resumido)
Input:

text

Copy
Nicho: Cursos de funil de vendas para afiliados

Meu produto: "Funil Lucrativo" (R$ 497, 8 semanas, ao vivo)

Público: afiliada em transição, 30-40 anos, fatura R$ 10-20k

Objetivo: Reposicionar e expandir para high-ticket
Output esperado (resumido):

1. Sumário Executivo

Mercado maduro, ~30 players, intensidade 7/10.

Oceano azul: mentoria high-ticket (R$ 5k+) com operação + comunidade.

Recomendação: reposicionar Funil Lucrativo como "stepping stone" para high-ticket.

2. Mapa de Players
Concorrente	Preço	Público	Promessa	Canal	Força	Fraqueza
Flavia Giolla	R$ 997	Intermediário	"Do zero ao 6 dígitos"	YT+IG	Autoridade	Preço alto
Pedro Sobrinho	R$ 297	Iniciante	"Primeira venda"	YT	Volume	Suporte lento
Bruno Fraga	R$ 497	Intermediário	"Método X"	YT	Conteúdo	Genérico
Sua marca	R$ 497	Intermediário	?	?	?	?
3. SWOT — Top 3

Flavia Giolla
- Forças: autoridade, prova social, network
- Fraquezas: preço alto, suporte saturado
- Oportunidades: mercado high-ticket
- Ameaças: novos entrantes com método similar

4. Gaps
1.
Mentoria high-ticket (R$ 5k+) com comunidade + 1:1
2.
Curso para nichos específicos (saúde, finanças, relacionamento)
3.
Ferramenta + curso (produto híbrido)
5. Recomendação
Ângulo: "Do R$ 20k ao R$ 100k com mentoria high-ticket acessível"

Pricing 1-2-3: R$ 497 (curso) → R$ 2.5k (grupo) → R$ 8k (mentoria)

Público refinado: afiliada 30-40, R$ 15-30k, quer escalar sem virar "coach"
6. Plano de Diferenciação

30 dias: criar caso de sucesso visível, abrir lista de espera high-ticket

90 dias: lançar grupo intermediário (R$ 2.5k)

180 dias: lançar mentoria (R$ 8k, 10 vagas/trimestre)

📊 Métricas de Sucesso
Métrica	Meta
Diferenciação percebida	≥ 4/5 (survey)
Conversão vs média do nicho	≥ +20%
Market share (estimado)	crescente
Clareza do posicionamento	alta
⚠️ Erros Comuns

❌ Copiar posicionamento do concorrente líder

❌ Ignorar players pequenos (podem disruptar)

❌ Tentar competir em preço (race to bottom)

❌ Focar só em produto (ignorar canal/marca)

❌ Não atualizar trimestralmente

🔗 Próximos Prompts

→ 03-benchmark-concorrencia.md — analise o mercado

→ 01-planejamento-lancamento.md — use o posicionamento

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
