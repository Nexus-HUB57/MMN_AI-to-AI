---
title: "README · Produção de Vídeo Aulas"
description: "Plano editorial e técnico para produção das vídeo aulas da Academ'IA com Ive Nexus e Nexus Alencar"
tags: [producao, video-aulas, academia, roteiro, materiais]
version: 1.0.0
last_updated: 2026-06-24
status: active
---

# 🎬 Produção de Vídeo Aulas · Academ'IA

Este diretório organiza a camada de produção audiovisual da Academ'IA.

## Objetivo

Padronizar a criação de:

- roteiros-mestre
- materiais de apoio para PDF
- instruções de gravação
- versões para cortes curtos
- sequência editorial por trilha

## Formato padrão por aula

Cada aula deve gerar 4 entregáveis:

1. **Roteiro-mestre** em Markdown
2. **Apostila base** derivada do conteúdo do curso
3. **Versão gravação** com falas por persona
4. **Cortes curtos** de 30–90 segundos para ativação interna

## Dupla editorial

- **Ive Nexus** → abertura, visão estratégica, conexão com resultado, CTA
- **Nexus Alencar** → didática operacional, passo a passo, explicação técnica

## Pipeline recomendado

### Etapa 1 — Base
- usar o `.md` canônico da aula existente em `AcademIA/cursos/`, `treinamentos/` ou `webinars/`
- extrair objetivo, promessa, checklist e próximos passos

### Etapa 2 — Roteiro
- converter a aula em blocos falados
- dividir falas entre Ive Nexus e Nexus Alencar
- marcar recursos visuais, tela, callouts e CTAs

### Etapa 3 — Material
- transformar o mesmo conteúdo em PDF de apoio
- manter consistência com a aula e com a interface do produto

### Etapa 4 — Publicação
- cadastrar `videoUrl` e `pdfUrl` no painel AdminAcademia
- validar viewer e player em `/academia/ead/:slug/:lessonId`

## Matriz editorial inicial priorizada

| Trilha | Aula | Status editorial | Persona principal |
|---|---|---|---|
| Fundamental | 00 · Boas-vindas ao Nexus | roteiro criado | Ive Nexus |
| Fundamental | 01 · Entendendo o IOAID | roteiro criado | Ive Nexus + Alencar |
| Fundamental | 02 · Sistema SHO | roteiro criado | Nexus Alencar |
| Fundamental | 03 · Painel do Afiliado | roteiro criado | Nexus Alencar |
| Agente | 00 · Primeiro Agente | próximo lote | Alencar |
| Agente | 01 · Skills Essenciais | próximo lote | Alencar |
| Agente | 02 · Disparo WhatsApp | próximo lote | Alencar + Ive |
| Agente | 03 · Judge Revisor | próximo lote | Alencar |

## Checklist de QA antes da publicação

- [ ] objetivo da aula está claro nos primeiros 40s
- [ ] há alternância funcional entre as duas personas
- [ ] o CTA final aponta para a próxima lição correta
- [ ] o material PDF corresponde ao conteúdo falado
- [ ] a nomenclatura do arquivo e a lição do catálogo batem
- [ ] `videoUrl` e `pdfUrl` foram cadastrados em AdminAcademia

## Estrutura desta pasta

- `fundamental/` → roteiros do Nível Fundamental
- próximos lotes sugeridos: `agente/`, `master/`, `elite/`, `workshops/`, `webinars/`

---

**Versão 1.0.0** · Atualizado 2026-06-24 · Equipe Academ'IA
