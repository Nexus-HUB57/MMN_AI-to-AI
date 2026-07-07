# 📚 Organização AcademIA · Guia Oficial

**Autor**: Niko Nexus (autonomous) · **Data**: 2026-07-01

## 🎯 Situação Inicial (antes)

- **/AcademIA** (273 MB): fonte da verdade, 23 subpastas, 421 arquivos
- **/scripts/academia** (24 KB): 3 scripts de sync
- **/public/academia** (68 MB): apenas conteúdo público servido

## ✅ Situação Após Organização

- **/AcademIA** = fonte da verdade única, com INDEX.md master
- **/public/academia** = espelho apenas do conteúdo publicado
- **/scripts/academia** = sync automatizado

## 📂 Estrutura Padronizada AcademIA/

| Pasta | Tamanho | Papel |
|-------|---------|-------|
| `cursos/` | 16 MB | Trilhas oficiais (Fund/Agent/Master/Elite) |
| `videos/` | 33 MB | Aulas MP4 + roteiros + thumbs |
| `pdf/` | 66 MB | PDFs prontos para publicação |
| `personas/` | 138 MB | Ive, Alencar, Helena, Ravi, Otto |
| `marca/` | 17 MB | Brand kit e assets |
| `producao/` | 1.6 MB | Pipeline editorial ativo |
| `Lab-Nexus/` | 664 KB | Prompts e experimentos |
| `Lib-Nexus/` | 192 KB | Biblioteca teórica |
| `apostilas/` | 132 KB | Material didático MD |
| `webinars/` | 48 KB | Sessões ao vivo |
| `sync/` | 44 KB | Scripts de sincronização |

## 🚀 Fluxo Editorial Oficial

```
1. AUTORIA (rascunho)
   Location: AcademIA/producao/{apostilas,video-aulas,roteiros}/
   Tools: Editor markdown, template padrão

2. REVISÃO (quality gate)
   Location: AcademIA/producao/quality/
   Checklist: revisão editorial, ortografia, links, thumbnails

3. PUBLICAÇÃO (versão oficial)
   Location: AcademIA/{cursos,videos,pdf,html}/
   Nomenclatura: academia-{trilha}-{modulo}-{titulo}

4. DEPLOY (público)
   Location: /public/academia/{videos,pdf,html}/
   Script: scripts/academia/sync-published.sh

5. REGISTRO DB
   Table: academia_lessons
   Fields: lesson_id, section_slug, video_url, pdf_url, is_published
```

## 🔒 Regras de Ouro

1. **NUNCA** editar direto em `/public/academia/` — só sync
2. **SEMPRE** atualizar `academia_lessons` ao publicar novo módulo
3. **INDEX.md** deve refletir a estrutura real
4. Arquivos em `producao/` = drafts (não sincronizar)
5. Conteúdo premium (elite/master) usa `mp4-gated` no delivery_mode

## 📊 Trilhas Atuais (em produção)

- **Fund** (4 módulos): Público · YouTube-ready
- **Agent** (4 módulos): Público · YouTube-ready
- **Master** (2 módulos): Premium · MP4 gated
- **Elite** (2 módulos): Premium · MP4 gated

Total: 12 aulas ativas · 8 MP4 hospedados
