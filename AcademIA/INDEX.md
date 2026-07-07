# 📚 AcademIA Nexus Affil'IA'te · INDEX Master

**Última atualização**: 2026-07-07 · Mavis + Niko Nexus (autonomous)
**Total**: ~268 MD · 93 PDF · 7 MP4 · 55 HTML (+1 apostila 13, +1 workshop WS-06, +2 templates, +2 prompts)
**Versão**: 1.2.5

## 🎯 Estrutura Oficial (Fonte da Verdade)

```
AcademIA/
├── INDEX.md              ← este arquivo (mapa completo)
├── README.md             ← overview público
├── CHANGELOG.md          ← histórico de mudanças
├── RESUMO_EXECUTIVO.md   ← visão executiva
│
├── cursos/               ← 4 trilhas oficiais (16 MB)
│   ├── fundamental/      ← Trilha F (iniciante)
│   ├── agente/           ← Trilha A (intermediário)
│   ├── master/           ← Trilha M (avançado)
│   └── elite/            ← Trilha E (expert)
│
├── videos/               ← Vídeo-aulas MP4 (33 MB)
│   ├── roteiros/         ← Scripts editoriais
│   └── thumbnails/       ← Capas dos vídeos
│
├── pdf/                  ← PDFs oficiais publicados (66 MB)
├── html/                 ← Renderizações HTML
├── apostilas/            ← Material didático extenso
├── hubs/                 ← Hubs temáticos
├── webinars/             ← Sessões ao vivo
├── tutoriais/            ← Tutoriais rápidos
├── playbooks/            ← Manuais operacionais
├── certificacoes/        ← Certificações emitidas
├── personas/             ← Ive, Alencar, Helena, Ravi, Otto (138 MB)
├── marca/                ← Brand kit (17 MB)
├── Lab-Nexus/            ← Laboratório de prompts
├── Lib-Nexus/            ← Biblioteca de referência
├── producao/             ← Pipeline de produção
│   ├── apostilas/
│   ├── apostilas-pdf/
│   ├── video-aulas/
│   ├── roteiros/
│   ├── templates/
│   ├── assets/
│   ├── catalog/
│   ├── personas/
│   ├── pipeline/
│   └── quality/
└── sync/                 ← Scripts de sincronização
```

## 🚀 Fluxo Editorial

```
1. Criar em: AcademIA/producao/ (rascunho)
2. Revisar: AcademIA/producao/quality/
3. Publicar em: AcademIA/{cursos,videos,pdf}/ (versão oficial)
4. Sincronizar: /public/academia/ (servido pelo nginx)
5. Registrar: academia_lessons (Postgres)
```

## 📖 Trilhas Ativas (validadas no DB)

| Lesson ID | Trilha | Video URL |
|-----------|--------|-----------|
| fund-00 | Fundamental | mod00-boas-vindas.mp4 |
| fund-01 | Fundamental | mod01-entendendo-ioaid.mp4 |
| fund-02 | Fundamental | mod02-sistema-sho.mp4 |
| fund-03 | Fundamental | mod03-painel-afiliado.mp4 |
| agent-00 | Agente | mod00-primeiro-agente.mp4 |
| agent-01 | Agente | mod01-skills-essenciais.mp4 |
| agent-02 | Agente | mod02-disparo-whatsapp.mp4 |
| agent-03 | Agente | mod03-judge-revisor.mp4 |

## 🎬 Vídeos Publicados

- ✅ 8 MP4 self-hosted (total 47 MB) em `/public/academia/videos/`
- ✅ Todos linkados corretamente no `academia_lessons.video_url`
- ⏳ Migração para YouTube @NexusAffilIAte-w9p pendente (público)
- ✅ Modo `mp4-gated` para trilhas premium

## 📄 PDFs Publicados

- ✅ 10 PDFs oficiais em `/public/academia/pdf/`
- Nomenclatura: `academia-curso-{trilha}-{numero}.pdf`
- Trilhas: fund (fundamental), agent (agente), master, elite

## 🔗 URLs em Produção

- Academia: https://oneverso.com.br/academia
- Lesson exemplo: https://oneverso.com.br/academia/lesson/fund-00
- Video CDN: https://oneverso.com.br/academia/videos/*.mp4
- PDF CDN: https://oneverso.com.br/academia/pdf/*.pdf

## 📊 Métricas

- 262 arquivos Markdown (documentação)
- 93 PDFs (material didático)
- 7 vídeos MP4 (aulas)
- 53 HTMLs (renderizações)
- 6 JSONs (manifestos e sync)
- **Total**: 273 MB no repo, 68 MB servidos publicamente
