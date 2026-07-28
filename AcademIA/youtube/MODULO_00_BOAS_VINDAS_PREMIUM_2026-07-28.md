# Módulo 00 · Boas-vindas à AcademIA Nexus — Premium Rebuild

## Contexto
O vídeo publicado no canal com ID `cBhbg51peQk` foi identificado como conteúdo com slides genéricos, fora do padrão do cartão de visita da Nexus Affil'IA'te. A API do YouTube não permite substituir o arquivo de um vídeo existente. A correção técnica correta é: privatizar o vídeo legado e publicar um novo vídeo canônico usando o master premium já produzido pelo pipeline oficial da Nexus.

## Master premium disponível
- Origem canônica: `Academ-IA/materiais/video-aulas/fundamental/00-boas-vindas/rebuild/video-00-00-boas-vindas-a-academia-nexus-master.mp4`
- Espelho no MMN: `AcademIA/youtube/masters/video-00-boas-vindas-a-academia-nexus-master.mp4`
- Duração: 261,6s (4 min 21 s)
- Slides oficiais: 9 (mínimo 5, máximo 10 do padrão Nexus)
- Render: 1280x720 @ 25 fps, H.264 + AAC 192 kbps
- Roteiro: Dupla Ive+Alencar, 7 cenas encadeadas (introdução, o que é a Nexus, 3 pilares, próximos 30 dias, 5 mandamentos, recursos e suporte, próximo passo)
- Narração PT-BR premium: `rebuild_00_narracao_ptbr.wav`

## Assets canônicos
- Descrição: `AcademIA/youtube/descriptions/00-boas-vindas-a-academia-nexus.txt`
- Thumbnail JPG compacta (< 2MB): `AcademIA/youtube/thumbnails_yt/00-boas-vindas-a-academia-nexus.jpg`
- Thumbnail PNG oficial (referência): `AcademIA/youtube/thumbnails/00-boas-vindas-a-academia-nexus.png`
- Capa oficial de referência: `producao/assets/thumbnails/capa-00-boas-vindas-ive.png`

## Legados a aposentar
- `cBhbg51peQk` (slides genéricos, private)
- `txsJDc1oxps` (versão anterior, unlisted, sem thumbnail premium)

## Automação
- Workflow: `.github/workflows/youtube-module00-premium.yml`
- Script: `scripts/youtube/upload_module00_premium.py`
- Inputs: `privacy` (unlisted por padrão) e `privatize_legacy` (true por padrão)
- Comportamento: sobe o master premium com título e descrição canônicos, aplica a thumbnail canônica e privatiza os legados quando houver escopo `youtube.force-ssl`.

## Fluxo recomendado
1. Executar `youtube-module00-premium` com `privacy=unlisted` e `privatize_legacy=true`.
2. Homologar o vídeo novo no canal e validar visualmente slides, áudio, capa e descrição.
3. Trocar `privacy=public` no manifest final ou via nova execução com `privacy=public`.
4. Confirmar no Studio que `cBhbg51peQk` e `txsJDc1oxps` estão privados.

## Requisitos de segurança
- Secret `YOUTUBE_TOKEN_JSON` publicado no repositório oficial.
- Escopo mínimo para upload: `youtube.upload`.
- Escopo necessário para privatizar legados: `youtube.force-ssl`.
