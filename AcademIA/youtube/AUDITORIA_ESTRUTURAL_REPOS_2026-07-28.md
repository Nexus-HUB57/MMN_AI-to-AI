# Auditoria estrutural dos repositórios Nexus — 2026-07-28

## Escopo
Revisão de completude e organização dos repositórios oficiais que sustentam a AcademIA Nexus e o ecossistema Nexus Affil'IA'te.

## Repositório Academ-IA
- Estrutura principal presente e coerente: `producao/`, `materiais/video-aulas/` (trilhas fundamental, agente, master, elite), `videos/` (audio, ondas 47/49/50, roteiros, thumbnails, slides oficiais), `youtube/` (descriptions, thumbnails, thumbnails_yt, videos_teaser), `apostilas/` (C1-C6, T1-T4, HTML, PDF, landing_pages), `cursos/`, `hubs/`, `Lab-Nexus/`, `Lib-Nexus/`, `playbooks/`, `governanca/`, `certificacoes/`, `tutoriais/`, `treinamentos/`, `webinars/`.
- Vídeoaulas 00-14 auditadas: 15 masters existem em `materiais/video-aulas/**/rebuild/` e estão dentro do padrão de render 1280x720 @ 25fps.
- Módulo 00 canônico: master premium presente em `materiais/video-aulas/fundamental/00-boas-vindas/rebuild/video-00-00-boas-vindas-a-academia-nexus-master.mp4` com 261,6s, 9 slides oficiais e narração PT-BR premium.
- Modificações locais identificadas: `apostilas/imagens/C1/cover.png` e `apostilas/imagens/C2/cover.png` (pendentes de commit no fluxo de apostilas).
- Diagnóstico: repositório **completo e bem estruturado**. Pontos de atenção limitam-se à sincronização das capas C1 e C2.

## Repositório MMN_AI-to-AI
- Estrutura principal presente e coerente: `AcademIA/youtube/` (masters, thumbnails, thumbnails_yt, descriptions, manifests, reports), `scripts/youtube/`, `.github/workflows/` (7 workflows do YouTube publicados), `frontend/`, `backend/`, `docs/`, `deploy/`, `infra/`, `ops/`, `mobile/`, `packs/`, `data/`, `assets/`.
- Workflows do YouTube publicados e ativos: `youtube-channel-fixes`, `youtube-cover-fixes`, `youtube-fronts-a-b`, `youtube-thumb04-retry`, `youtube-token-harvest`, `youtube-token-rotate`, `youtube-auth-context`.
- Diagnóstico: repositório **completo e bem estruturado**. Ajustes desta rodada: `.gitignore` reforçado para não commitar pastas temporárias `tmp_*`, criação de `AcademIA/youtube/masters/` para hospedar masters canônicos.

## Sincronização MMN_AI-to-AI ⇄ Academ-IA
- Espelho do master premium 00 movido para `AcademIA/youtube/masters/video-00-boas-vindas-a-academia-nexus-master.mp4`.
- Thumbnail canônica JPG do módulo 00 espelhada em `AcademIA/youtube/thumbnails_yt/00-boas-vindas-a-academia-nexus.jpg`.
- Thumbnail canônica PNG e descrição oficial do módulo 00 espelhadas em `AcademIA/youtube/thumbnails/` e `AcademIA/youtube/descriptions/`.
- Manifestos, workflows e scripts do YouTube residem exclusivamente no MMN_AI-to-AI, com material de produção permanecendo em Academ-IA.

## Estado técnico
- Auditoria de conteúdo: 15 módulos com master reconstruído e ativo.
- Auditoria de estrutura: sem pastas ausentes que impeçam operação.
- Auditoria de canal YouTube: fluxo completo já cobre thumbnail, título, privacidade e upload premium.

## Recomendações imediatas
1. Commitar as capas C1 e C2 no repositório Academ-IA para fechar o backlog de apostilas.
2. Manter novos masters em `AcademIA/youtube/masters/` sempre espelhados a partir de `Academ-IA/materiais/video-aulas/**/rebuild/`.
3. Rotacionar o token OAuth quando disponível para desbloquear as mudanças de privacidade e título restantes.
