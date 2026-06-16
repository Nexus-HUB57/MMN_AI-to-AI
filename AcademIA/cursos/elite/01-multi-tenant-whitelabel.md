---
title: "01 · Multi-tenant e White-label"
level: elite
duration: 60min
prerequisites: ["00-blueprints-elite"]
tags: [multi-tenant, whitelabel, federacao, escalacao, enterprise]
last_updated: 2026-06-15
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Multi-tenant e White-label](../../assets/ebook_covers/ACAD-apostila-01-apresentacao-infraestrutura.webp)

**01 · Multi-tenant e White-label**

*Trilha Elite · 60 minutos · Pré-requisito: 00-Blueprints Elite*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Multi-tenant é a capacidade de rodar **múltiplas operações isoladas** em uma única infraestrutura Nexus. White-label é oferecer essa capacidade **como serviço** para outras marcas. Em 60 minutos, você vai entender como funciona tecnicamente, quanto cobrar, e como evitar os 3 erros que matam operações white-label.

**Sumário**

> **•** 1. O que é multi-tenant
> **•** 2. O que é white-label
> **•** 3. Como funciona a separação de dados
> **•** 4. Modelo de cobrança
> **•** 5. Como configurar multi-tenant
> **•** 6. Onboarding de cliente white-label
> **•** 7. Operação dia-a-dia
> **•** 8. Os 3 erros que matam white-label
> **•** 9. Métricas e SLA
> **•** 10. Próximo curso

---

**1. O que é multi-tenant**

**Multi-tenant** = múltiplos "clientes" (tenants) usando a mesma infraestrutura, mas com dados isolados.

Exemplo: você opera suplementos (Tenant A) e beleza (Tenant B) na mesma instância Nexus. Cada tenant vê só seus dados, mas compartilham:
- Skills (1 cópia, N tenants).
- Agentes (configuráveis por tenant).
- IOAID (mesma infraestrutura).
- SHO (mesma lógica).

**Benefício:** economia de escala (1 licença de skill atende N tenants). Custo marginal de adicionar tenant: ~R$ 5/mês.

**2. O que é white-label**

**White-label** = oferecer a operação multi-tenant como **produto** para outras marcas.

Em vez de você operar para si, você opera **para terceiros** que não querem construir a operação.

**Quem quer white-label:**
- Marcas com produto mas sem operação de afiliados.
- Infoprodutores que querem escalar sem contratar time.
- Agências que querem terceirizar a parte técnica.

**Quem oferece white-label:**
- Operadores Elite (top 10% da Nexus).
- Agências digitais.
- Consultorias especializadas.

**3. Como funciona a separação de dados**

**Técnica:** cada tenant tem um `tenant_id` único que é incluído em toda query ao banco. O Nexus garante (via `Row-Level Security`) que um tenant NUNCA vê dados de outro.

**Prático:**

```
Tenant A (Suplementos):  ve_only(tenant_id='A') → ve leads de suplementos.
Tenant B (Beleza):       ve_only(tenant_id='B') → ve leads de beleza.
```

**Mesmo que um humano erre query e peça dados de outro tenant, o RLS bloqueia.**

**4. Modelo de cobrança**

**Modelo 1 — Setup fee + mensalidade**
- Setup: R$ 5.000-15.000 (one-time, cobre onboarding).
- Mensalidade: R$ 1.500-5.000/mês (cobre operação).
- Para: clientes com poder aquisitivo.

**Modelo 2 — % da receita gerada**
- Você fica com 10-30% do que o white-label gera.
- Sem setup, sem mensalidade.
- Para: clientes novos, sem budget upfront.

**Modelo 3 — Híbrido**
- Setup pequeno (R$ 2.000) + mensalidade baixa (R$ 500) + % da receita.
- Atrai mais clientes, gera mais receita total.
- Recomendado: começar com este.

**5. Como configurar multi-tenant**

**Caminho:** `/dashboard/enterprise/multi-tenant`

1. **Crie a estrutura de tenant** (em `/dashboard/enterprise/tenants/new`):
   - Nome do tenant.
   - Tenant ID único (gerado automaticamente).
   - Plano (Starter, Pro, Elite).
   - Limites (número de contatos, número de skills).

2. **Defina skills compartilhadas** (vs. skills dedicadas):
   - Compartilhada: 1 licença atende N tenants (economia).
   - Dedicada: 1 licença por tenant (isolamento total).

3. **Configure RLS** (automático, mas revisar):
   - Confirmar que cada tenant só vê seus dados.
   - Confirmar que Judge não compartilha revisão cross-tenant.

4. **Configure dashboards**:
   - Dashboard global (você vê todos os tenants).
   - Dashboard por tenant (cliente vê só o dele).

**6. Onboarding de cliente white-label**

**Passo 1**: kickoff call (1h) com o cliente. Entender: produto, público, meta.

**Passo 2**: configuração inicial (3-5 dias). Configurar: tenant, skills, Judge, primeira campanha.

**Passo 3**: treinamento do cliente (1h). Ensinar: painel, dashboard, alertas.

**Passo 4**: piloto (14 dias). Cliente opera com 1 produto, 1 campanha.

**Passo 5**: escala (após piloto validado). Adicionar produtos, campanhas, otimizações.

**Total:** ~21 dias do kickoff ao cliente 100% operacional.

**7. Operação dia-a-dia**

- **Daily**: 30min para revisar dashboards globais, alertas críticos.
- **Weekly**: 1h para revisar cada tenant, identificar problemas.
- **Monthly**: 2h para review geral, cobrar mensalidades, report para clientes.

**Quem faz o quê:**
- **Você (operador white-label)**: cuida da infra, skills, Judge, otimizações.
- **Cliente**: aprova copies, decide ofertas, gerencia produto.

**8. Os 3 erros que matam white-label**

**Erro 1 — Não definir SLA claro**
- Cliente espera uptime 100%. Você promete 99.5%. Disputa.
- **Solução**: SLA explícito em contrato. "99.5% de uptime, com crédito proporcional se falhar".

**Erro 2 — Não isolar dados de verdade**
- Achar que RLS resolve tudo. Mas erro humano, log exposed, ou bug.
- **Solução**: auditoria mensal. Pen-test anual. Criptografia em repouso.

**Erro 3 — Subdimensionar suporte**
- Cliente liga às 17h59, sexta, com urgência. Você não atende. Cancela.
- **Solução**: SLA de resposta 4h úteis, com plantão para severidade alta.

**9. Métricas e SLA**

**Métricas de operação (você):**
- Uptime por tenant: > 99.5%.
- Latência média: < 2s.
- Taxa de erro: < 1%.
- Tempo de resposta a ticket: < 4h úteis.

**Métricas de negócio (cliente):**
- CAC efetivo.
- LTV médio.
- Conversão por coorte.
- ROI (% de receita vs. custo do white-label).

**Reporting:** mensal, com comparativo vs. mês anterior.

**10. Próximo curso**

👉 [`02-federacao-agentes.md`](02-federacao-agentes.md) — Federação de Agentes · 60 min

**Recursos extras:**
- **Apostila 04**: Orquestração Híbrida.
- **Apostila 01**: Apresentação da Infraestrutura (níveis de federação).

---

**01 · Multi-tenant e White-label** --- Trilha Elite

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
