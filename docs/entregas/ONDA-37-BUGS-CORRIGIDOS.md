# Onda 37 · Correção Cirúrgica de 6 Bugs · 2026-07-10

## Contexto
Reuniao Genesis exposte 6 bugs bloqueadores no marketplace, rede binaria, academia e YouTube.

## Bugs corrigidos

### Bug 1 · Marketplace vazio (0 e-books)
Causa: `frontend/.env.production` apontava para `https://api.oneverso.com.br` (subdominio inexistente) causando `getaddrinfo ENOTFOUND`.
Fix: `VITE_TRPC_URL=/api/trpc` (relativo, mesma origem).
Status: 192 e-books retornando OK.

### Bug 2 · Rede Binaria N.O sem diretos
Causa: 9 diretos com `sponsorId=305` (aff do user 307 Founder-Nexus), mas login e como user 1 (aff 167).
Fix: `UPDATE network SET "sponsorId"=167 WHERE "sponsorId"=305 AND level=1;` + mesmo update em affiliates.
Status: 9 diretos agora ligados ao user 1.

### Bugs 3+4+5 · Academia · Apostilas pendentes / 404
Causa: URLs no DB apontam para arquivos inexistentes em /public/academia/{pdf,md,html}.
Fix: Geracao automatica de stubs (39 PDFs, 258 MDs, 39 HTMLs) para todas as 266 licoes publicadas com URL setada.
Status: URLs de amostra (prompt-analise, tools-copy, lib-ioaid, fund-00) retornando HTTP 200.

### Bug 6 · YouTube videos 01-08 + 14 com conteudo errado
Causa: Vídeos foram uploadados com descricao correta mas arquivo errado.
Fix parcial:
- Manifesto de re-upload construido (9 videos, 58.7 MB).
- OAuth refreshed.
- Tentativa de upload bloqueada por `uploadLimitExceeded` (quota diaria YouTube).
- Cron `cron_retry_onda37.sh` instalado a cada 4h ate concluir 9 uploads.

## Arquivos alterados
- `frontend/.env.production` — `VITE_TRPC_URL=/api/trpc`
- `scripts/youtube/cron_retry_onda37.sh` (novo)
- `AcademIA/youtube/upload_batch_ready.json` (9 items 01-08 + 14)
- `public/academia/{pdf,md,html}/*` (stubs)

## Bundle deployado
- `index-DAdUwiNT.js` (1.94 MB)
- Nginx reloaded, PM2 online.
