# Baseline Oficial de Produção — Go-Live OneVerso

## Identificação
- timestamp_utc: 20260623T212440Z
- ambiente: produção
- host: oneverso.com.br
- backend_service: mmn-ai-to-ai-backend
- backend_mode: full
- backend_version: 1.0.0
- node_runtime: 20.20.2
- pm2_mode: fork
- bundle_js: index-DcIa1Eu6.js
- bundle_css: style-DiSzFBcW.css
- bundle_js_size_bytes: 1023095
- backend_dist_size_bytes: 1366568
- backend_dist_mtime: 2026-06-23 09:37:41.447772827 -0300
- repo_head_sha: 5855f8dc108dbf4ca80c3fecbb4235685e6da1e1
- repo_head_short: 5855f8d
- repo_head_msg: fix(academia): mirror oficial de vídeos + roteiros canônicos + apostila HTML/PDF
- repo_head_date: 2026-06-22 13:05:30 -0300

## Processos PM2 esperados (todos online em fork)
- mmn-api
- mmn-worker-commissions
- mmn-worker-content
- mmn-worker-marketplace
- mmn-worker-orders
- oauth-callback

## Rotas críticas (esperado HTTP 200)
- /api/health
- /login
- /dashboard
- /admin/academia/analytics
- /academia/ead/curso
- /academia/ead/curso/fund-00
- /academia/hubs/
- /sw.js
- /api/academia/catalog
- /api/academia/search?q=ioaid
- /api/academia/whats-new?limit=5
- /api/academia/stats/popular?days=30
- /api/academia/lesson/fund-00
- /api/academia/lesson/fund-00/stats
- /api/academia/lesson/fund-00/next-suggested
- /api/academia/lesson-progress/me?userId=1
- /api/academia/whats-new/has-recent?hours=24
- /api/youtube/snapshot
- /oauth/health

## Rotas protegidas (esperado HTTP 401)
- /api/academia/admin/cleanup-views
- /api/academia/admin/translate-bulk
- /api/v1/academia/search

## Banco — volumes esperados (snapshot)
- academia_lessons=54
- featured_lessons=6
- with_video=8
- with_cover=49
- marketplace_orders=101
- marketplace_user_library=1010
- lesson_views_30d>=7
- lesson_progress>=1

## Procedimento de rollback rápido
1. parar deploy em curso
2. restaurar bundle anterior em /var/www/oneverso/public/assets/
3. restaurar backend/dist/index.js do baseline anterior
4. pm2 reload mmn-api --update-env
5. revalidar /api/health e rotas críticas
6. comunicar status

## Observações
- Worktree do servidor possui artefatos legados; saneamento controlado em andamento.
- Vídeos Master ainda não gerados; permanecem fora de escopo até autorização explícita.
