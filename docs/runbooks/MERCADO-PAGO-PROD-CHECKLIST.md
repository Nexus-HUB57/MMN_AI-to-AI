# 💳 Checklist Mercado Pago · SANDBOX → PROD

**Owner**: Otto Cardoso (CFO/AI) + Otávio (COO/AI) · **Autorizado**: Lucas Thomaz 03/07/2026

## Status Atual
- Modo: SANDBOX (`MERCADO_PAGO_USE_SANDBOX=true`)
- Credenciais PROD: já em .env
- Webhook: /webhooks/mercadopago ativo

## Checklist 7 passos

1. ✅ Autorização humana (Lucas 03/07)
2. ⏳ Lucas gera PIX R$1 sandbox em /pix/checkout
3. ⏳ Backup .env + DB dump
4. ⏳ Alternar USE_SANDBOX=false + pm2 reload
5. ⏳ Validação PROD (novo PIX real)
6. ⏳ Rollback se falhar
7. ⏳ Persistir episódio final

## Guardrails
- Otto monitora primeira semana
- Alerta P0 se valor > R$100 ou IP repetido
- Fraud suspect → escalate Niko + Lucas

## Trigger próximo
Lucas fazer PIX teste R$1 sandbox → COO valida → troca ambiente
