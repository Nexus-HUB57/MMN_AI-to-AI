---
title: "09 · Plano de Conteúdo 90 Dias"
description: "Planejamento trimestral de conteúdo com IA, funil integrado e revisão quinzenal"
tags: [lab-nexus, marketing, conteudo, 90-dias, trimestre, planejamento]
category: marketing
level: master
estimated_time: "60 min para setup + 15 min/semana de manutenção"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: plano-conteudo-90d
course_anchor: cursos/master/01-funis-lifecycle.md
---

# 📅 09 · Plano de Conteúdo 90 Dias

> Planejamento trimestral de conteúdo com funil integrado (topo → meio → fundo), 4 pilares, IA geradora de pauta e revisão quinzenal automatizada.

## 🎯 Spec

| Atributo | Valor |
|---|---|
| **O que é** | Planilha trimestral (13 semanas) + prompt gerador + 3 modelos de funil de conteúdo |
| **Quando usar** | Início de trimestre, ou quando o funil atual não converte |
| **Pré-requisitos** | Nível 🥇 Master; persona + ICP definidos; canais validados |
| **Tempo estimado** | 60 min setup inicial + 15 min/semana de manutenção |
| **Skill que executa** | `plano-conteudo-90d` (master) |
| **Judge que valida** | `judge-revisor` |

## 📋 Playbook — A Estrutura 90 Dias

### Por que 90 dias?

| Janela | Problema | Solução |
|---|---|---|
| 7 dias | pouco dado, viés da semana | não decidir nada |
| 30 dias | volume ok, mas sazonalidade oculta | usar para testar |
| 60 dias | primeira leitura de cohort | usar para ajustar |
| **90 dias** | **1 trimestre cheio + sazonalidade coberta** | **usar para decidir e replanejar** |

> 90 dias = 1 ciclo completo de aquisição → ativação → expansão → retenção

### Os 3 Marcos do Trimestre

| Marco | Quando | Foco |
|---|---|---|
| 🧪 **M1 — Testar** | semanas 1–4 | 2 primeiras pautas de cada pilar → medir baseline: alcance, engajamento, CTR, CPL |
| 🔧 **M2 — Ajustar** | semanas 5–8 | Dobrar nos pilares que performaram, cortar os fracos → refinar persona, segmentar canais, ajustar CTAs |
| 🚀 **M3 — Escalar** | semanas 9–13 | Conteúdo validado recebe mais budget e frequência → acelerar funil, abrir novos canais, testar formatos avançados |

## 📦 Asset 1 — Planilha Trimestral (CSV)

```csv
Semana,DataInicio,Marco,Pilar,Tipo,Canal,Tema,CopyHook,CTA,KPI_Alvo,Status,Resultado_Real,Variancia
S1,2026-07-06,M1-Testar,Educar,Carrossel,IG,"5 erros silenciosos de funil","Você sabia que 80% dos funis perdem leads aqui?","Salvar o post","Alcance ≥ 5k",Rascunho,,,
S1,2026-07-06,M1-Testar,Vender,Reels,IG/TikTok,"Depoimento real de cliente","3 meses atrás eu não sabia nem por onde começar","DM para diagnóstico","CTR ≥ 2%",Rascunho,,,
S2,2026-07-13,M1-Testar,Educar,Artigo,Blog,"Anatomia de um SHO bem calibrado","O Judge reprovando 20% está bom ou ruim?","Ler artigo completo","Tempo na página ≥ 90s",Rascunho,,,
S2,2026-07-13,M1-Testar,Inspirar,Story,IG,"Bastidores do nosso setup","3 prints do nosso painel de autonomia","Resposta 'Bastidores' para mais","Resposta ≥ 5%",Rascunho,,,
S3,2026-07-20,M1-Testar,Educar,Carrossel,LinkedIn,"4 métricas que todo Estrategista acompanha","CAC, LTV, payback, NPS — nessa ordem","Salvar + compartilhar","Impressões ≥ 1k",Rascunho,,,
S3,2026-07-20,M1-Testar,Vender,Email,Base,"Convite Open House + cupom","Vagas abertas para mentoria de julho","Reservar vaga","Open rate ≥ 30%",Rascunho,,,
S4,2026-07-27,M1-Testar,Inspirar,Carrossel,IG,"3 lições do nosso pior mês","Quando o funil travou em maio, aprendi isso","Salvar para reler","Salvamentos ≥ 200",Rascunho,,,
S4,2026-07-27,M1-Testar,Educar,Live,YouTube/IG,"Q&A com Estrategista","Pergunta ao vivo sobre SHO","Inscrever-se no canal","Inscrições ≥ 50",Rascunho,,,
S5,2026-08-03,M2-Ajustar,Educar,Carrossel,IG,"Por que segmentar RFM (não demográfico)","RFM mostra intenção, não perfil","Baixar planilha RFM","Downloads ≥ 100",Rascunho,,,
S5,2026-08-03,M2-Ajustar,Vender,Landing,Página,"Página do curso Elite","Para Top 10% da rede: 5 blueprints internos","Aplicar para próxima turma","Conversão ≥ 3%",Rascunho,,,
S6,2026-08-10,M2-Ajustar,Inspirar,Reels,TikTok,"Antes/depois real de um afiliado","De R$ 0 a R$ 12k em 90 dias — sem aparecer","Seguir para mais cases","Views ≥ 10k",Rascunho,,,
S6,2026-08-10,M2-Ajustar,Educar,Email,Base,"Mini-curso: SHO em 4 lições","Aula 1/4 — O que é o Judge?","Confirmar leitura","Open ≥ 35%",Rascunho,,,
S7,2026-08-17,M2-Ajustar,Vender,Carrossel,IG,"Plano 90d em 1 tela","(print da planilha)","Salvar a planilha","Salvamentos ≥ 300",Rascunho,,,
S7,2026-08-17,M2-Ajustar,Educar,Artigo,Blog,"LGPD na prática: 5 casos reais","O que fazer quando o lead pede exclusão","Ler + baixar checklist","Tempo ≥ 120s",Rascunho,,,
S8,2026-08-24,M2-Ajustar,Inspirar,Story,IG,"Poll: qual seu maior bloqueio?","Operação / Copy / Estratégia / Tempo","Votar","Votos ≥ 50",Rascunho,,,
S8,2026-08-24,M2-Ajustar,Educar,Webinar,Zoom,"Aula aberta: Federacao 3 nós","Como escalar sem perder PII","Inscrever","Inscritos ≥ 200",Rascunho,,,
S9,2026-08-31,M3-Escalar,Educar,Carrossel,LinkedIn,"5 case studies do nosso programa","(resultados de 5 afiliados)","Comentar 'cases' para PDF","Comentários ≥ 30",Rascunho,,,
S9,2026-08-31,M3-Escalar,Viver,Reels,IG,"Tour pela Academ'IA","Tour de 60 segundos pela plataforma","Salvar para usar","Salvamentos ≥ 500",Rascunho,,,
S10,2026-09-07,M3-Escalar,Educar,Email,Base,"Whitepaper SHO tuning","21 páginas com cases + calibração","Baixar whitepaper","Downloads ≥ 80",Rascunho,,,
S10,2026-09-07,M3-Escalar,Vender,Landing,Página,"Página da certificação CEN","Torne-se Estrategista certificado","Iniciar trilha","Inícios ≥ 50",Rascunho,,,
S11,2026-09-14,M3-Escalar,Inspirar,Live,YouTube,"Live com 3 Estrategistas","Painel: o que funciona em 2026","Inscrever","Inscritos ≥ 300",Rascunho,,,
S11,2026-09-14,M3-Escalar,Educar,Carrossel,IG,"Bizu do juiz: 3 sinais de descalibração","(sintomas visuais do SHO)","Salvar","Salvamentos ≥ 400",Rascunho,,,
S12,2026-09-21,M3-Escalar,Viver,Reels,IG,"Resultado do trimestre em 30s","(números reais)","Seguir","Views ≥ 20k",Rascunho,,,
S12,2026-09-21,M3-Escalar,Educar,Email,Base,"Convite para mentoria Q4","Última turma de 2026","Reservar vaga","Open ≥ 40%",Rascunho,,,
S13,2026-09-28,M3-Escalar,Inspirar,Story,IG,"Agradecimento + abertura Q4","O que vem em outubro","DM 'quero saber'","DMs ≥ 100",Rascunho,,,
S13,2026-09-28,M3-Escalar,Educar,Artigo,Blog,"Retrospectiva trimestral pública","O que funcionou e o que não","Ler","Tempo ≥ 150s",Rascunho,,,
```

## 📦 Asset 2 — Prompt Gerador de Pautas (use com a skill)

```markdown
# Prompt: gerar pauta semanal alinhada ao plano 90d

Você é um Estrategista de Conteúdo Sênior do Nexus.
Recebi o plano 90d abaixo. Gere a pauta da PRÓXIMA semana,
respeitando o Pilar e Marco designados.

## Contexto
- Persona: {ICP}
- Marca: {TOM_DE_VOZ}
- Pilar desta semana: {PILAR}
- Marco atual: {M1|M2|M3}
- Tema macro da semana: {TEMA}
- Caprichos: {EX: usar número ímpar, terminologia LGPD-safe}

## Saída esperada (Markdown)
1. **Título** (≤ 60 chars, com gancho)
2. **Hook** (1ª linha, parágrafo de abertura)
3. **Corpo** (3–5 parágrafos curtos, com 1 dado concreto)
4. **CTA** (1 linha, ação clara)
5. **Variações** (2 headlines alternativas)
6. **KPI alvo** (métrica primária)
7. **Risco** (1 linha, ex: "evitar promessas de resultado")

## Restrições
- Sem dados pessoais
- Sem promessas absolutas ("garantido", "100%")
- Marca sempre a primeira menção a "Nexus"
- LGPD-safe em qualquer menção a leads
```

## 📦 Asset 3 — Os 4 Pilares (mantenha o equilíbrio)

```
  ┌─────────────┬──────────────┬──────────────┬──────────────┐
  │  EDUCAR     │  INSPIRAR    │  VENDER      │  CONECTAR    │
  │  (40%)      │  (20%)       │  (30%)       │  (10%)       │
  ├─────────────┼──────────────┼──────────────┼──────────────┤
  │ Tutoriais   │ Bastidores   │ Landing      │ Lives        │
  │ Artigos     │ Depoimentos  │ Email venda  │ Q&A          │
  │ Carrossel   │ Antes/depois │ Página prod  │ Comunidade   │
  │ Whitepaper  │ Erros reais  │ Webinar      │ Encontros    │
  └─────────────┴──────────────┴──────────────┴──────────────┘
```

> Regra: se Educar < 30% no mês, o M2 não converte. Se Vender > 50%, o lead queima.

## 📊 Métricas de Sucesso do Trimestre

| Métrica | Baseline (M1) | Meta M2 | Meta M3 |
|---|---|---|---|
| Alcance orgânico/semana | 8k | 15k | 25k |
| Leads gerados/mês | 80 | 150 | 250 |
| CPL (Custo Por Lead) | R$ 12 | R$ 9 | R$ 6 |
| Conversão lead → cliente | 1.5% | 2.5% | 4% |
| Posts publicados/semana | 4 | 6 | 8 |
| Taxa de resposta DM/email | 8% | 12% | 18% |

## ⚠️ Riscos & Anti-patterns

- ❌ **Pular M1 e ir direto pro M3** — sem baseline, "escalar" só escala problema
- ❌ **Manter 1 pilar acima de 50%** — funil desbalanceado queima audiência
- ❌ **Não medir CPL** — sem isso, "escalar" vira queimar dinheiro
- ❌ **Replanejar todo mês** — sem consistência, o algoritmo te ignora
- ❌ **Vender sem Educar** — leva a cancelamento no M1
- ❌ **Educar sem Vender** — monta lista fria, sem receita
- ⚠️ **LGPD**: nunca usar dados reais de leads em cases sem consentimento

## 🔁 Revisão Quinzenal (Ritual)

1. Toda **2ª e 4ª sexta do mês**, 60 min
2. Olhar: posts vs meta, CPL vs meta, lead → cliente vs meta
3. Marcar com 🔴 / 🟡 / 🟢 por pilar
4. Decisão: dobrar 🔴 → continuar, 🟡 → ajustar, 🟢 → dobrar
5. Atualizar planilha e replicar para a equipe

## 🤝 Contribuição da Comunidade

| Nível | Pode contribuir com |
|---|---|
| 🥈 Operador | comentar cases de uso, revisar copy |
| 🥇 Estrategista | pautas, CTAs, métricas |
| 💎 Elite | novos pilares, frameworks de funil |

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
