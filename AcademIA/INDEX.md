# 📚 AcademIA Nexus Affil'IA'te · INDEX Master

**Última atualização**: 2026-07-13 · Mavis + contribuidor paralelo
**Total**: 30 apostilas · 11 webinars · 30 PDFs apostila · 11 PDFs webinar · 41 HTMLs · 25 capas AcademIA
**Versão**: 1.3.0 (Onda 38)

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

- ✅ 6 vídeos curtos (POCs 6-10s) em `AcademIA/videos/`
- ✅ 9 thumbnails 2K geradas
- ✅ 5 roteiros completos (video-00 a 04)
- ⏳ Migração para YouTube @NexusAffilIAte-w9p pendente (público)
- ✅ Modo `mp4-gated` para trilhas premium

## 📄 PDFs Publicados

- ✅ 30 PDFs apostila em `AcademIA/pdfs/[0-9]-*.pdf`
- ✅ 11 PDFs webinar em `AcademIA/pdfs/webinar-WB-*.pdf`
- ✅ 10 PDFs cursos (fundamental, agent, master, elite) em `AcademIA/pdfs/curso-*.pdf`
- Total: 41 PDFs novos + 10 históricos

## 🔗 URLs em Produção

- Academia: https://oneverso.com.br/academia
- Lesson exemplo: https://oneverso.com.br/academia/lesson/fund-00
- Video CDN: https://oneverso.com.br/academia/videos/*.mp4
- PDF CDN: https://oneverso.com.br/academia/pdf/*.pdf

## 📊 Métricas (v1.3.0)

- 855+ arquivos Markdown (documentação)
- 41 PDFs apostilas/webinars + 10 PDFs cursos históricos
- 6 vídeos MP4 (aulas) + 9 thumbnails
- 41 HTMLs (renderizações com enhance.js)
- 6 JSONs (manifestos e sync)
- 25 capas AcademIA (1-15 + 16, 20-28)
- **Total**: ~1.1 GB no repo, 68 MB servidos publicamente

## 📚 Catálogo de Apostilas (30)

### Trilha Fundamental & Agente (1-15)
1. Apresentação & Infraestrutura · 2. Cases Orquestração · 3. Infra Operacional IA · 4. Orquestração Híbrida · 5. 7 Telas Essenciais · 6. Setup Agente · 7. 18 Skills Operacionais · 8. Rotina Disparo · 9. Campanhas Automatizadas · 10. Jornada Afiliado · 11. SHO em Produção · 12. IOAID Arquitetura · 13. Marketplace Skills · 14. Multi-Tenant Whitelabel · 15. Métricas ROI

### Trilha Master & Elite (16-22)
16. Trilha Fundamental IA · 17. SEO & Marketing Conteúdo · 18. Segurança Ofensiva · 19. Monetização Avançada · 20. Trilha Elite Engenharia · 21. Trilha Master Arquitetura · 22. Trilha Master Mentoria

### Cursos Práticos & Avançados (23-30)
23. Curso RAG Prático · 24. Curso Agents LangGraph · 25. Curso Prompt Engineering · 26. Curso Vector DB · 27. Curso Voice AI · 28. Curso Multimodal RAG · 29. AI-to-AI Protocol (A2A) · 30. Federação Zero-Trust

## 🎥 Catálogo de Webinars (11)
- WB-01 Lançamento IOAID · WB-02 SHO em Produção · WB-03 Open House
- WB-04 Skills em Produção · WB-05 Multi-Tenant · WB-06 A/B Test Estatístico · WB-07 LGPD & IA
- WB-08 IA-to-IA Federation · WB-09 Agentes Autônomos em Produção
- WB-10 SEO vs IA Generativa · WB-11 Burnout em Affiliates
