# Frentes A e B — status operacional e mapeamento canônico

## Frente A — retirar conteúdo fora do padrão e preservar referência oficial

### Vídeo com slides genéricos
- ID problemático: `cBhbg51peQk`
- Ação técnica correta: colocar em **private**
- Substituto canônico: `txsJDc1oxps`
- Título canônico: `AcademIA Nexus • 00 | Boas-vindas à AcademIA Nexus`
- Observação: a API do YouTube não troca o conteúdo do vídeo existente; para corrigir slides, a medida correta é retirar o vídeo genérico de circulação e manter o canônico no fluxo principal.

### Vídeo com capa genérica ainda sem mapeamento conclusivo
- ID: `CXglMrEOab0`
- Estado: revisão manual ainda necessária
- Hipótese operacional: pode ser o código `10` por eliminação do lote 08–14, mas essa hipótese não foi confirmada pelos manifests.

## Frente B — vídeos não publicados

### AcademIA Nexus 2
- Código canônico: `02`
- ID exato: `eSSXuixQn5Q`
- Título: `AcademIA Nexus • 02 | O Sistema SHO (Self-Healing Orchestrator)`
- Status atual no manifest: `unlisted`

### AcademIA Nexus 3
- Código canônico: `03`
- ID exato: `vkClkh6MSQQ`
- Título: `AcademIA Nexus • 03 | Painel do Afiliado — Visão Geral da Operação`
- Status atual no manifest: `unlisted`

## Automação preparada
- Workflow: `.github/workflows/youtube-fronts-a-b.yml`
- Ações: `AcademIA/youtube/youtube_fronts_A_B_visibility_actions_2026-07-28.json`
- Script: `scripts/youtube/apply_channel_fixes.py`

## Bloqueio atual
A execução de mudanças de visibilidade ainda depende de um token OAuth com escopo suficiente para `videos.update` (`youtube` ou `youtube.force-ssl`). O token recuperado do backup foi útil para leitura/upload/thumbnail, mas não para privacidade/publicação.
