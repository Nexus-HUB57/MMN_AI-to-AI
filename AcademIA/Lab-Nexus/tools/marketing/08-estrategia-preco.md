---
title: "08-estrategia-preco"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "08 · Estratégia de Precificação"
description: "Framework para definir preço de produto digital com ancoragem e elasticidade"
tags: [lab-nexus, marketing, pricing, ancoragem, estrategia]
category: marketing
level: master
estimated_time: "45 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: pricing-optimizer
course_anchor: cursos/master/00-otimizacao-conversao.md
💰 08 · Estratégia de Precificação
Framework de precificação (custo + valor + concorrência + ancoragem) + 5 modelos de pricing + testes de elasticidade.

🎯 Spec
Atributo	Valor
O que é	Framework de pricing + 5 modelos + script para A/B test de preço
Quando usar	Lançamento de produto, revisão de preço, expansão de linha
Pré-requisitos	Nível 🥇 Master; custos calculados; público validado
Tempo estimado	45 min para definir preço inicial
Skill que executa	pricing-optimizer
Judge que valida	judge-revisor
📋 Playbook — As 4 Dimensões do Preço
1. Preço baseado em CUSTO (cost-plus)
yaml

Copy
formula: "preco = (custo_unitario + margem) / (1 - taxa_gateway - taxa_impostos)"

exemplo: |

  Custo operacional por aluno: R$ 20

  Margem desejada: 70%

  Taxa gateway + impostos: 10%

  

  preco = (20 * 1.7) / 0.9

  preco = R$ 37.78 (apenas base de custo)

limitacao: "Ignora valor percebido e concorrência"

uso_recomendado: "Produtos commodity, validação inicial"
2. Preço baseado em VALOR (value-based)
yaml

Copy
formula: "preco = (valor_percebido_cliente) * (percentual_captura)"

exemplo: |

  Curso que promete +R$ 5k/mês de renda

  Valor percebido em 12 meses: R$ 60k

  Captura de 5%: R$ 3k

  Captura de 1%: R$ 600

uso_recomendado: "Produtos educacionais, mentorias, high-ticket"
3. Preço baseado em CONCORRÊNCIA (market-based)
yaml

Copy
formula: "preco = media_concorrencia * fator_diferenciacao"

exemplo: |

  Média de mercado: R$ 497

  Somos premium: 1.5x = R$ 745

  Somos acessível: 0.7x = R$ 348

uso_recomendado: "Validar posicionamento, evitar outlier"
4. Preço baseado em ANCORAGEM (psychological)
yaml

Copy
principio: "Cliente compara com referência anterior"

exemplos:

  - "Preço original R$ 1.997 → promoção R$ 497 (desconto de 75%)"

  - "Por mês: R$ 49 (vs R$ 597 à vista)"

  - "Por dia: R$ 1,63 (vs R$ 597 à vista)"

uso_recomendado: "Sempre. Combinar com outros modelos."
📦 Asset (5 Modelos de Pricing)
📊 Modelo 1 — One-Time (Pagamento Único)
yaml

Copy
preco: "R$ X à vista ou Yx de R$ Z"

vantagens: ["Simplicidade", "Decisão rápida", "Sem churn"]

desvantagens: ["CAC tem que ser pago rápido", "Sem recorrência"]

ideal_para: "Cursos, e-books, templates, software perpétuo"

exemplo: "Curso 'Funil Lucrativo' — R$ 497 à vista ou 12x R$ 49"
📊 Modelo 2 — Assinatura (Recorrente)
yaml

Copy
preco: "R$ X/mês ou R$ Y/ano (com desconto)"

vantagens: ["LTV previsível", "Receita recorrente", "CAC recuperado em meses"]

desvantagens: ["Churn constante", "Suporte contínuo", "Precisa de valor constante"]

ideal_para: "SaaS, comunidade, conteúdo recorrente, software"

exemplo: "Nexus Pro — R$ 97/mês ou R$ 970/ano (economize R$ 194)"
📊 Modelo 3 — Freemium
yaml

Copy
preco: "Grátis (limitado) + Premium (completo)"

vantagens: ["Topo de funil automático", "Aquisição barata", "Viralidade"]

desvantagens: ["Suporta 1-3% pagantes", "Custo de servidor", "Difícil converter"]

ideal_para: "Ferramentas, plataformas, comunidades abertas"

exemplo: "Plano Free: 100 leads/mês. Pro: ilimitado por R$ 97/mês"
📊 Modelo 4 — Tiered (3 Níveis)
yaml

Copy
preco: "Básico + Pro + Premium"

vantagens: ["Cobre mais público", "Ancoragem clara", "Upsell natural"]

desvantagens: ["Complexidade de produto", "Custo de múltiplas versões"]

ideal_para: "SaaS, serviços, ferramentas"

exemplo: |

  Starter: R$ 47/mês

  Pro: R$ 147/mês (mais popular) ← ancora

  Enterprise: R$ 497/mês
📊 Modelo 5 — High-Ticket com Aplicação
yaml

Copy
preco: "R$ X mil, requer call de aplicação"

vantagens: ["LTV altíssimo", "Filtro de qualidade", "Suporte premium"]

desvantagens: ["Operação 1:1 cara", "Volume baixo", "Vendas complexas"]

ideal_para: "Mentoria, consultoria, implementação, mastermind"

exemplo: "Mentoria 6 meses — R$ 12k (R$ 6k entrada + 6x R$ 1k)"
📦 Asset (Script de A/B Test de Preço)
🧪 Teste de elasticidade-preço
yaml

Copy
setup:

  duracao: "2-4 semanas (mínimo 200 vendas por variante)"

  split: "50/50 (A: preço X, B: preço Y)"

  metricas: ["Receita total", "Conversão", "LTV estimado"]


analise:

  - "Preço X converte mais, mas Y gera mais receita?"

  - "Elasticidade = %Δdemanda / %Δpreço"

  - "Se |elasticidade| > 1, demande é elástica (subir preço = menos receita)"


cuidados:

  - "Não testar mais de 1 elemento por vez (preço + copy)"

  - "Rodar em mesmo período (evitar sazonalidade)"

  - "Mesma qualidade de tráfego"
🧪 Exemplo real
yaml

Copy
semana_1_a_2:

  preco_A: "R$ 497"

  preco_B: "R$ 597"

  trafego_A: 5000

  trafego_B: 5000

  vendas_A: 50 (1% CVR)

  vendas_B: 40 (0.8% CVR)

  receita_A: R$ 24850

  receita_B: R$ 23880


conclusao: "Manter R$ 497 (mais receita, mesma margem)"
📊 Métricas de Sucesso
Modelo	Métrica chave	Meta
One-Time	Conversão LP	≥ 2%
Assinatura	MRR + Churn	MRR +5% mês, Churn < 5%
Freemium	Free → Paid	≥ 2%
Tiered	Distribuição	60% middle tier
High-Ticket	Show-up + Close	≥ 70% show-up, ≥ 30% close
⚠️ Riscos & Anti-patterns

❌ Preço por achismo (sem cálculo) → sub ou superestimado

❌ Preço baixo demais (commoditiza) → prejuízo de margem

❌ Preço alto demais sem prova → CAC explode

❌ Mudar preço toda semana → confunde cliente

❌ Ignorar ancoragem (preço sem contexto) → valor não percebido

✅ Testar elasticidade com dados (não intuição)

✅ Mudar preço 1-2x por ano (estabilidade)

✅ Ancorar sempre (referência anterior)

✅ Alinhar preço ao ICP (segmento premium → preço premium)

🔗 Próximas ferramentas

→ tools/marketing/07-pesquisa-competitiva.md — analise mercado

→ tools/analytics/01-experimento-ab.md — teste de preço

→ cursos/master/00-otimizacao-conversao.md — funil completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus

8 marketing tools prontas. Agora analytics/ — 6 ferramentas.


Edited 6 file(s), Used 1 tool(s)

todowrite
todowrite
Input
{
  "todos": [
    {
      "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/workflows/ — n8n + make",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
      "status": "pending",
      "priority": "high"
    }
  ]
}
Result
[
  {
    "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/workflows/ — n8n + make",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
    "status": "pending",
    "priority": "high"
  }
]