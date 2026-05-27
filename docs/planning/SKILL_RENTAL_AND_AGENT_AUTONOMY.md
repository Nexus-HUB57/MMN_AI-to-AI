# 🧠 Aluguel de Skills + Roadmap de Autonomia dos Agentes IA

> **Documento operacional · Nexus SaaS · IOAID**
> Última revisão: 2026-05-27
> Status: análise técnica + plano de execução incremental

---

## Parte 1 · Análise de viabilidade do **aluguel de Skills**

### 1.1 Contexto atual

Hoje cada Skill é **adquirida** por um Peer/Orquestrador como item permanente do seu Agente IA, vinculada à carteira de capacidades do agente em `agent_skills` (tabela atual em `database/schemas/schema-skills.ts`). O catálogo está em `skills`, com níveis `basic`, `intermediate`, `advanced` e relação 1:N com `agentSkills` (vínculo Agente ↔ Skill).

A mecânica de venda atual cobre o ciclo **Pack → Skills incluídas + Skills avulsas** (router `trpc.skills.*`), mas **não há ciclo recorrente**: uma vez adquirida, a Skill fica disponível indefinidamente.

### 1.2 Motivação do "aluguel"

Existem três cenários reais em que **alugar uma Skill** é melhor do que comprá-la:

1. **Skills sazonais** — campanhas de tráfego pago para Black Friday, datas comemorativas, lançamentos específicos. O Peer só precisa da capacidade por algumas semanas.
2. **Skills caras (Advanced/Enterprise)** — capacidades top como *Forecasting de Demanda*, *LLM Multi-Agente Coordenado*, *Análise de Sentimento em Massa* têm custo alto e ROI volátil. Aluguel mensal permite **testar antes de comprar**.
3. **Skills compartilháveis em Sub-Redes** — um Agente Orquestrador pode alugar uma Skill e ceder uso temporário aos sub-agentes da sua linhagem (modelo Skill-as-a-Service).

### 1.3 Viabilidade técnica

**Veredito: ✅ Tecnicamente viável e arquiteturalmente coerente com o modelo IOAID.**

A infraestrutura já tem 80% do necessário:

| Componente existente | Reuso para aluguel |
|---|---|
| Tabela `agent_skills` | Adicionar colunas `rental_until` (timestamp), `rental_price_cents`, `rental_status` |
| Router `trpc.skills.*` | Adicionar mutations `rentSkill`, `cancelRental`, `renewRental` |
| Modelo de Packs com `levelGranted` | Aluguel não promove nível — apenas libera a capacidade na janela contratada |
| Cron job (`backend/src/services/cronScheduler.ts`) | Adicionar job diário `expire_skill_rentals` que move skills vencidas para `inactive` |
| BullMQ workers | Workers já processam comissões; novo worker `skillRentalBilling` cobra mensalidade no PIX/BeYour |

### 1.4 Modelo econômico sugerido

| Tier de Skill | Preço de compra (atual) | Preço de aluguel mensal | ROI esperado |
|---|---|---|---|
| Básica (Nível I) | R$ 50,00 | R$ 9,90/mês | 5 meses pagam a compra |
| Intermediária (Nível II) | R$ 150,00 | R$ 29,90/mês | 5 meses pagam a compra |
| Avançada (Nível III) | R$ 500,00 | R$ 89,90/mês | 5-6 meses pagam a compra |

**Por que 5-6 meses?** Mantém a opção de compra atrativa para quem usa por longo prazo, e aluguel atrativo para uso curto. Acima de 6 meses contínuos, o sistema **sugere automaticamente** a conversão em compra (mecanismo *rent-to-own*).

### 1.5 Regras operacionais propostas

1. **Janela mínima**: 30 dias (impede uso descartável de skill para "1 campanha de 3 dias")
2. **Renovação automática**: opt-in via campo `autoRenew` em `agent_skills` (similar ao `autoWithdraw` que já existe no perfil)
3. **Bloqueio por inadimplência**: ao vencer, Skill volta para `inactive` em até 24h se não houver renovação ou pagamento. **Lista Inad. Skills/Upgrades** (já implementada em `/admin/delinquents`) recebe automaticamente.
4. **Compartilhamento na Sub-Rede (SiSu)**: Peers a partir de Agente Preditivo I podem compartilhar **1 Skill alugada** com até 3 sub-agentes diretos. Cada compartilhamento adicional custa +R$ 5/mês.
5. **Conversão *rent-to-own***: após 6 cobranças consecutivas pagas, o sistema oferece a compra com 30% de desconto.

### 1.6 Integração com o regramento de comissões

O **aluguel de Skills** entra no Clube de Vantagens como **nova fonte de receita** com comissionamento dedicado:

- **Indicador direto** que aluga Skill → 15% para o uplink imediato (1º Nível)
- Demais níveis: **sem comissionamento em aluguel** (evita estímulo a aluguel artificial em downlines)

Isto preserva a integridade da Matriz Forçada de 5 Níveis sem inflar percentuais.

### 1.7 Impacto na arquitetura

```
Compra atual (já implementado)
  Peer → /trpc/skills/purchase → agent_skills (status: active, expires_at: null)

Aluguel novo (proposto)
  Peer → /trpc/skills/rent → agent_skills (status: rented, expires_at: +30d)
                          → cobrança recorrente via Cron
                          → expire_skill_rentals job diariamente
                          → notificação 7d/3d/1d antes do vencimento
                          → bloqueio automático ao vencer
```

### 1.8 Recomendação

**✅ Implementar em fase 2** (depois da estabilização do backend Render online).

A implementação inicial **não precisa de mudança de schema** — basta:
1. Migration adicionando 4 colunas em `agent_skills`
2. 3 procedures novas em `trpc.skills.*`
3. 1 cron job diário
4. 1 nova categoria no painel de inadimplência (já preparado)

Estimativa: **2-3 dias de desenvolvimento + 1 dia de testes**.

---

## Parte 2 · Roadmap de **autonomia operacional dos Agentes IA**

### 2.1 Diagnóstico atual

O sistema chegou ao estado em que **toda a base agêntica está construída**:

- Núcleo Gerativo (administrativo/marketing): ✅ presente em `backend/src/agentic/`
- Núcleo Generativo (executivo, skills, tomada de decisão): ✅ presente em `backend/src/genkit/`
- Núcleo Orquestrador (gestão operacional): ✅ presente em `backend/src/agentic/marketingOrchestrator.ts`
- Vector memory: ✅ `backend/src/agentic/memory/vectorMemory.ts`
- LLM-as-Judge: ✅ `backend/src/agentic/judge/llmJudge.ts`
- BullMQ queue runtime: ✅ `backend/src/agentic/queue.ts`
- Audit trail: ✅ `backend/src/agentic/audit.ts`
- Skills catalog: ✅ 45 skills em `nexus-marketplace.ts`
- Sync de upgrades: ✅ `trpc.aiSync.*` operacional
- Tools (Instagram, WhatsApp): ✅ `backend/src/agentic/tools/`

O que falta agora é **transformar essa base em operação 100% autônoma e auditável**.

### 2.2 Os 7 vetores de autonomia a varrer

Para o Agente IA cumprir 100% do papel descrito em `docs/planning/Age.txt` ("vendas, prospecção, formação de equipes, planejamento, tomada de decisão"), cada um dos vetores abaixo precisa estar **calibrado, conectado a métricas reais e auditável**:

#### Vetor 1 · **Publicação Automática** (conteúdo gerativo)
- ✅ Tools `instagramTool` e `whatsappTool` já existem
- ⚠️ Falta: pipeline ContentGenerator → ContentCalendar → execução real via OAuth de cada Peer
- 🎯 Próximo passo: implementar `socialAccounts.connect` para Instagram/WhatsApp Business e validar postagem real em ambiente sandbox

#### Vetor 2 · **Prospecção de Vendas** (outbound)
- ✅ `agentic/agents/marketingAgent.ts` tem prompt base
- ⚠️ Falta: integração com lista de leads + scoring + agendamento de follow-up via cron
- 🎯 Próximo passo: novo serviço `backend/src/services/leadScoringService.ts` lendo `tracking_links` para ranquear prospecção

#### Vetor 3 · **Identificação de Padrões e Tendências**
- ✅ `marketplaceHelpers.getTrendingProducts` já agrega
- ⚠️ Falta: feed real-time Hotmart/Shopee via webhook
- 🎯 Próximo passo: implementar webhook `/api/webhooks/hotmart` (já documentado no Render Blueprint)

#### Vetor 4 · **Prospecção de Adeptos** (cadastros novos)
- ✅ Mini-site `/afiliado/:code` operacional
- ⚠️ Falta: o Agente IA enviar o link de cadastro **proativamente** via WhatsApp em horários otimizados
- 🎯 Próximo passo: novo job cron `agent_outbound_invites` rodando 3x/dia

#### Vetor 5 · **Aplicação de Skills**
- ✅ Catálogo + entitlement OK
- ⚠️ Falta: cada Skill ter um *handler executor* real (não só registro). Ex.: skill "Copywriter Persuasivo" precisa de uma função que receba um produto e gere copy real.
- 🎯 Próximo passo: criar `backend/src/agentic/skills/` com 1 arquivo por skill, cada um expondo `execute(input): Promise<output>`

#### Vetor 6 · **Sincronização de Upgrades**
- ✅ `aiSync` operacional
- ⚠️ Falta: ao adquirir upgrade, recarregar config do agente em runtime sem precisar reiniciar
- 🎯 Próximo passo: invalidar cache do agente via `eventBus.publish('agent.upgrade.applied')`

#### Vetor 7 · **Tomada de Decisão Autônoma**
- ✅ LLM-as-Judge presente
- ⚠️ Falta: políticas de decisão (policies) — quando o agente pode agir sozinho vs. pedir aprovação humana
- 🎯 Próximo passo: criar tabela `agent_policies` com escopos: `auto_post`, `auto_invite`, `auto_purchase_skill`, `auto_withdraw_request`, com toggles por Peer

### 2.3 Métricas de autonomia (Autonomy Score)

Cada Agente IA terá um **Autonomy Score 0-100** calculado a partir de:

| Indicador | Peso | Como medir |
|---|---|---|
| % de tarefas completadas sem intervenção humana | 30 | `audit_logs.requires_human_review = false` |
| Acurácia LLM-as-Judge | 20 | média score do judge nos últimos 7d |
| % de Skills configuradas | 15 | skills com `handler` válido / total no Pack |
| Latência média de resposta | 15 | < 2s = 100%, > 10s = 0% |
| Taxa de aprovação de saídas | 10 | aprovações manuais / total |
| Diversidade de canais ativos | 10 | número de tools conectadas (IG, WA, etc.) |

O Score é exibido no `/agents/dashboard` e no Admin (`/admin/dashboard`).

### 2.4 Plano de execução (fases 30-60-90 dias)

**Fase 1 · 30 dias — Operação Base Auditável**
- Backend deployado no Render com Postgres/Redis ativos
- 6 handlers de skill priorizados implementados (3 básicas + 2 intermediárias + 1 avançada)
- Webhooks Hotmart funcionando em produção
- Autonomy Score visível em `/agents/dashboard`
- Logs estruturados de cada decisão do agente em `audit_logs`

**Fase 2 · 60 dias — Operação Autônoma Limitada**
- Aluguel de Skills em produção (escopo da Parte 1 deste doc)
- Job cron `agent_outbound_invites` ativo
- Policies de decisão configuráveis pelo Peer
- LLM-as-Judge revisando 100% das saídas críticas (auto-purchase, auto-withdraw)
- Taxa de aprovação automática > 80%

**Fase 3 · 90 dias — Operação Autônoma Plena**
- Todas as 45 skills com handlers ativos
- Agentes a partir do Nível Preditivo II operando sem necessidade de revisão diária
- Sub-Redes (SiSu) coordenadas pelo Orquestrador automaticamente
- Autonomy Score médio da rede > 75
- Dashboard executivo `/admin/dashboard` mostrando KPIs de autonomia em tempo real

### 2.5 Riscos e mitigações

| Risco | Mitigação |
|---|---|
| LLM gera conteúdo prejudicial à marca | LLM-as-Judge com policies de marca + bloqueio automático |
| Custo de inferência explode | Quota por Peer + circuit breaker em `backend/src/_core/CircuitBreaker.ts` |
| Suspensão de conta Instagram/WhatsApp | Rate-limit + warm-up de conta nova (já planejado em `socialRouter`) |
| Comissões pagas incorretamente por bug agêntico | Audit trail completo + dry-run obrigatório em comissões antes do batch |
| Inadimplência dispara cancelamentos em massa | Notificações graduais 7d/3d/1d (já previsto na Parte 1.5) |

---

## Parte 3 · Decisões pendentes (carecem de validação do orquestrador humano)

1. **Aprovar aluguel de Skills com preços propostos** (1.4)? Ou ajustar para 4 meses (mais barato) / 7 meses (mais caro)?
2. **Aprovar comissionamento de 15% no 1º Nível em aluguel** (1.6)? Ou aplicar mesma cascata padrão (20%/10%/5%/2,5%/1%)?
3. **Limite de compartilhamento SiSu de Skill alugada**: 3 sub-agentes (proposto) ou ilimitado dentro da matriz?
4. **Autonomy Score**: tornar público para todos os Peers ou restrito ao admin?
5. **Ordem de implementação das 45 skills com handler**: priorizar pelas mais vendidas, mais usadas, ou mais lucrativas?

---

**Próximo passo recomendado:** validar as decisões da Parte 3, depois iniciar a Fase 1 do roadmap (30 dias) em paralelo ao deploy do backend Render que já está pronto no [`render.yaml`](../../render.yaml).

Documento mantido por Equipe Nexus Affil'IA'te · Núcleo Orquestrador.
