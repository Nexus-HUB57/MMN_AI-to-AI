---
title: "Roteiro · 00 Primeiro Agente"
lesson_id: "agent-00"
track: "agente"
personas: ["Ive Nexus", "Nexus Alencar"]
duration_target: "12-15 min"
source_md: "AcademIA/cursos/agente/00-primeiro-agente.md"
last_updated: 2026-06-24
status: ready_for_recording
---

# 🎬 Roteiro · 00 Primeiro Agente

## Objetivo da aula
Levar o aluno do conceito de "agente" até a criação do primeiro agente real na plataforma, com skills, autonomia e primeiro ciclo executado.

## Resultado esperado
- entender o que é um agente no Nexus
- criar 1 agente com 4 skills base
- rodar 1 ciclo controlado com 30 a 50 contatos
- ler o resultado básico de autoaprovação, fila e Judge

## Estrutura de gravação

### Bloco 1 — Abertura e visão
**Persona principal:** Ive Nexus · **Duração:** 60s
> "Você passou pela base. Agora você entra na camada onde a operação realmente acontece. Aqui você deixa de apenas usar o painel e começa a operar com um agente trabalhando junto com você."

### Bloco 2 — O que é um agente no Nexus
**Persona principal:** Nexus Alencar · **Duração:** 2min
Definição: persona + bundle de skills + autonomia configurada.
Diferença entre script tradicional e agente: agente decide ordem das skills com base no contexto.
**Visual:** card com 4 elementos: objetivo · skills · autonomia · identidade.

### Bloco 3 — Setup do primeiro agente
**Persona principal:** Nexus Alencar · **Duração:** 4min
Passo a passo:
1. Admin Runtime → Criar Agente
2. Nome, objetivo, avatar
3. Selecionar skills: audience-segmenter, copywriter-persuasivo, judge-revisor, auto-publisher
4. Definir autonomia inicial conservadora (autoApprove true, riskLimit R$ 50, confidence 0.75, dispatcher whatsapp)
5. Ativar

### Bloco 4 — Primeiro ciclo controlado
**Persona principal:** Nexus Alencar · **Duração:** 3min
Executar 1 batch de 30 a 50 contatos.
Acompanhar fila de aprovação em tempo real.
Aprovar ou rejeitar manualmente.
Ler relatório 1h depois.

### Bloco 5 — Leitura inicial de métricas
**Persona principal:** Nexus Alencar · **Duração:** 2min
Metas iniciais:
- autoaprovação > 75%
- reprovação Judge < 10%
- latência < 2s

### Bloco 6 — Tradução estratégica e CTA
**Persona principal:** Ive Nexus · **Duração:** 90s
> "Esse não é só seu primeiro agente. Esse é o primeiro reflexo da sua operação automatizada. A partir daqui, sua escala deixa de depender só da sua energia humana e passa a depender de processo e governança."

## Materiais de apoio
- PDF: "Checklist Primeiro Agente"
- diagrama Agente x Script
- planilha simples de leitura de métricas iniciais

## Corte curto recomendado
"Como configurar o primeiro agente Nexus em 5 minutos"

## CTA final
👉 Próxima aula: `01-skills-essenciais.md`

---
**Status:** pronto para gravação
