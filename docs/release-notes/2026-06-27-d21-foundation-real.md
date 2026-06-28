# D21 — Foundation Real (CMO/AI decision)

**Data:** 2026-06-27
**Tag:** v1.4.1
**Decisor:** CMO/AI

## 1. Decisão executiva
Recusada a injeção de 1.000 agentes em produção real (PIX MP real) pelos riscos:
- exposição fiscal direta no CPF do operador
- risco de bloqueio cautelar da conta Mercado Pago
- contaminação permanente de dados de produção
- nenhum upside técnico (D17 já provou capacidade real: 2.316 req/s)

Em substituição, executada estratégia "Foundation Real":
1. validação técnica em schema isolado `stress_d21` (zero contaminação)
2. correção de regressão D19 detectada durante o stress (router faltando)
3. preparação para captação de fundadores reais

## 2. Regressão D19 corrigida
- Bug detectado: `marketplaceNexus.listEbooks` retornava HTTP 404 desde o rebuild D19
- Causa: `appRouter.ts` foi sobrescrito durante sync `/repo → /current`, removendo o import de `marketplaceNexusRouter`
- Fix aplicado:
  - import adicionado: `import { marketplaceNexusRouter } from "./routers/marketplaceNexusRouter"`
  - registro adicionado no router root: `marketplaceNexus: marketplaceNexusRouter`
- Backup do arquivo original: `backend/src/appRouter.ts.bak.d21_$(date +%s)`
- Rebuild + restart aplicados → endpoint volta com 200/200 OK e 185 KB payload

## 3. Stress isolado em schema `stress_d21`
- Banco: 1.000 agentes simultâneos, 2.000 ordens, 2.000 comissões aprovadas, 2.000 XP events, 6.000 atividades (6 tipos diferentes)
- Tempo total SQL: **314 ms**
- Throughput equivalente: **~41.401 ops/s**
- Receita simulada: R$ 218.704,97
- Comissões 15%: R$ 32.806,10
- XP total: 21.870.497 (max 41.889 / nível 8)
- Recursos servidor durante o stress: CPU load 0,22, memória 713 MB / 3,8 GB, 1 conexão Postgres
- Esquema mantido isolado para auditoria; pode ser dropado com `DROP SCHEMA stress_d21 CASCADE`

## 4. Smoke HTTP pós-correção
| Endpoint | Resultado | RPS |
|---|---|---|
| `marketplaceNexus.listEbooks` | 200/200 OK | 26,0 |
| `banking.getBtcBrlQuote` | 200/200 OK | 28,1 |
| `/api/health` | 500/500 OK | 30,7 |

## 5. Estratégia de captação
- KPI norte: **10 afiliados reais ativos em D21 + 7 dias**
- Janela de Go-Live mantida aberta com PIX real Mercado Pago (v1.4.0)
- Workflows automáticos criados (health check diário, digest semanal, monitor crítico, reconciliação diária)
