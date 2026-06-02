title: "07 · Pesquisa Competitiva"
description: "Framework para mapear concorrentes, posicionamento e oportunidades"
tags: [lab-nexus, marketing, pesquisa, competitivo, swot]
category: marketing
level: agente
estimated_time: "45 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: pricing-optimizer
course_anchor: cursos/master/00-otimizacao-conversao.md
🔬 07 · Pesquisa Competitiva
Framework 5-forces + matriz de posicionamento + 3 templates de relatório. Mapeia 5-10 concorrentes e identifica oceano azul.

🎯 Spec
Atributo	Valor
O que é	Framework de pesquisa competitiva (5-forces, SWOT, posicionamento) + templates
Quando usar	Antes de lançar produto, trimestralmente, antes de pivotar
Pré-requisitos	Nível 🥈 Agente; 2h de navegação em sites/ads dos concorrentes
Tempo estimado	45 min para mapear 5-10 concorrentes
Skill que executa	pricing-optimizer
Judge que valida	judge-revisor
📋 Playbook — Framework 5 Forças de Porter
1. Ameaça de novos entrantes
yaml

Copy
analise: "Quão fácil é entrar nesse mercado?"

indicadores:

  - "Investimento inicial"

  - "Barreiras regulatórias"

  - "Necessidade de rede/efeito"

  - "Economia de escala"

score: "1 (muito difícil entrar) - 5 (muito fácil)"
2. Poder de barganha dos fornecedores
yaml

Copy
analise: "Quantos fornecedores existem? Posso trocar?"

indicadores:

  - "Concentração de fornecedores"

  - "Custo de troca"

  - "Indispensabilidade"

  - "Ameaça de integração vertical"

score: "1-5"
3. Poder de barganha dos clientes
yaml

Copy
analise: "Clientes podem pressionar preços?"

indicadores:

  - "Concentração de clientes"

  - "Custo de troca do cliente"

  - "Disponibilidade de informação"

  - "Ameaça de integração reversa"

score: "1-5"
4. Ameaça de substitutos
yaml

Copy
analise: "Que outros produtos/serviços resolvem o mesmo problema?"

indicadores:

  - "Disponibilidade de substitutos"

  - "Propensão do cliente a trocar"

  - "Preço relativo"

score: "1-5"
5. Rivalidade entre concorrentes
yaml

Copy
analise: "Quão intensa é a competição?"

indicadores:

  - "Número de competidores"

  - "Crescimento da indústria"

  - "Custos fixos"

  - "Diferenciação"

score: "1-5"
📦 Asset (Template SWOT)
📊 Para cada concorrente principal
yaml

Copy
concorrente: "Nome da empresa"

url: "https://..."


forcas:

  - "Time com credibilidade"

  - "Lista grande (50k+)"

  - "Produto bem desenhado"


fraquezas:

  - "Copy genérica"

  - "Sem diferenciação clara"

  - "Suporte lento"


oportunidades:

  - "Público não atendido por eles"

  - "Conteúdo em falta"

  - "Pricing mal posicionado"


ameacas:

  - "Podem copiar features"

  - "Têm mais budget para ads"

  - "Brand forte"
📦 Asset (Matriz de Posicionamento)
yaml

Copy
eixo_x: "Preço (baixo → alto)"

eixo_y: "Personalização (baixa → alta)"


quadrantes:

  baixo_baixo: "Genérico commodity"

  baixo_alto: "Custom acessível (SWEET SPOT)"

  alto_baixo: "Premium massificado"

  alto_alto: "Boutique exclusivo"
📦 Asset (Planilha de Mapeamento)
csv

Copy
Concorrente,Preço,Público,Promessa,Canal,Força Principal,Fraqueza,Posicionamento

"Conc A",R$ 297,Iniciante,"Comece hoje",FB+YT,Lista grande,Suporte lento,Baixo-baixo

"Conc B",R$ 997,Intermediário,"Escale rápido",YT+Email,Autoridade,Preço alto,Alto-alto

"Conc C",R$ 497,Intermediário,"Sistema X",FB+IG,Produto polido,Copy fraca,Baixo-alto

"Você",R$ 597,Intermediário,?,?,?,?,?
📦 Asset (3 Templates de Relatório)
📋 Relatório 1 — Executive Summary (1 página)
yaml

Copy
sumario: |

  - 5 concorrentes principais mapeados

  - Posicionamento médio: commodity em preço baixo

  - Oceano azul: {{oportunidade_unica}}

  - Recomendação: {{acao_principal_30_dias}}
📋 Relatório 2 — Detalhado (10-20 páginas)
yaml

Copy
sumario_executivo: "..."

capa_de_mercado: "Tamanho, crescimento, players"

analise_5_forcas: "Por força"

analise_swot_cada_concorrente: "..."

matriz_posicionamento: "..."

gaps_e_oportunidades: "..."

recomendacoes_estrategicas: "..."

plano_acao_90_dias: "..."
📋 Relatório 3 — Update Trimestral (3-5 páginas)
yaml

Copy
mudancas_observadas: "..."

novos_entrantes: "..."

novas_features_concorrentes: "..."

ajustes_recomendados: "..."
📦 Asset (Prompt Gerador)
text

Copy
# Contexto

Você é um analista de mercado sênior com experiência em marketing digital.


# Objetivo

Analisar o nicho {{nicho}} e mapear 5-10 concorrentes principais,

incluindo:

1. Preço e oferta

2. Público-alvo

3. Canais de aquisição

4. Promessa principal

5. 1 força + 1 fraqueza de cada

6. 3 oportunidades não exploradas

7. Recomendação de posicionamento para o meu produto


# Estilo

Analítico, baseado em dados públicos. Cite fontes.


# Tom

Estratégico, com viés de "o que eu deveria fazer".


# Público

CEO + time de marketing.


# Formato

Markdown com 3 seções:

- Análise de mercado

- Tabela de competidores

- Recomendações priorizadas


# Guardrail

- SEMPRE citar fonte de dados

- NUNCA inventar números

- Indicar confiança (alta/média/baixa) por afirmação

- Respeitar LGPD (não expor PII)
📊 Métricas de Sucesso
Métrica	Antes	Depois
Clareza de posicionamento	baixa	alta
Conversão LP	variável	+15-30%
Tempo de decisão estratégica	longo	curto
Vantagem competitiva percebida	baixa	clara
Receita diferenciada	baixa	alta
⚠️ Riscos & Anti-patterns

❌ Copiar concorrente → sem diferenciação = morte

❌ Ignorar concorrentes pequenos → disruption vem deles

❌ Pesquisa 1x e nunca atualizar → mercado muda

❌ Focar só no produto (ignorar canal/marca)

❌ Não envolver o time → sem alinhamento

✅ Atualizar trimestralmente

✅ Cruzar 3 fontes (site, ads library, social listening)

✅ Identificar pelo menos 1 oceano azul

🔗 Próximas ferramentas

→ tools/marketing/06-funil-de-vendas.md — desenhe seu funil

→ tools/marketing/04-mapa-persona.md — defina a persona

→ tools/analytics/01-experimento-ab.md — teste posicionamento

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus