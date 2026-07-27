# Como gerar um novo refresh token do YouTube para o canal oficial

Objetivo: emitir um refresh token com escopos amplos o suficiente para permitir atualização de título, visibilidade e thumbnail no canal oficial da AcademIA/Nexus.

## Escopos necessários

Use estes escopos no consentimento OAuth:

- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.force-ssl`
- `https://www.googleapis.com/auth/youtube.upload`

## Material já preparado no repositório

Os GitHub Secrets esperados pelo fluxo são:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_TOKEN_JSON`
- `YOUTUBE_OAUTH_TOKEN_JSON`
- `GOOGLE_OAUTH_TOKEN_JSON`

O workflow para rotação é:

- `.github/workflows/youtube-token-rotate.yml`

O workflow para retry cirúrgico do módulo 04 é:

- `.github/workflows/youtube-thumb04-retry.yml`

## Caminho recomendado

1. Gere o refresh token do proprietário do canal no navegador, usando o client OAuth oficial do projeto.
2. Garanta que a conta autenticada seja a dona do canal correto.
3. Copie apenas o valor do `refresh_token`.
4. Abra o workflow `youtube-token-rotate` no GitHub Actions.
5. Execute `Run workflow` preenchendo o campo `refresh_token`.
6. Deixe `dispatch_thumb04_retry=true` para disparar automaticamente o retry do módulo 04 depois da rotação.

## Exemplo com ferramenta OAuth local

Você pode usar qualquer ferramenta OAuth compatível que gere refresh token para apps Google. O importante é:

- usar o client OAuth oficial do projeto;
- pedir os 3 escopos acima;
- concluir a tela de consentimento com a conta do canal.

## Resultado esperado

Depois da execução do workflow de rotação:

- os secrets `YOUTUBE_TOKEN_JSON`, `YOUTUBE_OAUTH_TOKEN_JSON` e `GOOGLE_OAUTH_TOKEN_JSON` serão atualizados;
- o workflow `youtube-thumb04-retry` poderá ser disparado automaticamente;
- o workflow `youtube-channel-fixes` passará a conseguir operar com um token mais completo.

## Observação importante

O token recuperado do backup antigo tinha escopos limitados e por isso permitia leitura/upload, mas não atualização completa de vídeos. A rotação com `youtube.force-ssl` resolve esse bloqueio.
