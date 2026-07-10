# Onda 39 · Lib Nexus + Lab Nexus v2 · 2026-07-10

## Contexto
Apos restauracao do main (backup em backup/main-ce3d0924-1783712824), retomamos o desenvolvimento das paginas Lib Nexus e Lab Nexus com UX completa.

## Entregas

### frontend/src/pages/LibNexus.tsx (v2, 564 linhas)
- Query real `academiaPublic.listPublished(sectionSlug=lib)` retornando 46 documentos
- 4 categorias curadas: agents-specs, api-docs, best-practices, knowledge-base
- Classificacao automatica por keywords (lesson_id/title/tags)
- Filtros: busca full-text + multi-select por categoria + only-featured
- Acoes rapidas por card: Abrir viewer, HTML, PDF, Copiar Markdown
- Persistencia localStorage: favoritos + recentes (top 8)
- Link direto para viewer `/academia/ead/lib/:lessonId`
- Secoes: Recentes + Favoritos (renderizadas quando ha dados)

### frontend/src/pages/LabNexus.tsx (v2, 614 linhas)
- Query real `academiaPublic.listPublished(sectionSlug=lab)` retornando 74 labs
- 6 categorias: copywriting, analise, estrategia, governanca, integracao, prompt
- CTA destacado para Lab Chatbot no topo
- Botao "Testar no chat" em cada card (passa prompt via querystring)
- Restante das features iguais ao Lib

## Rotas HTTP 200
- /academia/lib-nexus
- /academia/lab-nexus
- /academia/lab-nexus/chatbot
- /academia/ead/lib/:lessonId (via AcademiaLesson.tsx existente)
- /academia/ead/lab/:lessonId

## Deploy
- Bundle: index-CAG5VMkh.js (1.95 MB)
- Nginx reloaded, PM2 estavel

## Fonte de dados
- academia_lessons section_slug=lib: 46 published / 6 featured
- academia_lessons section_slug=lab: 74 published / 6 featured

## Backup pre-restauracao (Onda anterior)
- Branch: backup/main-ce3d0924-1783712824
- Tag:    backup/main-ce3d0924-1783712824
