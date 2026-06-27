---
title: "Glossário Canônico · Nexus Affil'IA'te"
description: "Glossário canônico dos termos técnicos e operacionais do ecossistema Nexus"
tags: [lib-nexus, knowledge-base, glossario, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 📖 Glossário Canônico · Nexus Affil'IA'te

> **Source of truth terminológica** do ecossistema. Todos os documentos da Academ'IA, dos cursos e do código devem usar estes termos.

---

## 🏛️ Conceitos Arquiteturais

### IOAID
**Infraestrutura Operacional de Inteligência Distribuída**

Arquitetura de 5 camadas que sustenta o Nexus Affil'IA'te. Cada camada tem responsabilidades específicas e contratos bem definidos.

- **L1 — Runtime**: Núcleo técnico (Node.js, TypeScript, Postgres, Redis)
- **L2 — Orquestração**: Coordenação de agentes e skills
- **L3 — Inteligência**: Modelos de IA, prompts, skills
- **L4 — Federação**: Multi-tenant, white-label, federação entre nós
- **L5 — Experiência**: UI/UX, painel do afiliado, dashboards

> 📚 Ver: `01-modelo-ioaid.md`

### SHO
**Sistema Híbrido de Orquestração**

Camada que decide **o que** cada agente faz, **quando**, e **como** se coordena. Combina regras determinísticas (código) com decisões estocásticas (LLM). É a "espinha" do Nexus.

### SHO Levels
- **S0 — Manual**: Humano faz tudo
- **S1 — Assistido**: Agente sugere, humano aprova
- **S2 — Supervisionado**: Agente executa, humano revisa amostral
- **S3 — Autônomo**: Agente executa com guardrails, escalações pontuais
- **S4 — Federado**: Agentes de múltiplos nós cooperam

### Affil'IA'te
Marca do produto. **Sempre com acento** (Affil'IA'te). Sistema de **afiliação com IA** (inteligência aplicada) — a rede de afiliados que opera via agentes autônomos.

### Nexus
Plataforma central. Conjunto de **ferramentas + agentes + marketplace + academia**.

---

## 🤖 Agentes e Skills

### Agente (Agent)
Unidade de **execução autônoma** que opera dentro do SHO. Tem persona, skills, ferramentas, memória e contratos de entrada/saída.

Tipos canônicos:
- **Base Agent** — fundação comum a todos
- **Marketing Agent** — copywriting, segmentação
- **Copy Agent** — geração de copy
- **Analytics Agent** — análise de dados
- **Judge Revisor** — qualidade e auditoria
- **Compliance Auditor** — LGPD, CONAR
- **Federation Gate** — multi-tenant e PII

### Skill
Função **atômica** que um agente executa. Ex: `copywriter-persuasivo`, `audience-segmenter`, `roi-attributor`. Implementada em `backend/src/agentic/skills/<slug>.ts`.

### Tool (Ferramenta)
Recurso externo ao LLM que a skill usa. Ex: API do Hotmart, PostgreSQL, SendGrid, Meta Ads.

### Persona
Configuração de **comportamento, tom e limites** de um agente. Cada agente tem 1 persona principal (ex: "Copywriter Sênior" para o copy agent).

---

## 🧠 Inteligência e Modelos

### LLM
**Large Language Model**. Modelo de linguagem de grande porte (ex: GPT-4o, Claude 3.5, Llama 3.1).

### Prompt
Instrução enviada ao LLM. Estrutura canônica do Nexus: **CO-STAR** (Context, Objective, Style, Tone, Audience, Response).

### Guardrail
**Restrição explícita** no prompt para evitar comportamento indesejável. Inclui: palavras proibidas, limites LGPD, ranges numéricos.

### Jailbreak
Tentativa de bypass dos guardrails. Detectado pelo **Judge Revisor** e bloqueado automaticamente.

### Hallucination
Quando o LLM "inventa" informação. Mitigado com: contexto rigoroso, validação cruzada, Judge.

### Temperature
Parâmetro do LLM que controla aleatoriedade. Nexus usa:
- **0.0-0.3** para análise/dados
- **0.5-0.7** para copy
- **0.8-1.0** para brainstorming

### Token
Unidade de texto processada pelo LLM (~4 chars em inglês, ~3 em PT-BR). Custo é por token.

---

## 📊 Marketing Digital

### CPL (Custo por Lead)
Quanto se paga para adquirir 1 lead. Meta Nexus: ≤ R$ 25 (frio), ≤ R$ 10 (morno).

### CAC (Custo de Aquisição de Cliente)
Quanto se paga para converter 1 lead em cliente pagante. Meta Nexus: ≤ 30% do AOV.

### LTV (Lifetime Value)
Receita total que 1 cliente gera ao longo do relacionamento. Meta: LTV/CAC ≥ 3.

### AOV (Average Order Value)
Ticket médio. Meta Nexus: crescente (upsell, cross-sell).

### ROAS (Return on Ad Spend)
Receita gerada / valor investido em ads. Meta Nexus: ≥ 3x.

### Funil (Funnel)
Jornada do visitante até cliente. Estágios canônicos:
- **Visitante** (page_view)
- **Lead** (opt-in)
- **MQL** (Marketing Qualified Lead — engajou)
- **Oportunidade** (iniciou checkout / demo)
- **Cliente** (comprou)

### Cohort
Grupo de usuários que compartilham um evento inicial em um período. Ex: "todos que assinaram em jan/26".

### Churn
% de usuários que abandonaram no período. Meta Nexus: ≤ 5%/mês.

### RFM
**Recência, Frequência, Monetário**. Modelo de segmentação baseado em comportamento de compra.

### CJM (Customer Journey Map)
Mapa visual da jornada do cliente com emoções, touchpoints, dores e oportunidades.

### ICP (Ideal Customer Profile)
Perfil do cliente ideal. Persona "qualificada" para priorização de leads e marketing.

---

## 🛒 Marketplace e Afiliados

### Afiliado
Membro da rede que **promove** produtos de terceiros em troca de comissão.

### Produtor
Quem **cria** o produto (curso, e-book, software).

### Comissão
% ou valor fixo pago ao afiliado por venda. Nexus: configurável por produtor.

### Sub-afiliado
Afiliado que foi indicado por outro afiliado. Ganha % menor (geralmente 5-10% do que o afiliado direto ganha).

### Marketplace
Plataforma onde produtores listam produtos e afiliados se cadastram para promover.

### Hotmart / Kiwify / Eduzz / Stripe
Gateways de pagamento integrados ao Nexus. Cada um tem **API + webhook** próprio.

### Order Bump
Oferta adicional apresentada **no checkout**, antes do pagamento final. Aumenta AOV.

### Upsell
Oferta de **produto superior** (mais caro) após a compra inicial.

### Downsell
Oferta de **produto inferior** quando o upsell é recusado.

### Cross-sell
Oferta de **produto complementar** ao que foi comprado.

---

## ⚖️ Legal e Compliance

### LGPD
**Lei Geral de Proteção de Dados** (Lei 13.709/2018). Regula coleta, armazenamento e uso de dados pessoais no Brasil.

**Princípios**:
- Finalidade
- Necessidade
- Segurança
- Transparência
- Não discriminação

**Bases legais** (art. 7º): consentimento, contrato, obrigação legal, legítimo interesse, entre outras.

### CONAR
**Conselho Nacional de Autorregulamentação Publicitária**. Regula propaganda no Brasil.

**Regras chave**:
- Sem promessas absolutas
- Sem apelo a medo
- Sem comparação depreciativa
- Sem testemunhos pagos como espontâneos

### PII (Personally Identifiable Information)
Dado pessoal que identifica alguém. **Nunca** deve ser:
- Exposto em logs
- Compartilhado entre nós sem consentimento
- Usado para treinamento sem opt-in

### Opt-in
Consentimento **explícito** do usuário para receber comunicações. Necessário para e-mail, WhatsApp, SMS.

### Opt-out
Direito de **descadastrar** a qualquer momento. Toda comunicação deve ter opção clara de opt-out.

### Direito de Titular (LGPD art. 18)
Usuário pode pedir: acesso, correção, anonimização, portabilidade, eliminação dos dados.

### DPO (Data Protection Officer)
Encarregado de dados. No Nexus, papel exercido pelo **Compliance Auditor** agent.

---

## 🔌 Tecnologia e APIs

### tRPC
Framework TypeScript para APIs com **type-safety end-to-end**. Usado no backend Nexus.

### Webhook
Callback HTTP acionado por evento externo. Nexus consome de Hotmart, Kiwify, Stripe, Eduzz, Shopee.

### Idempotência
Garantia de que o **mesmo evento processado 2x** resulta no mesmo efeito. Implementado via `event_id` único.

### HMAC
Hash-based Message Authentication Code. Usado para **validar assinatura** de webhooks (segurança).

### API REST
API tradicional HTTP/JSON. Nexus expõe REST pública + tRPC interna.

### Pixel
Código JS colocado no site para **rastrear conversões**. Tipos: Meta Pixel, Google Tag, TikTok Pixel.

### Consent Mode v2
Padrão Google para **respeitar consentimento LGPD** no tracking. Tem 4 signals: ad_storage, ad_user_data, ad_personalization, analytics_storage.

### UTM
**Urchin Tracking Module**. Parâmetros da URL para rastrear origem: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

### MCP (Model Context Protocol)
Protocolo de **contexto para LLMs**. Nexus implementa MCP para integrar ferramentas e dados aos agentes.

### CDN
**Content Delivery Network**. Distribui assets estáticos globalmente. Nexus usa Cloudflare/AWS CloudFront.

---

## 🏗️ Operação e DevOps

### Deploy
Publicação de nova versão. Nexus usa **CI/CD** com GitHub Actions + smoke tests + canary deploy.

### Blue-Green Deploy
Estratégia com 2 ambientes (blue/green) para deploy sem downtime. Nexus usa em produção.

### Canary Deploy
Deploy gradual (% de tráfego). Nexus valida 1% → 10% → 50% → 100%.

### Smoke Test
Teste mínimo de sanidade após deploy. Verifica: API up, DB conectado, login funciona.

### RTO / RPO
- **RTO** (Recovery Time Objective): tempo para restaurar serviço
- **RPO** (Recovery Point Objective): perda máxima de dados

Nexus: RTO ≤ 4h, RPO ≤ 1h.

### Backup 3-2-1
Regra canônica: **3 cópias**, em **2 mídias diferentes**, com **1 offsite**. Criptografado AES-256.

### SLO (Service Level Objective)
Meta de disponibilidade. Nexus público: 99.5% (≈ 3.6h downtime/mês).

---

## 💼 Negócio

### MRR (Monthly Recurring Revenue)
Receita recorrente mensal. Crescimento meta: ≥ 5%/mês.

### ARR (Annual Recurring Revenue)
MRR × 12. Usado para valuation.

### Churn Rate
% de clientes que cancelam por período. Meta: ≤ 5%/mês.

### Net Revenue Retention
Receita de clientes existentes (incluindo expansão - churn). Meta: ≥ 100%.

### Payback Period
Tempo para recuperar o CAC. Meta: ≤ 12 meses.

### Unit Economics
Análise de **receita - custo por unidade** (cliente, lead, transação). Inclui CAC, LTV, margem, payback.

---

## 🏷️ Tags Transversais (Sistema)

Tags usadas para **correlação semântica** entre documentos da Academ'IA (Obsidian):

`#operacao` `#copy` `#agentes` `#skills` `#whatsapp` `#disparo` `#funil` `#a-b-test` `#lgpd` `#monetizacao` `#marketplace` `#hotmart` `#shopee` `#automacao` `#analise` `#certificacao` `#whitelabel` `#federacao` `#judge` `#sho` `#ioaid` `#multi-tenant` `#coorte` `#churn` `#lifecycle` `#mcp` `#trust` `#pii`

---

## 📚 Como Usar Este Glossário

1. **Em novos documentos**: use os termos exatos deste glossário
2. **Em código**: use os mesmos nomes em variáveis, tabelas, APIs
3. **Em discussão**: referencie o termo (ex: "vou seguir o guardrail de LGPD")
4. **Em PR**: revisão deve validar consistência terminológica
5. **Atualizações**: este é um documento vivo, mas mudanças precisam de PR + 2 aprovações

---

## 🔗 Documentos Relacionados

→ `01-modelo-ioaid.md` — Arquitetura IOAID em 5 camadas
→ `02-taxonomia-skills.md` — Catálogo de skills
→ `03-conformidade-lgpd.md` — Mapeamento LGPD
→ `../agents-specs/00-base-agent.md` — Especificação base
→ `../best-practices/00-prompt-engineering.md` — Padrões de prompt

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
