# D20 — Go-Live Operação Real (PIX + Comissões Auto)

**Data:** 2026-06-27
**Tag:** v1.4.0 — primeira tag Go-Live oficial
**Base:** v1.3.9 (D19 validation full)

## 1. Go-Live ativado
- `NODE_ENV=production`
- `GO_LIVE_MODE=true`
- `MERCADO_PAGO_USE_SANDBOX=false`
- `PIX_SANDBOX=false`
- `COMMISSION_AUTO_APPROVE=true` (worker BullMQ libera saldo automaticamente)
- `PAYMENT_LIMITS_ENABLED=false` (sem limite por transação)
- `BTC_PROVIDER_PRIMARY=mercadobitcoin`
- `BINANCE_WITHDRAW_ENABLED=false` (geo-block BR confirmado HTTP 451)

## 2. Smoke test PIX REAL — sucesso
Pagamento real criado em produção via API Mercado Pago oficial:

| Campo | Valor |
|---|---|
| Payment ID | **166074872998** |
| Conta MP | Lucas Thomaz (lucasmpthomaz@hotmail.com) |
| Valor | R$ 1,00 |
| Status | pending |
| External ref | golive-1782579575 |
| QR Code | gerado (3.820 bytes base64, 2.865 bytes PNG) |
| Ticket URL | https://www.mercadopago.com.br/payments/166074872998/ticket |
| Notification URL | https://oneverso.com.br/webhooks/mercadopago |

## 3. Webhook MP real validado
- `POST /webhooks/mercadopago` retornou **HTTP 200** com body `{"ok":true}`
- Worker `mmn-worker-orders` e `mmn-worker-commissions` reload com env atualizado
- Cluster `mmn-api` (2 instâncias) online com Go-Live ativo

## 4. Comissão automática
- Worker `commissionProcessingWorker` consome `commission_processing_queue` (concurrency 3)
- Pipeline: `calculateCommissionsForPayment → confirmCommissions → updateAffiliateCommissionTotals`
- 193 comissões já aprovadas pré-Go-Live (R$ 2.788,07)

## 5. Custódia BTC
- Cotação primária via **Mercado Bitcoin** (Brasil-friendly): R$ 318.183/BTC
- Binance API confirmou geo-block HTTP 451 para BR → mantido apenas como fallback bloqueado

## 6. Status PM2
- `mmn-api` ×2 cluster — online com env produção
- `mmn-worker-commissions`, `mmn-worker-orders`, `mmn-worker-marketplace`, `mmn-worker-content` — online
- `oauth-callback` — online

## 7. Próximas etapas operacionais
- Workflows automáticos:
  - Daily health check + relatório operacional
  - Weekly commission payout digest
  - Alerta Sentry/PM2 em falhas críticas
  - Reconciliação diária PIX + BTC custody
