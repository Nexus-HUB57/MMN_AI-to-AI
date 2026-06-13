---
title: "WB-2026-01 · Lançamento do IOAID"
webinar_code: WB-2026-01
date: 2026-03-15
duration: 90min
speaker: "Equipe Nexus"
tags: [webinar, ioaid, lancamento, fundamentos]
last_updated: 2026-06-12
version: "2.0.0"
status: realizado + apostila expandida
pattern: "MMN_IA"
---

![Capa — Lançamento do IOAID](../../assets/ebook_covers/ACAD-apostila-01-apresentacao-infraestrutura.webp)

**WB-2026-01 · Lançamento do IOAID**

*Webinar expandido em apostila — lançamento oficial da Infraestrutura Operacional de IA Distribuída*

**Palestrante:** Equipe Nexus
**Data original:** 15/03/2026 · **Duração:** 90 min

Nexus Affil'IA'te · 2026

**Sobre esta apostila**

Esta é a versão expandida do webinar WB-2026-01. O webinar original foi apresentado em 15/03/2026 e teve 1.247 inscritos, 612 presentes ao vivo, 1.890 replays em 30 dias, e NPS 78. Esta apostila transforma o conteúdo de 90 minutos em material de referência permanente, com seções expandidas, exemplos, e links para os playbooks relacionados.

**Sumário**

> **•** 1. Abertura institucional
> **•** 2. IOAID — Visão arquitetural (5 módulos)
> **•** 3. Demo ao vivo — afiliado criando agente em 5 min
> **•** 4. Casos de uso — 3 histórias reais de early adopters
> **•** 5. Roadmap Q2–Q4 2026
> **•** 6. Q&A completo (15 perguntas respondidas)
> **•** 7. Estatísticas do evento
> **•** 8. Materiais complementares
> **•** 9. Próximos passos
> **•** 10. Apêndice: glossário técnico

---

**1. Abertura institucional**

**Por que lançamos o IOAID agora?**

A Nexus existe desde 2022. Nos primeiros 3 anos, o trabalho foi construir o marketplace de skills, a base de usuários, e os processos de federação. Mas em 2025, identificamos um problema recorrente: **afiliados que usavam 3-5 skills diferentes tinham que pular entre 3-5 painéis diferentes**. Cada skill era uma ilha.

Em outubro de 2025, sentamos para desenhar o que viria a ser o IOAID: uma camada que integrasse todas as skills, todos os agentes, e todos os processos de federação em uma única infraestrutura coerente. Levamos 5 meses para entregar.

O resultado é o que estamos lançando hoje.

**2. IOAID — Visão arquitetural (5 módulos)**

O IOAID (Infraestrutura Operacional de Inteligência Distribuída) tem 5 módulos, organizados em pipeline:

**M1 — Ingestion**
- Recebe requisições externas.
- Valida autenticação, parâmetros, e contexto.
- Devolve um `request_id` único.

**M2 — Routing**
- Decide qual agente/skill deve processar.
- Encadeia skills quando necessário.
- Suporta fallback em 2 níveis.

**M3 — Execution**
- Roda cada skill em sandbox isolado.
- Timeout configurável (default 30s).
- Captura todos os side-effects.

**M4 — Persistence**
- Registra input, decisão, output, e custo.
- Alimenta telemetria.
- Permite replay de qualquer execução.

**M5 — Response**
- Devolve o resultado com metadados.
- Inclui selo de aprovação do Judge.
- Inclui log de custódia para compliance.

A combinação dos 5 módulos entrega SLA de **< 2 segundos para 95% das ações** em produção, como mostrado nas estatísticas abaixo.

**3. Demo ao vivo — afiliado criando agente em 5 min**

Na demo, criamos do zero o agente `agente_demo_joao` com:
- 3 skills (copywriter, segmenter, judge).
- 1 base de 50 contatos (importada via CSV).
- 1 campanha de teste.

**Tempo total: 4 minutos e 38 segundos.**

A demo provou que, com o IOAID, **criar um agente funcional deixou de ser projeto de 1 semana e virou projeto de 1 hora**.

**4. Casos de uso — 3 histórias reais de early adopters**

**Caso 1 — Marina (suplementos)**
- Perfil: afiliada solo, 8 meses de operação.
- Antes: 1 disparo/dia, R$ 3.800/mês.
- Depois: 2 disparos/dia, R$ 11.400/mês.
- Tempo gasto: caiu de 4h/dia para 45min/dia.

**Caso 2 — Carlos (curso online)**
- Perfil: gestor de tráfego, funil longo.
- Antes: 3 pessoas no WhatsApp, R$ 47k/mês.
- Depois: 1 pessoa monitorando, R$ 138k/mês.
- CAC caiu 35%, LTV subiu 60%.

**Caso 3 — Equipe Prime (multi-nicho)**
- Perfil: 12 afiliados em rede.
- Antes: 12 contas isoladas, R$ 480k/mês agregado.
- Depois: federação multi-tenant, R$ 1.1M/mês.
- Custo de skill caiu 80% (1 licença atende 12 nós).

(Para o detalhamento completo, ver [Apostila 02 - Cases Reais de Orquestração Autônoma](../apostilas/02-cases-orquestracao-autonoma.md).)

**5. Roadmap Q2–Q4 2026**

- **Q2 2026** (atual): federação multi-tenant com mTLS — **✅ NO AR**
- **Q3 2026**: Agentic Mesh — 3+ nós coordenando em tempo real
- **Q4 2026**: SHO preditivo — antecipação de falhas via modelos preditivos
- **Q1 2027 (planejado)**: Skills Marketplace aberto — qualquer afiliado pode publicar

**6. Q&A completo (15 perguntas respondidas)**

**P1: O IOAID substitui meu CRM?**
R: Não. Integra-se via webhook bidirecional. Seu CRM continua sendo a fonte de verdade do histórico do cliente.

**P2: Posso usar o IOAID sem o SHO?**
R: Tecnicamente sim, mas perde 80% do valor. O SHO é o que decide quando o agente age sozinho.

**P3: Como começo?**
R: Pelo [`cursos/fundamental/00-boas-vindas.md`](../../cursos/fundamental/00-boas-vindas.md) e criando 1 agente piloto com 50 contatos.

**P4: Quanto custa?**
R: Plano gratuito cobre 1 agente e 1.000 contatos. Planos pagos começam em R$ 89/mês. Detalhes em `/dashboard/billing`.

**P5: O IOAID funciona offline?**
R: Não. Depende de conexão com internet e (opcionalmente) com a federação Nexus. Mas tem cache local de 24h para contingência.

**P6: Posso usar minhas próprias LLMs (self-hosted)?**
R: Sim, em planos Enterprise. Planos padrão usam o LLM Nexus compartilhado.

**P7: O Judge Revisor é obrigatório?**
R: Em ambientes de produção, **sim**. Você pode desativar para testes, mas é fortemente desaconselhado.

**P8: Como funciona o backup?**
R: Cada execução tem log de custódia no M4 (Persistence). Você pode reproduzir qualquer decisão de até 90 dias atrás.

**P9: Posso vender skills no marketplace?**
R: A partir de Q1 2027 (Marketplace aberto). Por enquanto, apenas a equipe Nexus publica.

**P10: Como é a precificação por uso?**
R: Cobramos por token consumido + por ação executada. Tabela completa em `/dashboard/billing/usage`.

**P11: Tem API REST?**
R: Sim, documentada em `Lib-Nexus/api-docs/`. Endpoints estáveis a partir de Q3 2026.

**P12: Como integro com Hotmart/Kiwify/Eduzz?**
R: Via skill `automation-integration-bridge`. Configuração em 5 minutos.

**P13: Suporta multi-idioma?**
R: Sim. PT, EN, ES. Outras línguas sob demanda.

**P14: Como é o suporte?**
R: 3 níveis: comunidade (gratuito), ticket (R$ 89/mês), dedicated (R$ 800/mês).

**P15: O que vem depois do IOAID?**
R: A visão 2027-2028 é um "Self-Operating Network" — onde a rede Nexus se auto-otimiza sem intervenção humana em 90% dos casos.

**7. Estatísticas do evento**

- **Inscritos:** 1.247
- **Presentes (ao vivo):** 612
- **Replays (30 dias):** 1.890
- **NPS:** 78
- **Perguntas no Q&A:** 73 (respondemos as 15 mais votadas ao vivo, as demais viraram FAQ em `docs/`)
- **Slides baixados:** 891
- **Código de demo forkado:** 234
- **Conversões para plano pago após o evento:** 89

**8. Materiais complementares**

- **Slides:** [`AcademIA/webinars/slides/WB-2026-01.pdf`](slides/WB-2026-01.pdf) *(em produção)*
- **Código de demo:** [`examples/primeiro-agente-demo/`](../../../examples/primeiro-agente-demo/)
- **Gravação:** [link do vídeo]
- **Apostila relacionada:** [`AcademIA/apostilas/01-apresentacao-infraestrutura.md`](../apostilas/01-apresentacao-infraestrutura.md)
- **Playbook relacionado:** [`AcademIA/playbooks/PB-LANCAMENTO-lancamento-7-dias.md`](../../playbooks/PB-LANCAMENTO-lancamento-7-dias.md)

**9. Próximos passos**

Para o afiliado que assistiu:

1. **[Ação Imediata — 5 min]**: Acesse `/dashboard/agents/new` e crie seu primeiro agente piloto.
2. **[Curto Prazo — 7 dias]**: Configure as 3 skills básicas (copy, segmenter, judge).
3. **[Médio Prazo — 30 dias]**: Atinja 1.000 contatos e 2 disparos/dia.
4. **[Longo Prazo — 90 dias]**: Avalie federação (se tiver mais de 1 afiliado na equipe).

**10. Apêndice: glossário técnico**

- **IOAID** — Infraestrutura Operacional de Inteligência Distribuída.
- **SHO** — Self-Healing Orchestrator.
- **Judge** — LLM revisor de saídas.
- **Sandbox** — Ambiente isolado de execução.
- **Skill** — Unidade mínima de capacidade.
- **mTLS** — Mutual TLS (autenticação bidirecional).
- **Replay** — Reprodução de execução a partir de log.
- **Log de custódia** — Registro imutável para compliance.
- **Shadow testing** — Teste paralelo em produção.
- **SLA** — Service Level Agreement (compromisso de latência).
- **CAC** — Custo de Aquisição de Cliente.
- **LTV** — Lifetime Value.
- **NPS** — Net Promoter Score.
- **Q&A** — Questions and Answers.

---

**WB-2026-01 · Lançamento do IOAID** --- Versão Apostila Expandida

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
