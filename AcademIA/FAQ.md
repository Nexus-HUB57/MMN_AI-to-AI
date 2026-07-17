---
title: "FAQ · AcademIA"
description: "Perguntas frequentes sobre a AcademIA, cursos, certificações e jornada do afiliado"
tags: [faq, help, duvidas, onboarding, academia]
last_updated: 2026-06-28
---

# ❓ FAQ · AcademIA

> **Documento vivo.** Atualizado sempre que surge dúvida recorrente.
> Última atualização: 2026-06-28

---

## 🚀 Onboarding

### P1. Sou novo na rede. Por onde começo?

**R.** Comece pelo [`INDEX.md`](INDEX.md) e leia o [`RESUMO_EXECUTIVO.md`](RESUMO_EXECUTIVO.md).
Em seguida, faça o curso [`cursos/fundamental/00-boas-vindas.md`](cursos/fundamental/00-boas-vindas.md)
(15 min) e os tutoriais `tutoriais/01-ativar-2fa.md` a `07-convidar-afiliado-rede.md`.

**Sequência recomendada para o primeiro dia** (2-3h):
1. `fundamental/00-boas-vindas.md`
2. `tutoriais/01-ativar-2fa.md`
3. `tutoriais/02-configurar-dispatcher.md`
4. `tutoriais/03-ler-relatorio-autonomia.md`
5. `fundamental/03-painel-afiliado.md`

### P2. Quanto tempo leva para completar toda a trilha?

**R.** Depende do nível e da dedicação:
- **Fundamental (4 cursos)**: 2-3 horas · 1 semana casual
- **Agente (4 cursos)**: 4-6 horas · 2 semanas
- **Master (4 cursos)**: 6-10 horas · 4 semanas
- **Elite (3 cursos)**: 8-12 horas · 6 semanas
- **Total**: ~25-35 horas de estudo

### P3. Os cursos têm certificado?

**R.** Sim! As 3 certificações oficiais (CON, CEN, CEN+) emitem certificado
mediante aprovação. Veja [`certificacoes/`](certificacoes/) e o
[`00-modelo-avaliacao.md`](certificacoes/00-modelo-avaliacao.md).

### P4. Os cursos são gratuitos?

**R.** Sim, todos os materiais da AcademIA são **gratuitos** para afiliados
ativos da rede MMN_AI-to-AI. O custo é seu tempo de estudo.

---

## 📚 Cursos e Trilhas

### P5. Qual a diferença entre as 4 trilhas (Fundamental, Agente, Master, Elite)?

| Trilha | Foco | Pré-requisito | Tempo |
|---|---|---|---|
| **Fundamental** | Conhecer o ecossistema | nenhum | 1-2 semanas |
| **Agente** | Operar e configurar agentes | Fundamental | 2-4 semanas |
| **Master** | Dominar runtime, otimizar | Agente | 4-8 semanas |
| **Elite** | Top 10% — operação avançada | Master | 8-12 semanas |

### P6. Posso pular trilhas?

**R.** **Não recomendado.** Cada trilha assume conhecimento da anterior.
Tentar pular leva a dúvidas e bloqueios. Se você já tem experiência
prévia, comece pelo primeiro curso da trilha e use Ctrl+F para revisar
o que já sabe.

### P7. Em qual ordem devo fazer os cursos da mesma trilha?

**R.** Ordem numérica (00 → 03). Os cursos foram desenhados em
sequência pedagógica, com pré-requisitos explícitos no frontmatter.

### P8. Os cursos têm exercícios práticos?

**R.** Sim. A maioria tem **"Exercício Prático"** ou **"Critérios de
Sucesso"** no final. Recomendamos fortemente fazer hands-on, não
apenas ler. Hands-on vale 40% da nota em certificação.

---

## 🎓 Certificações

### P9. Como funciona a certificação CON (Operador Nexus)?

**R.** A certificação tem 3 componentes:
1. **Prova teórica** (40%): 50 questões, 90 min, nota mínima 70%
2. **Hands-on** (40%): relatório técnico de 30+ dias de operação real
3. **Mentoria + Q&A** (20%): sessão ao vivo de 60 min

Detalhes em [`certificacoes/00-modelo-avaliacao.md`](certificacoes/00-modelo-avaliacao.md).

### P10. Qual a diferença entre CON, CEN e CEN+?

| Certificação | Nível | Pré-requisito | Foco |
|---|---|---|---|
| **CON** (Operador) | Operacional | nenhum | Operar o sistema |
| **CEN** (Estrategista) | Estratégico | CON | Otimizar e criar estratégias |
| **CEN+** (Elite) | Avançado | CEN | Federação e white-label |

### P11. Posso fazer a prova teórica online?

**R.** Sim, 100% online. Cronometrada, multi-dispositivo, com
monitoramento de tela. 2 tentativas permitidas (intervalo de 30 dias).

### P12. Quanto custa a certificação?

**R.** Está inclusa no programa de afiliados. Não há custo adicional,
apenas seu tempo de estudo + custo de operação real para o hands-on.

### P13. Tem banco de questões para estudar?

**R.** Sim! [`certificacoes/banco-questoes-con.md`](certificacoes/banco-questoes-con.md)
tem 50 questões oficiais da CON com gabarito comentado. Para CEN e CEN+,
estão em produção.

---

## 🤖 Skills e Ferramentas

### P14. O que é uma "Skill"?

**R.** Uma Skill é um **módulo reutilizável** com prompt + lógica +
validação. Exemplos: `copywriter-persuasivo`, `audience-segmenter`,
`ab-test-designer`. Skills são orquestradas pelo SHO.

### P15. Onde encontro as Skills disponíveis?

**R.** Em [`Lib-Nexus/agents-specs/`](Lib-Nexus/agents-specs/) e
[`Lab-Nexus/`](Lab-Nexus/). Cada skill tem um arquivo `.md`
documentando propósito, inputs, outputs, e exemplos.

### P16. Posso criar minha própria Skill?

**R.** Sim, mas precisa ser aprovada. Skills oficiais são versionadas
em [`AcademIA/sync/skill-manifest.json`](sync/skill-manifest.json).
Para propor uma nova Skill, abra uma issue com exemplo de uso.

### P17. O que é o Judge Revisor?

**R.** É o módulo que **avalia saídas dos agentes antes de ir para
produção**. Usa um LLM (geralmente gpt-4o ou claude-opus) para
ranquear copies, respostas, planos, etc., atribuindo score de 0-10.
Threshold padrão: 7/10 para aprovação.

---

## 🔄 Operação Diária

### P18. Qual a rotina diária de um afiliado?

**R.** Para WhatsApp, 30 min/dia:
- Manhã: verificar delivery 24h > 95% e block rate < 1%
- Tarde: revisar métricas de campanhas ativas
- Noite: planejar campanhas do dia seguinte

Detalhes em [`playbooks/PB-WHATSAPP-operacao-diaria.md`](playbooks/PB-WHATSAPP-operacao-diaria.md).

### P19. Como sei se minha campanha está saudável?

**R.** Métricas saudáveis:
- **CTR** > 5% (WhatsApp)
- **Reply rate** > 2% (cold outreach)
- **Block rate** < 1%
- **Opt-in rate** > 80%
- **Conversão** > 1%

### P20. O que fazer se minha conta WhatsApp for banida?

**R.** Siga o [`playbooks/PB-CRISES-gestao-crise-ban-whatsapp.md`](playbooks/PB-CRISES-gestao-crise-ban-whatsapp.md).
Ação Imediata: parar todas campanhas, remover templates ativos, abrir
chamado de appeal no Meta.

---

## 🔒 LGPD e Compliance

### P21. Como a AcademIA trata LGPD?

**R.** Em 100% conformidade. Veja [`playbooks/PB-LGPD-direitos-titular.md`](playbooks/PB-LGPD-direitos-titular.md)
e [`Lib-Nexus/knowledge-base/03-conformidade-lgpd.md`](Lib-Nexus/knowledge-base/03-conformidade-lgpd.md).

### P22. Quanto tempo tenho para responder a um pedido de exclusão?

**R.** **15 dias** segundo a LGPD. Templates e procedimentos em
[`playbooks/PB-LGPD-direitos-titular.md`](playbooks/PB-LGPD-direitos-titular.md).

### P23. Onde encontro a base legal para tratar dados?

**R.** Em [`playbooks/PB-LGPD-direitos-titular.md`](playbooks/PB-LGPD-direitos-titular.md),
seção "Hipóteses de tratamento".

---

## 🛠️ Técnicos e Desenvolvimento

### P24. Como integro com a API Nexus?

**R.** Documentação em [`Lib-Nexus/api-docs/`](Lib-Nexus/api-docs/).
Para webhooks, [`Lib-Nexus/api-docs/01-webhooks.md`](Lib-Nexus/api-docs/01-webhooks.md).

### P25. O que é o SHO (Super Hybrid Orchestrator)?

**R.** É o **runtime** que orquestra agentes, skills e Judge em fluxos
autônomos. Aprenda no [`cursos/fundamental/02-sistema-sho.md`](cursos/fundamental/02-sistema-sho.md)
e no [`webinars/WB-2026-02-sho-em-producao.md`](webinars/WB-2026-02-sho-em-producao.md).

### P26. Como configurar multi-tenant?

**R.** Tutorial [`tutoriais/11-instancia-multitenant.md`](tutoriais/11-instancia-multitenant.md)
+ curso [`cursos/elite/01-multi-tenant-whitelabel.md`](cursos/elite/01-multi-tenant-whitelabel.md).

### P27. Como funciona a federação de agentes?

**R.** Tutoriais [`12-federação-2-nos.md`](tutoriais/12-federação-2-nos.md)
e [`13-federação-3-nos-mtls-pinned.md`](tutoriais/13-federação-3-nos-mtls-pinned.md) +
curso [`cursos/elite/02-federacao-agentes.md`](cursos/elite/02-federacao-agentes.md).

---

## 🆘 Problemas e Suporte

### P28. Estou travado em um curso, o que faço?

**R.** Opções:
1. Releia o tutorial pré-requisito
2. Procure no FAQ
3. Abra issue no GitHub do repositório
4. Agende mentoria 1:1 (próximo webinar)

### P29. Como reporto um erro no material?

**R.** Abra uma issue no repositório com:
- Arquivo afetado
- Linha ou trecho
- Sugestão de correção
- Contexto (curso, trilha, exercício)

### P30. Onde está o roadmap futuro da AcademIA?

**R.** [`ANALISE_TECNICA_E_ROADMAP.md`](ANALISE_TECNICA_E_ROADMAP.md) — atualizado em 2026-06-28
com 4 sprints de 90 dias.

---

## 📞 Contato

- **Issues no GitHub**: para bugs e sugestões
- **Webinars ao vivo**: anúncios no painel
- **Mentoria 1:1**: através do programa Elite
- **Slack/Discord**: convite após conclusão da trilha Agente

---

**Mantenedor:** Equipe Nexus
**Próxima atualização:** sob demanda (issue-driven)
