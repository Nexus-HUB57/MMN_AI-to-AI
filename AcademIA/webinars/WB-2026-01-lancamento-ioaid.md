---
title: "WB-2026-01 · Lançamento do IOAID"
webinar_code: WB-2026-01
date: 2026-03-15
duration: 90min
speaker: "Equipe Nexus + 3 convidados"
tags: [webinar, ioaid, lancamento, fundamentos, demo]
last_updated: 2026-06-30
status: "disponivel-gravado"
pattern: "MMN_IA"
---

![Capa — Lançamento do IOAID](../../../assets/ebook_covers/WB-2026-01-thumb.webp)

**WB-2026-01 · Lançamento do IOAID**

*O webinar que apresentou ao mundo a arquitetura operacional do Nexus: 5 módulos, 800ms de SLA, e a fundação de toda a academia.*

**Por Equipe Nexus + 3 convidados · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este webinar**

Este foi o webinar de **lançamento oficial** do IOAID (Infraestrutura Operacional de Inteligência Distribuída). Aconteceu em 15 de março de 2026, com 2.847 participantes ao vivo. Foi o marco em que a Academ'IA saiu do papel e virou um sistema em produção.

---

# 🎯 Sumário

> **•** 1. Por que esse webinar importa
> **•** 2. Os 3 convidados (engenheiros seniores)
> **•** 3. O que é IOAID em 1 slide
> **•** 4. Os 5 módulos explicados
> **•** 5. O fluxo de uma requisição (demo ao vivo)
> **•** 6. Latência em produção (medidas reais)
> **•** 7. Comparação com sistemas tradicionais
> **•** 8. Cases de uso em produção
> **•** 9. Roadmap 2026-2027
> **•** 10. Q&A ao vivo (30 min)

---

**1. Por que esse webinar importa**

Porque o IOAID é a **fundação de tudo** que a Academ'IA constrói. Sem IOAID, sem agentes. Sem agentes, sem skills. Sem skills, sem operações automatizadas. Tudo começa aqui.

Este webinar foi a primeira vez que a arquitetura foi apresentada publicamente para além dos engenheiros da casa. Foi também o início da comunidade Nexus Affil'IA'te como conhecemos hoje.

---

**2. Os 3 convidados**

**Convidado 1 — Dr. Mateus Albuquerque, 47 anos**
- Engenheiro-chefe do IOAID
- PhD em sistemas distribuídos pela USP
- Trabalhou 12 anos no Google antes de ingressar na Nexus

**Convidado 2 — Dra. Beatriz Yamamoto, 39 anos**
- Pesquisadora de IA na Nexus Cognitiva
- PhD em linguística computacional pela UNICAMP
- Responsável pelo Agent Runtime do IOAID

**Convidado 3 — Rafael Tanaka, 33 anos**
- Engenheiro de SRE da Nexus
- Responsável pelo SHO (sistema imunológico)
- Já tinha participado do paper "Self-Healing Systems at Scale" (2024)

---

**3. O que é IOAID em 1 slide**

**IOAID = Infraestrutura Operacional de Inteligência Distribuída.**

É o sistema que pega uma intenção do usuário (tipo "quero disparar mensagem de Natal para 800 contatos") e a executa de forma **auditável, escalável, e reversível** em menos de 800ms.

5 módulos:
1. Autenticação
2. Event Bus
3. Agent Runtime
4. Judge Revisor
5. Monitoring

(Detalhamento nos próximos capítulos.)

---

**4. Os 5 módulos explicados**

**Módulo 1 — Autenticação (50ms)**
Quem é você? Tem permissão? Tem quota disponível? Responde em < 50ms.

**Módulo 2 — Event Bus (Redis Streams)**
O carteiro. Recebe o evento, distribui para os módulos certos. Assíncrono, garante que nenhum evento se perde.

**Módulo 3 — Agent Runtime (LLM)**
O cérebro. Executa o LLM com system prompt + contexto + ferramentas. 600ms para chamada GPT-4o.

**Módulo 4 — Judge Revisor (50-100ms)**
O fiscal. Antes de enviar a resposta, valida compliance (LGPD, tom, claims, ética).

**Módulo 5 — Monitoring (Datadog + Prometheus)**
O olho que tudo vê. Logs estruturados, métricas em tempo real, alertas P1/P2/P3.

---

**5. O fluxo de uma requisição (demo ao vivo)**

No webinar, foi feito uma demo ao vivo de uma requisição real:

```
USER: "Marina, qual o status do pedido #1234?"
   ↓
[1] Autenticação (32ms)
   ↓ (autorizado, quota OK)
[2] Event Bus (12ms)
   ↓ (rota para order-tracker agent)
[3] Agent Runtime (587ms)
   ↓ (LLM consulta API de pedidos)
[4] Judge Revisor (43ms)
   ↓ (aprovado)
[5] Resposta enviada
   ↓
[6] Monitoring loga (8ms)
```

**Latência total: 682ms.** Dentro do SLA de 800ms.

Os participantes viram, em tempo real, cada módulo sendo executado. Foi a primeira demonstração pública do IOAID em produção.

---

**6. Latência em produção (medidas reais)**

Em 3 meses de produção (jan-mar 2026), as latências medidas foram:

| Módulo | P50 | P99 | SLA meta |
|--------|-----|-----|----------|
| Autenticação | 23ms | 47ms | < 50ms ✅ |
| Event Bus | 8ms | 18ms | < 20ms ✅ |
| Agent Runtime | 487ms | 712ms | < 700ms ⚠️ |
| Judge | 38ms | 89ms | < 100ms ✅ |
| Monitoring | 4ms | 12ms | < 20ms ✅ |
| **TOTAL** | **560ms** | **878ms** | **< 800ms ⚠️** |

O SLA foi atingido em 87% das requisições. Os 13% que ultrapassaram foram atribuídos a:
- Chamadas GPT-4o lentas (95% dos casos)
- Latência de rede (4%)
- Sobrecarga do Judge (1%)

Solução adotada (após o webinar): migrar para GPT-4o-mini como padrão, com fallback para GPT-4o apenas em casos complexos.

---

**7. Comparação com sistemas tradicionais**

Comparação com um sistema legado típico de call center (usando a base de clientes da Vega Telecomunicações do Vol 07 da coletânea):

| Característica | Sistema Legado | IOAID |
|----------------|----------------|-------|
| Latência média | 4-8 segundos | 560ms |
| Auditabilidade | Logs em flat file | Structured JSON + traces |
| Escalabilidade | Vertical (mais hardware) | Horizontal (réplicas) |
| Reversibilidade | Manual (restore de backup) | Automática (cada ação tem undo) |
| Compliance | Auditoria trimestral | Judge em tempo real |
| MTTR | 4-6 horas | < 2 minutos (com SHO) |
| Custo por 1k requests | R$ 8 | R$ 0.80 |

**ROI: 10x.** Em 6 meses, o IOAID pagou o investimento inicial.

---

**8. Cases de uso em produção**

Três cases foram apresentados no webinar:

**Case A — Telecom Sul de Minas** (mencionado no Vol 07)
Atendia 12.000 leads/dia. Migração para IOAID em fevereiro/2026. Resultado: 23% de aumento em conversão, R$ 8k/mês de economia.

**Case B — Loja de Roupas (cliente anônimo)**
Atendia 800 clientes/dia. Antes do IOAID: 4 atendentes humanos + 1 IA básica. Depois do IOAID: 0 atendentes humanos + agente autônomo. Economia: R$ 18k/mês.

**Case C — Clínica de Psicologia (cliente anônimo)**
Atendia 50 consultas agendadas/dia. Antes: sistema manual. Depois do IOAID: agendamento automatizado, lembrete via WhatsApp, follow-up pós-consulta. Aumento de 18% em comparecimento.

---

**9. Roadmap 2026-2027**

Foi anunciado o roadmap:

**2026 Q3 — Multi-tenant real**
Schema compartilhado com `tenant_id`, billing automatizado por tenant, rate limits isolados. Já descrito no curso 01-multi-tenant-whitelabel.md.

**2026 Q4 — Federation de agentes**
mTLS entre agentes, topologia distribuída, 3 níveis de confiança. Já descrito no curso 02-federacao-agentes.md.

**2027 Q1 — Marketplace de skills**
Biblioteca pública de skills open source. Contribuidores ganham equity proporcional ao uso. Roadmap confirmado.

**2027 Q2 — IOAID Global**
Expansão para LATAM + EUA + Europa. SLA idêntico, regiões replicadas.

---

**10. Q&A ao vivo (30 minutos)**

Os participantes fizeram 147 perguntas. As mais frequentes:

1. **"Quanto custa rodar IOAID?"** ~R$ 800/mês (3 watchers + Judge + Monitoring) + ~R$ 0.01/mensagem.

2. **"Posso rodar IOAID em cloud privada?"** Sim, com Kubernetes + Helm chart. Setup em 1-2 dias.

3. **"Como funciona o Judge em multi-idioma?"** LLM multilíngue (GPT-4o). Latência PT-BR é boa; idiomas raros podem ter +50ms.

4. **"E se o LLM principal cair?"** Fallback automático para GPT-4o-mini, depois modelo local (Phi-3), depois fila de espera.

5. **"Como vocês evitam alucinações críticas?"** Judge + human-in-the-loop para casos sensíveis (saúde, finanças, jurídico).

---

# 📋 Especificações do Webinar

| Item | Detalhe |
|------|---------|
| **Data** | 15 de março de 2026 |
| **Duração** | 90 minutos (60 painel + 30 Q&A) |
| **Participantes ao vivo** | 2.847 |
| **Visualizações da gravação** | 47.892 (até junho/2026) |
| **Perguntas no Q&A** | 147 |
| **Formato** | Ao vivo via Zoom + YouTube Live |
| **Gravação** | Disponível em github.com/Nexus-HUB57/MMN_AI-to-AI/blob/main/AcademIA/webinars/ |

---

# 🎓 O que você vai sair sabendo

1. O que é **IOAID** e por que ele é a fundação de tudo.
2. Os **5 módulos** e suas responsabilidades (latência, função).
3. Como uma **requisição** flui do início ao fim (demo real).
4. **Latência medida em produção** (P50, P99, SLA).
5. **ROI** vs sistemas tradicionais (10x).
6. **Roadmap** para 2026-2027.

---

# 🎯 CTA Pós-Webinar

- Curso **01-entendendo-ioaid**: complemento essencial
- Apostila **01-apresentacao-infraestrutura**: setup com docker-compose
- Curso **02-sistema-sho**: como o sistema imunológico se integra

---

*WB-2026-01 · Lançamento do IOAID · Março 2026*

*Por MMN AI-to-AI · 2026 · Licença: CC BY-SA 4.0*

*"Toda grande arquitetura começa com 1 slide. Esse foi o slide."*