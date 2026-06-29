---
title: "Multi-Tenant & White-Label — Como Escalar a Nexus Para Parceiros"
subtitle: "O Manual Técnico-Comercial para Operar Múltiplos Clientes em Uma Única Plataforma"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-28"
tags: [academia, multi-tenant, white-label, parceria, escala]
pattern: "MMN_IA"
---

![Capa — Multi-Tenant & White-Label](../../assets/ebook_covers/ACAD-apostila-14-multi-tenant-whitelabel.webp)

**Multi-Tenant & White-Label — Como Escalar a Nexus Para Parceiros**

*O Manual Técnico-Comercial para Operar Múltiplos Clientes em Uma Única Plataforma*

**Por MMN_IA Collective · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este documento**

O modo como a Nexus escala **horizontalmente** é através de multi-tenancy e white-label. Em vez de construir uma plataforma nova para cada parceiro regional, **reutilizamos o IOAID** (vide Apostila 12) e criamos camadas de isolamento e customização. Este documento é o guia técnico-comercial para quem opera, vende ou implementa esses modelos. Se você é head de operações, arquiteto de soluções, parceiro regional ou consultor de implementação, comece aqui.

**Sumário**

> **•** 1. Multi-tenant vs white-label: qual a diferença
> **•** 2. Os 4 modelos de tenancy na Nexus
> **•** 3. Modelo 1 — Single-tenant dedicado (enterprise)
> **•** 4. Modelo 2 — Multi-tenant compartilhado (afiliados padrão)
> **•** 5. Modelo 3 — White-label regional (parceiros)
> **•** 6. Modelo 4 — White-label full-stack (operadoras)
> **•** 7. Isolamento de dados: como funciona
> **•** 8. Customização: o que pode e o que não pode
> **•** 9. Pricing de white-label (o que a Nexus cobra)
> **•** 10. SLA por modelo
> **•** 11. Onboarding de novo white-label
> **•** 12. Operação do dia-a-dia
> **•** 13. Compliance multi-jurisdicional
> **•** 14. Casos: 3 white-labels em produção em 2026
> **•** 15. Roadmap
> **•** 16. Glossário

---

**1. Multi-tenant vs white-label: qual a diferença**

**Multi-tenant** = múltiplos clientes compartilham a mesma instância técnica, mas com isolamento lógico de dados.

**White-label** = o cliente vê a plataforma com **sua marca**, **seu domínio**, **suas cores**, **seus usuários finais** — sem saber (ou sem se importar) que está usando o IOAID da Nexus.

Em 2026, **todo white-label é multi-tenant**, mas nem todo multi-tenant é white-label. White-label é um **plus comercial**, multi-tenancy é uma **decisão de arquitetura**.

**2. Os 4 modelos de tenancy na Nexus**

A Nexus suporta **4 modelos**, cada um com trade-offs próprios:

| Modelo | Isolamento | Customização | Custo | Tempo de setup |
|--------|-----------|--------------|-------|----------------|
| **Single-tenant** | Físico | Total | Alto | 4-8 semanas |
| **Multi-tenant padrão** | Lógico | Limitada | Baixo | Instantâneo |
| **White-label regional** | Lógico + namespace | Ampla | Médio | 2-4 semanas |
| **White-label full-stack** | Lógico + API dedicada | Quase total | Alto | 6-12 semanas |

**3. Modelo 1 — Single-tenant dedicado (enterprise)**

**Para quem:** clientes enterprise que precisam de **isolamento físico total** (banco, região, ops).

**Casos típicos:**
- Bancos e seguradoras.
- Operadoras de saúde.
- Governo.
- Empresas em indústrias altamente reguladas.

**Customização:** total. Cliente pode modificar tudo, incluindo o IOAID.

**Custo:** a partir de **R$50k/mês + setup**.

**SLA:** 99.99%, dedicado, suporte 24/7 com on-call sênior.

**Quando escolher:** dados sensíveis, latência crítica, compliance severo.

**4. Modelo 2 — Multi-tenant compartilhado (afiliados padrão)**

**Para quem:** afiliados Nexus individuais, pequenas agências, freelancers.

**Casos típicos:**
- 12.000+ afiliados ativos.
- Afiliados com 1-100 clientes finais.
- Operadores solo ou em dupla.

**Customização:** limitada. Logo customizável no perfil, mas UI/UX é a padrão.

**Custo:** plano free + R$99-499/mês conforme tier.

**SLA:** 99.95%, compartilhado, suporte em horário comercial + SLA para SEV-3.

**Quando escolher:** maioria dos casos. É o **default**.

**5. Modelo 3 — White-label regional (parceiros)**

**Para quem:** parceiros regionais que querem **oferecer Nexus com sua marca** em um país ou estado.

**Casos típicos:**
- Agências digitais que revendem.
- Franquias de marketing.
- Operadores regionais.

**Customização:** ampla. Logo, domínio, cores, idioma, skills permitidas, políticas locais.

**Custo:** R$2-10k/mês + Revenue share (15-25%) sobre uso da plataforma.

**SLA:** 99.95%, com prioridade para white-label.

**Quando escolher:** quando o parceiro **tem base de clientes própria** e quer oferecer "sua plataforma".

**6. Modelo 4 — White-label full-stack (operadoras)**

**Para quem:** grandes operadoras (telecom, varejo, bancos digitais) que querem **integrar Nexus como serviço embedded** em seu app.

**Casos típicos:**
- Apps de banco com "assistente de marketing" powered by Nexus.
- Plataformas de e-commerce com "IA para afiliados" embutida.
- Operadoras com base de lojistas.

**Customização:** quase total. API dedicada, white-label completo, integração profunda.

**Custo:** R$20-100k/mês + revenue share + setup fee.

**SLA:** 99.99%, dedicado, integração técnica com time Nexus.

**Quando escolher:** quando o parceiro **tem marca própria forte** e quer Nexus invisível dentro dela.

**7. Isolamento de dados: como funciona**

Quatro mecanismos:

**a) Row Level Security (RLS) no Postgres:**

```sql
CREATE POLICY tenant_isolation ON skills
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

Toda query automaticamente filtra por tenant_id.

**b) Namespace isolation:**
- Cada tenant tem namespace próprio em Redis.
- Skills, memória, configs — tudo isolado por namespace.

**c) Encryption per-tenant:**
- Chaves de criptografia únicas por tenant.
- KMS gerencia rotação automática.
- Tenant não pode acessar dados de outro tenant nem com privilégios elevados.

**d) Audit log por tenant:**
- Toda ação é logada com tenant_id.
- Logs retidos por 7 anos (compliance).
- Tenant pode ver apenas seus próprios logs.

**8. Customização: o que pode e o que não pode**

| Camada | Single-tenant | Multi-tenant | WL regional | WL full-stack |
|--------|---------------|--------------|------------|---------------|
| **Logo** | ✓ Total | ✓ Perfil | ✓ Total | ✓ Total |
| **Domínio** | ✓ Próprio | ✗ | ✓ Próprio | ✓ Próprio |
| **Cores/UI** | ✓ Total | ✗ | ✓ Template | ✓ Total |
| **Idioma** | ✓ Qualquer | ✓ 11 idiomas | ✓ 11 idiomas | ✓ Qualquer |
| **Skills** | ✓ Todas + custom | ✓ Marketplace padrão | ✓ Subset curado | ✓ Todas + custom |
| **Modelos** | ✓ Qualquer | ✓ Padrão | ✓ Curado | ✓ Qualquer |
| **IOAID** | ✓ Customizável | ✗ | ✗ | ✗ |
| **SHO** | ✓ Configurável | ✓ Padrão | ✓ Padrão | ✓ Configurável |
| **Audit log** | ✓ Próprio | ✓ Filtrado | ✓ Próprio | ✓ Próprio |
| **Região de dados** | ✓ Qualquer | ✗ Auto | ✓ Configurável | ✓ Configurável |

**9. Pricing de white-label (o que a Nexus cobra)**

**Componentes:**

1. **Setup fee** — R$5-50k conforme complexidade.
2. **Mensalidade base** — R$2-20k conforme tier.
3. **Revenue share** — 15-25% sobre uso da plataforma.
4. **Custo de API** — repassado + 10% (modelos LLM, etc.).
5. **Suporte premium** — opcional, R$3-10k/mês.

**Exemplo real (white-label regional):**
- Setup: R$8k (one-time).
- Mensalidade: R$3k.
- Revenue share: 20% sobre R$50k de uso = R$10k.
- Total mensal: R$13k.

**Cliente típico:** agência regional com 200-500 usuários finais, faturando R$80-150k/mês em serviços para eles.

**10. SLA por modelo**

| Modelo | Uptime | Latência p99 | MTTR | Suporte |
|--------|--------|--------------|------|---------|
| Single-tenant | 99.99% | <100ms | <30min | 24/7 sênior |
| Multi-tenant | 99.95% | <200ms | <1h | horário comercial + on-call |
| WL regional | 99.95% | <200ms | <1h | horário estendido |
| WL full-stack | 99.99% | <150ms | <30min | 24/7 sênior |

**11. Onboarding de novo white-label**

**Fase 1 — Descoberta (semana 1):**
- Reunião de kickoff.
- Levantamento de requisitos.
- Definição de modelo e pricing.
- Assinatura de contrato.

**Fase 2 — Setup técnico (semanas 2-4):**
- Provisionamento de tenant.
- Configuração de branding.
- Setup de domínio e SSL.
- Integração com sistemas do parceiro.

**Fase 3 — Validação (semana 5):**
- Testes de aceitação.
- Testes de carga.
- Compliance check (LGPD, etc.).
- Go/No-Go.

**Fase 4 — Go-live (semana 6):**
- Deploy em produção.
- Suporte intensificado nas primeiras 72h.
- Hypercare por 30 dias.

**Fase 5 — Operação regular (semana 10+):**
- Operação normal.
- Reviews mensais.
- Otimizações trimestrais.

**12. Operação do dia-a-dia**

**White-label operator** (função no parceiro) tem:

- Acesso ao painel admin (`/admin`).
- Gestão de usuários finais.
- Visualização de billing.
- Configuração de skills permitidas.
- Customização de templates de comunicação.
- Relatórios de uso.

**Nexus** (função no provedor) tem:

- Monitoramento 24/7 do tenant.
- Suporte L1/L2.
- Incident response.
- Updates e patches.

**Comunicação:**
- Slack Connect dedicado por tenant.
- Status page por tenant.
- Review semanal (15min) com stakeholder.

**13. Compliance multi-jurisdicional**

Cada white-label pode ter requisitos específicos:

- **Brasil (LGPD)** — DPO nomeado, base legal explícita.
- **Europa (GDPR)** — data residency na UE, opt-in explícito.
- **EUA (CCPA)** — right to know, right to delete.
- **Saúde (HIPAA)** — BAA obrigatório, encryption adicional.
- **Financeira (SOX)** — audit trail completo, segregação.

A Nexus suporta **todas** como configurações de tenant. Compliance officer valida caso a caso.

**14. Casos: 3 white-labels em produção em 2026**

**Caso A — AgênciaRegional (white-label regional):**
- Modelo: regional.
- Volume: 450 usuários finais.
- Vertical: e-commerce.
- Diferencial: skills customizadas para moda.
- Faturamento do parceiro: R$120k/mês.
- Receita Nexus: R$18k/mês.

**Caso B — BancoX (white-label full-stack):**
- Modelo: full-stack.
- Volume: 2.3M clientes do banco.
- Vertical: educação financeira + marketing.
- Diferencial: IA integrada no app do banco.
- Faturamento: não divulgado.
- Receita Nexus: R$80k/mês + share.

**Caso C — OperadoraY (single-tenant):**
- Modelo: enterprise single-tenant.
- Volume: 50k lojistas.
- Vertical: telecom.
- Diferencial: SLA 99.99% dedicado.
- Faturamento: R$2M/mês de fee.
- Receita Nexus: R$180k/mês.

**15. Roadmap**

**Q3 2026:**
- Tenant Analytics Dashboard (visão consolidada de uso por tenant).
- Auto-scaling de tenants baseado em padrões de uso.
- Self-service onboarding para white-label regional.

**Q4 2026:**
- Custom domain SSL automatizado via ACME.
- Tenant-level feature flags.
- Marketplace privado por tenant (skill library própria).

**Q1 2027:**
- Multi-region ativo-ativo para white-label full-stack.
- Tenant-level AI customization (fine-tune próprio).
- Compliance framework unificado (LGPD + GDPR + HIPAA).

**16. Glossário**

| Termo | Definição |
|-------|-----------|
| **Tenant** | Cliente dentro de uma plataforma multi-tenant |
| **Multi-tenant** | Múltiplos clientes no mesmo deployment |
| **Single-tenant** | Um cliente por deployment |
| **White-label** | Plataforma com marca do parceiro |
| **RLS** | Row Level Security |
| **Namespace** | Espaço lógico isolado |
| **KMS** | Key Management Service |
| **Audit log** | Registro imutável de ações |
| **Onboarding** | Processo de setup de novo cliente |
| **Hypercare** | Suporte intensificado pós go-live |
| **Go-live** | Início de operação em produção |
| **MTTR** | Mean Time To Recover |
| **SLA** | Service Level Agreement |
| **Revenue share** | Participação na receita |
| **Embedded** | Serviço integrado dentro de outro produto |
| **BAA** | Business Associate Agreement (HIPAA) |

---

*© 2026 Nexus HUB57 · Academ'IA · Todos os direitos reservados*
*Versão 1.0.0 · Junho 2026 · Apostila Academ'IA #14 — Multi-Tenant & White-Label*
