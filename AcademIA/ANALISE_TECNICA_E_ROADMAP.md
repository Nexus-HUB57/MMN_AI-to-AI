---
title: "Análise Técnica e Roadmap · AcademIA v1.2 → v2.0"
description: "Auditoria completa do estado da AcademIA, gaps identificados e plano de evolução"
tags: [analise, roadmap, auditoria, plano, academia, prioridades]
last_updated: 2026-06-28
---

# 📊 Análise Técnica e Roadmap · AcademIA

> **Versão do documento:** 1.0 · **Data:** 2026-06-28
> **Escopo:** Auditoria completa de 100+ arquivos da AcademIA v1.2 + roadmap de evolução para v2.0

---

## 🎯 Sumário Executivo

A AcademIA é a **espinha dorsal educacional** do ecossistema MMN_AI-to-AI.
Em 2026, ela precisa evoluir de "coleção de documentos" para "plataforma
de aprendizado com 3 públicos distintos". Este documento apresenta a
auditoria técnica atual e o roadmap de 90 dias.

**TL;DR**:
- ✅ 100+ arquivos educacionais funcionais
- ⚠️ 7 gaps críticos identificados
- ⚠️ 12 melhorias de alta prioridade
- 🚀 Roadmap: 4 sprints de 3 semanas cada

---

## 1. Auditoria do Estado Atual

### 1.1 Inventário Completo

| Categoria | Quantidade | Localização | Status |
|---|---|---|---|
| **Cursos** | 15 principais + 11 variantes (roteiro/slides) | `cursos/{fundamental,agente,master,elite}/` | ✅ Funcionais |
| **Treinamentos (WS)** | 5 (WS-01 a WS-05) | `treinamentos/WS-*.md` | ✅ Funcionais |
| **Webinars (WB)** | 5 (WB-01 a WB-05) | `webinars/WB-*.md` | ⚠️ 3 são roteiros, 2 são docs |
| **Playbooks (PB)** | 7 (3 crises + 4 ops) | `playbooks/PB-*.md` | ✅ Funcionais |
| **Tutoriais** | 14 numerados (01-14) | `tutoriais/0*.md` | ⚠️ Falta 15+ |
| **Certificações** | 3 (CON, CEN, CEN+) + modelo | `certificacoes/` | ⚠️ Falta banco de questões |
| **Apostilas** | 10 (01-10) | `apostilas/` | ✅ Funcionais |
| **Lab-Nexus** | 55+ tools/prompts/templates | `Lab-Nexus/` | ✅ Funcionais |
| **Lib-Nexus** | 15+ docs de referência | `Lib-Nexus/` | ✅ Funcionais |
| **HTML gerado** | 37 páginas | `html/` | ⚠️ Não indexado no INDEX.md |

### 1.2 Trilha Pedagógica Atual

```
🌱 FUNDAMENTAL (4 cursos + 11 apostilas)
   ├─ 00 Boas-vindas
   ├─ 01 Entendendo o IOAID
   ├─ 02 Sistema SHO
   └─ 03 Painel do Afiliado

🤖 AGENTE (4 cursos)
   ├─ 00 Primeiro Agente
   ├─ 01 Skills Essenciais
   ├─ 02 Disparo WhatsApp
   └─ 03 Judge Revisor

🥇 MASTER (4 cursos)
   ├─ 00 Otimização de Conversão
   ├─ 01 Funis e Lifecycle
   ├─ 02 A/B Testing com Judge
   └─ 03 Análise de Coortes

💎 ELITE (3 cursos)
   ├─ 00 Blueprints Elite
   ├─ 01 Multi-tenant e White-label
   └─ 02 Federação de Agentes
```

**Avaliação**: trilha bem desenhada, mas com **gaps em produção**:
- Pouca cobertura de **RAG, LLM, segurança, deploy**
- Tutoriais chegam só até #14 (espaço para 15-30)
- Banco de questões para certificação **inexistente**

### 1.3 Estatísticas de Conteúdo

```
Total de arquivos .md:    100+
Total de linhas:          ~15.000
Cursos roteirizados:      7 (com -roteiro.md)
Cursos com slides:        5 (com -slides.md)
Apostilas estruturadas:   10
Playbooks de crise:       3
Playbooks operacionais:   4
```

---

## 2. Gaps Identificados

### 2.1 🔴 Críticos (bloqueiam produção)

#### GAP-01: Banco de Questões para Certificação
- **Problema**: 3 certificações (CON, CEN, CEN+) existem como docs
  conceituais, mas não há **banco de questões oficial** para validar
  conhecimento. Avaliação atual é só "hands-on", sem componente teórica.
- **Impacto**: certificação sem credibilidade, impossível escalar
- **Esforço**: 3-5 dias · 50 questões × 3 certificações

#### GAP-02: Tutoriais #15+
- **Problema**: tutoriais numerados vão só até #14, mas há Skills
  modernas (RAG, LangChain, multi-agent) sem tutorial dedicado.
- **Impacto**: afiliados não conseguem implementar features novas
- **Esforço**: 1 dia por tutorial · mínimo 6 tutoriais novos

#### GAP-03: Cursos de RAG / LLM / Segurança
- **Problema**: zero cursos sobre RAG, deploy de modelos, segurança
  de IA — os temas mais procurados de 2026. Trilha Master termina em
  "análise de coortes" sem cobertura técnica avançada.
- **Impacto**: AcademIA fica atrás de concorrentes
- **Esforço**: 5-7 dias por curso · mínimo 3 cursos novos

#### GAP-04: Materiais em Vídeo
- **Problema**: 100% dos materiais são texto. Em 2026, 70% do
  aprendizado online é em vídeo. Faltam roteiros de gravação,
  gravações, e estrutura para videoaulas.
- **Impacto**: baixa adoção, baixa retenção
- **Esforço**: 1 dia roteiro + 1 dia gravação por curso

#### GAP-05: Página de Apresentação da AcademIA
- **Problema**: existe `html/` com 37 páginas geradas, mas não há
  landing page pública que apresente a AcademIA, com busca, índice
  visual, e "comece por aqui".
- **Impacto**: novos afiliados não sabem por onde começar
- **Esforço**: 3-4 dias

#### GAP-06: Inconsistência entre Cursos Originais e Versões "Roteiradas"
- **Problema**: existem 7 cursos com versão `-roteiro.md` e 5 com
  `-slides.md` geradas, mas a relação com a versão principal não
  está documentada. Usuário não sabe qual ler primeiro.
- **Impacto**: confusão, duplicação
- **Esforço**: 1 dia · documentar e padronizar

#### GAP-07: Ausência de Trilha "Técnica" vs "Comercial"
- **Problema**: trilha única assume que o afiliado é **operador**,
  mas há dois públicos: (a) **produto/técnico** (quer construir features
  novas) e (b) **comercial** (quer usar features para vender mais).
- **Impacto**: conteúdo muito denso para uns, raso para outros
- **Esforço**: 5-7 dias para criar trilha paralela

### 2.2 🟡 Alta Prioridade (degrada experiência)

#### GAP-08: Roteiros de Webinars 04+
- **Problema**: 5 webinars existem (WB-01 a WB-05), mas 04 e 05 são
  docs descritivos, sem roteiro de gravação detalhado.
- **Esforço**: 1 dia por webinar

#### GAP-09: Simulados / Provas de Certificação
- **Problema**: tem banco de questões conceitual (CON), mas falta
  simulado prático (com nota, tempo, gabarito).
- **Esforço**: 3-4 dias

#### GAP-10: Playbooks de Negócio
- **Problema**: tem 4 playbooks operacionais (WhatsApp, Email, Lançamento,
  LGPD), mas faltam playbooks de **monetização**, **escala**, **vendas**,
  e **retenção de clientes**.
- **Esforço**: 1-2 dias por playbook

#### GAP-11: Cobertura Insuficiente de RAG / LLMs
- **Problema**: tutorial #16 (pipeline RAG) é superficial. Falta
  cobertura de hybrid search, reranking, RAGAS, advanced patterns.
- **Esforço**: 2-3 dias

#### GAP-12: Falta de Lab Prático "Hands-On"
- **Problema**: cursos e tutoriais são majoritariamente textuais.
  Falta ambiente de prática (sandbox) com outputs esperados.
- **Esforço**: 5-7 dias para setup + 4 labs

#### GAP-13: Métricas de Aprendizado
- **Problema**: não há como medir se o afiliado realmente aprendeu.
  Falta dashboard de progresso, KPIs de conclusão, NPS por curso.
- **Esforço**: 4-5 dias

### 2.3 🟢 Melhorias (nice to have)

- **GAP-14**: Internacionalização (inglês + espanhol) dos cursos principais
- **GAP-15**: Versão mobile-friendly (atualmente markdown é desktop)
- **GAP-16**: Sistema de comentários / Q&A por curso
- **GAP-17**: Gamificação (badges, XP, leaderboard)
- **GAP-18**: Integração com LMS externo (Moodle, Canvas)
- **GAP-19**: Versão PDF de cada curso (atualmente só MD)
- **GAP-20**: AI Tutor para tirar dúvidas em tempo real

---

## 3. Roadmap 90 dias (4 sprints de 3 semanas)

### Sprint 1 (Semanas 1-3): Fundação Técnica 🔴
**Objetivo:** fechar gaps críticos de produção

| Semana | Entregas | Esforço |
|---|---|---|
| 1 | GAP-02: 6 tutoriais novos (RAG, Whisper, API, fine-tune, deploy) | 6 dias |
| 2 | GAP-03: 3 cursos novos (RAG, Deploy, Segurança) | 6 dias |
| 3 | GAP-01: 3 bancos de questões (CON, CEN, CEN+) | 5 dias |

**Sprint Review**: AcademIA cobre os temas técnicos críticos de 2026.

### Sprint 2 (Semanas 4-6): Experiência de Aprendizado 🟡
**Objetivo:** melhorar a jornada do aluno

| Semana | Entregas | Esforço |
|---|---|---|
| 4 | GAP-04: roteiros de vídeo para 8 cursos prioritários | 6 dias |
| 5 | GAP-05: landing page + busca visual | 5 dias |
| 6 | GAP-09: simulados interativos para 3 certificações | 5 dias |

**Sprint Review**: aluno consegue estudar, praticar e ser avaliado.

### Sprint 3 (Semanas 7-9): Duplicação de Trilhas 🟡
**Objetivo:** separar trilhas técnica e comercial

| Semana | Entregas | Esforço |
|---|---|---|
| 7 | GAP-07: definir arquitetura de trilhas paralelas | 2 dias |
| 8 | Criar trilha "Comercial Master" (4 cursos) | 6 dias |
| 9 | Migrar/apontar trilhas no INDEX.md | 3 dias |

**Sprint Review**: AcademIA tem 2 trilhas (Técnica + Comercial) claras.

### Sprint 4 (Semanas 10-12): Escala e Operacionalização 🟢
**Objetivo:** medir, otimizar, internacionalizar

| Semana | Entregas | Esforço |
|---|---|---|
| 10 | GAP-13: dashboard de progresso do aluno | 5 dias |
| 11 | GAP-08: roteiros de webinars 04 e 05 | 3 dias |
| 12 | GAP-06, GAP-10, GAP-11: finalizações e padronização | 5 dias |

**Sprint Review**: AcademIA v2.0 com 30+ cursos, 3 trilhas, 50+ tutoriais,
dashboard de progresso, e gravações de vídeo.

---

## 4. Métricas de Sucesso (KPIs)

### 4.1 Métricas de Conteúdo

| KPI | Baseline (v1.2) | Meta v2.0 |
|---|---|---|
| Total de cursos | 15 | 30+ |
| Total de tutoriais | 14 | 30+ |
| Total de horas de conteúdo | ~50h | 120h+ |
| Cursos com vídeo | 0 | 8+ |
| Bancos de questões | 0 | 3 |
| Trilhas paralelas | 1 | 2-3 |

### 4.2 Métricas de Adoção

| KPI | Baseline | Meta 90d |
|---|---|---|
| Novos afiliados/semana | ? | +50% |
| Taxa de conclusão trilha | ? | 40%+ |
| NPS por curso | ? | 8+ |
| Tempo médio para certificação | ? | < 60 dias |

### 4.3 Métricas de Negócio

| KPI | Baseline | Meta 90d |
|---|---|---|
| Receita/mês afiliados certificados | ? | 2x |
| Churn de afiliados | ? | -30% |
| LTV afiliado | ? | +40% |

---

## 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Sobrecarga de conteúdo | Média | Médio | Roadmap priorizado por valor |
| Baixa adoção | Média | Alto | Pesquisa com afiliados + MVP antes de escalar |
| Conteúdo desatualizado | Alta | Médio | Revisão trimestral de cada curso |
| Equipe pequena para 4 sprints | Alta | Alto | Contratar 1-2 freelancers, automatizar QA |
| Conflito com Lab-Nexus (escopo) | Baixa | Médio | Definir ownership claro: cursos = AcademIA, tools = Lab-Nexus |

---

## 6. Dependências Externas

- **Equipe técnica** (1-2 FTEs): para gravar vídeos e revisar código
- **Verba de gravação** (US$ 500-2000): microfones, luz, edição
- **Plataforma de vídeo** (US$ 50-200/mês): Mux, Cloudflare Stream, ou
  YouTube (gratuito)
- **LMS** (opcional, US$ 200-500/mês): Teachable, Hotmart, ou self-hosted

---

## 7. Quick Wins (para fazer HOJE)

Ações de 1-2 horas cada, alto impacto:

1. ✅ Adicionar `banco-questoes-con.md` com 30 questões (já feito)
2. ✅ Criar 1 tutorial de RAG end-to-end (já feito - TUT-MA-02)
3. ⬜ Criar `Glossário AcadIA` em `Lib-Nexus/knowledge-base/00-glossario.md`
   - Atualizar com 50+ termos novos
4. ⬜ Criar `CHANGELOG v1.3` documentando adições recentes
5. ⬜ Atualizar `INDEX.md` com link para landing page
6. ⬜ Criar `FAQ.md` central em `AcademIA/`
7. ⬜ Adicionar badge "Atualizado 2026" em todos cursos vigentes
8. ⬜ Criar template de "Card de Curso" para uso em marketing

---

## 8. Próximos Passos Imediatos

### Esta semana
1. [ ] Validar este roadmap com stakeholders
2. [ ] Priorizar 5 quick wins para executar HOJE
3. [ ] Definir owner de cada sprint
4. [ ] Criar epics + tickets no projeto

### Próxima semana
1. [ ] Iniciar Sprint 1: tutoriais #15-20
2. [ ] Draft do curso "RAG em Produção" (4-6h de leitura)
3. [ ] Banco de questões CON com 50 itens

### Próximas 2 semanas
1. [ ] Curso "Deploy em Produção"
2. [ ] Curso "Segurança em IA"
3. [ ] Roteiros de vídeo para 3 cursos prioritários

---

## 9. Conclusão

A AcademIA tem uma **base sólida** (100+ arquivos, 4 trilhas, 3
certificações) mas precisa de **esforço coordenado** para chegar ao
nível de uma plataforma educacional de classe mundial. Os 4 sprints
propostos atacam os gaps mais críticos em 90 dias, com entregas
mensuráveis e KPIs claros.

**Recomendação**: priorizar Sprint 1 (fundação técnica). Sem cobrir
RAG/LLM/segurança, a AcademIA perde relevância em 2026.

---

**Mantenedor:** Equipe Nexus · **Próxima revisão:** 2026-07-15
**Aprovação:** pendente C-level Nexus

---

### Anexo A: Estrutura de Arquivos Recomendada (v2.0)

```
AcademIA/
├── INDEX.md                          # índice principal
├── ANALISE_TECNICA_E_ROADMAP.md      # este documento
├── README.md                         # overview
├── CHANGELOG.md                      # histórico
├── FAQ.md                            # 🆕
│
├── trilhas/                          # 🆕 arquitetura por trilha
│   ├── tecnica/
│   ├── comercial/
│   └── elite/
│
├── cursos/                           # cursos por trilha
│   ├── fundamental/
│   ├── agente/
│   ├── master/
│   └── elite/
│
├── treinamentos/                     # workshops
├── webinars/                         # gravações + roteiros
├── playbooks/                        # procedimentos
├── tutoriais/                        # 01-30+
│
├── certificacoes/                    # CON, CEN, CEN+
│   ├── banco-questoes/              # 🆕
│   ├── simulados/                   # 🆕
│   └── certificados/                # 🆕 templates PDF
│
├── apostilas/                        # 10+ apostilas
│
├── videos/                           # 🆕 gravações
│   ├── cursos/
│   ├── treinamentos/
│   └── webinars/
│
├── landing/                          # 🆕 página pública
│
├── dashboards/                       # 🆕 métricas de aprendizado
│
├── Lab-Nexus/                        # tools, prompts, templates
└── Lib-Nexus/                        # referência técnica
```

### Anexo B: Trilha Técnica vs Comercial (proposta)

| Trilha Comercial | Trilha Técnica |
|---|---|
| `fundamental/00-03` | `fundamental/00-03` (compartilhado) |
| `agente/00-03` (uso) | `agente/04-configurando-agente` (custom) |
| `master/comercial/00-funil-completo` | `master/04-rag-producao` |
| `master/comercial/01-cliente-journey` | `master/05-deploy-producao` |
| `master/comercial/02-retencao-churn` | `master/06-seguranca-ia` |
| `elite/comercial/00-escalar-time` | `elite/03-agentes-avancados` |
| `elite/comercial/01-monetizar-skills` | `elite/04-multi-tenant-prod` |
