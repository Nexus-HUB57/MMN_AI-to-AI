# Como gerar um novo refresh token do YouTube para o canal oficial

Objetivo: emitir um refresh token com escopos amplos o suficiente para permitir upload de vídeo, atualização de título, alteração de visibilidade e mudança de thumbnail no canal oficial `UCRBIjE5zxufWHR9lVmHRVGw`.

## Escopos exigidos

Estes três escopos devem entrar como parâmetro `scope=` durante o consentimento OAuth. Eles NÃO devem ser adicionados como URIs de redirecionamento no Google Cloud Console.

- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.force-ssl`
- `https://www.googleapis.com/auth/youtube.upload`

## Checklist obrigatório no Google Cloud Console

Antes de gerar o refresh token, abra o cliente OAuth do projeto
`nexus-affiliate-499802` (identificado pelo `YOUTUBE_CLIENT_ID` publicado nos GitHub Secrets do repositório oficial) e confirme:

1. Em "URIs de redirecionamento autorizados", devem existir SOMENTE URLs de callback do seu app. Nunca coloque URLs de escopo OAuth (`.../auth/youtube*`) nessa lista.
2. Configuração mínima recomendada de redirecionamentos:
   - `https://oneverso.com.br/oauth/callback`
   - `http://localhost`
   - `http://localhost:8080`
3. Em "Escopos" da tela de consentimento (OAuth consent screen), autorize os três escopos listados acima.
4. Se o app estiver em modo "Teste", adicione a conta do canal
   `UCRBIjE5zxufWHR9lVmHRVGw` como usuário de teste.

## Caminho recomendado — gerar refresh token localmente

Em uma máquina local com Python, use o utilitário oficial do repo:

```bash
pip install --user google-auth-oauthlib google-auth google-api-python-client
# Os valores reais de client_id / client_secret NÃO ficam no repositório.
# Recupere-os do Google Cloud Console do projeto nexus-affiliate-499802
# ou dos GitHub Secrets do repositório (YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET).
export YOUTUBE_CLIENT_ID="<seu-client-id>.apps.googleusercontent.com"
export YOUTUBE_CLIENT_SECRET="<seu-client-secret>"
python3 scripts/youtube/generate_refresh_token_local.py
```

Isso abre o navegador. Faça login com a conta dona do canal `UCRBIjE5zxufWHR9lVmHRVGw` e aprove os três escopos. O terminal imprime o `refresh_token`.

## Rotação automática no repositório oficial

Depois de ter o `refresh_token` em mãos:

1. Abra o workflow `youtube-token-rotate` no GitHub Actions.
2. Clique em "Run workflow".
3. Cole o valor do `refresh_token` no input mascarado.
4. Deixe `dispatch_thumb04_retry=true` se quiser encadear automaticamente o retry do módulo 04.
5. Confirme.

Ao concluir, o workflow atualiza sozinho os secrets `YOUTUBE_TOKEN_JSON`, `YOUTUBE_OAUTH_TOKEN_JSON` e `GOOGLE_OAUTH_TOKEN_JSON` do repositório `Nexus-HUB57/MMN_AI-to-AI`.

## Diagnóstico do erro `invalid_grant: Bad Request`

Esse erro ocorre quando o `refresh_token` publicado nos secrets foi revogado, expirou ou foi emitido para um `client_id` diferente do atual. A correção é gerar um refresh token novo com este mesmo `client_id`/`client_secret` e rodar o `youtube-token-rotate`.

## Diagnóstico do erro `redirect_uri_mismatch`

Esse erro aparece quando os URIs de redirecionamento no console incluem itens inválidos, ou quando o app OAuth está em modo "Publicado" sem verificação. Reveja o checklist obrigatório acima. Nenhum item da lista de redirecionamento deve começar com `https://www.googleapis.com/auth/`.

## Segurança

Não comite o refresh token no repositório. O único caminho aprovado é passar pelo workflow `youtube-token-rotate`, que grava direto nos GitHub Secrets sem passar por arquivos versionados.
