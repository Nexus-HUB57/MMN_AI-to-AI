# Diagnóstico do contexto OAuth do YouTube

## Objetivo
Confirmar qual canal o token atual controla e verificar a acessibilidade dos IDs críticos para as frentes A e B.

## IDs auditados
- cBhbg51peQk
- CXglMrEOab0
- 9yNu41LmXYQ
- txsJDc1oxps
- eSSXuixQn5Q
- vkClkh6MSQQ
- bwRwb3tghUQ
- YaRtNYuWFqw
- bNZf1fl1xhw
- VV2a4aZRiS4
- i-hkO0TV9ak
- DR2YwM-Xihw
- b3Oi53XqITs
- wfHFfynxU6w
- wtH1eaSpBuw
- ssaFYNd7WgI

## Resultado esperado
1. Canal retornado por `channels.list(mine=true)`.
2. Escopos efetivos do token materializado.
3. Para cada ID, status `found`/`not found`, título, canal e privacidade.
4. Evidência para confirmar por que `eSSXuixQn5Q` e `vkClkh6MSQQ` retornam `video_not_found` apesar de constarem nos manifests canônicos.
