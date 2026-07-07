# D19 Runtime Hotfix — 2026-06-27

## Resumo
Hotfix operacional aplicado após alinhamento do diretório `/current` com a branch `main` do repositório canônico.

## Correção aplicada
- adicionadas dependências de runtime ausentes no backend: `nodemailer` e `@sentry/node`
- rebuild do backend executado com sucesso
- API `mmn-api` restabelecida em cluster (2 instâncias)
- validação pública pós-hotfix: `/api/health`, `/dashboard`, `/marketplaces`, `/payments`, `/agents/sync`, `/pix/checkout`, `/pix/history` retornando HTTP 200

## Observações
- o problema manifestado em produção foi `MODULE_NOT_FOUND: nodemailer`
- o hotfix estabiliza a baseline D18/v1.3.7 e evita novo 502 após deploy limpo
