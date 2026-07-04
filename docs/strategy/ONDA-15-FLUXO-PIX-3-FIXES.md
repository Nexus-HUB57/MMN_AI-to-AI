# ONDA 15 · FLUXO PIX · 3 FIXES REAIS
**Data:** 2026-07-03 23:35 BRT  
**Diretiva CEO:** *"Corrigir 3 problemas do fluxo PIX/carrinho/estoque"*  
**Episódio Niko:** id=28+ (bugfix)

## Root Cause Real Identificado

### Bug #1 (crítico): DB Schema
```
[ONDA14] Erro criando marketplace_order: 
error: value too long for type character varying(36)
```
- Tabela `marketplace_orders.id` era `varchar(36)` (limite UUID)
- Nosso `externalReference` do PixRouter tinha formato `ebook:slug:userId:timestamp` (>36 chars)
- **INSERT falhava silenciosamente**, order não era criada, webhook não encontrava, estoque vazio

### Bug #2 (UX): Dados não sincronizam
- Marketplaces.tsx enviava `payerEmail`, `payerName` via URL query
- PixCheckout.tsx tinha `useState` inicial correto do intent
- MAS não fazia **auto-trigger** do QR — usuário precisava clicar botão de novo

### Bug #3 (UX): Confirmação não automática
- Webhook MP funcionava, mas UI não tinha polling
- Usuário só via update se clicasse manualmente "Abrir Checkout MP"

## Fixes Aplicados

### Fix 1 · DB Schema Migration
```sql
ALTER TABLE marketplace_orders ALTER COLUMN id TYPE varchar(128);
ALTER TABLE marketplace_orders ALTER COLUMN external_reference TYPE varchar(128);
ALTER TABLE marketplace_order_items ALTER COLUMN order_id TYPE varchar(128);
ALTER TABLE marketplace_user_library ALTER COLUMN source_order_id TYPE varchar(128);
```

### Fix 2 · pixRouter shortId
```typescript
const orderId = `mp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
// ~24 chars, sempre único
```

### Fix 3 · PixCheckout auto-trigger + polling
```typescript
// Auto-gerar QR se intent+dados completos
useEffect(() => {
  if (!autoTriggerCheckout && checkoutIntent && payerEmail && payerName && amountCents > 0) {
    setAutoTriggerCheckout(true);
    setTimeout(() => handleGenerateCheckout(), 300);
  }
}, [checkoutIntent, payerEmail, payerName, amountCents]);

// Poll status a cada 5s
useEffect(() => {
  if (!paymentIdRef || paymentConfirmed) return;
  const timer = setInterval(async () => {
    const resp = await fetch(`/api/pix/status?paymentId=${paymentIdRef}`);
    const data = await resp.json();
    if (data?.paid === true) {
      setPaymentConfirmed(true);
      setFeedback("✅ Pagamento confirmado automaticamente!");
      setTimeout(() => window.location.href = "/estoque", 3000);
    }
  }, 5000);
  return () => clearInterval(timer);
}, [paymentIdRef]);
```

### Fix 4 · REST endpoint /api/pix/status
Novo endpoint no `backend/src/index.ts`:
1. Query local `marketplace_orders WHERE payment_id OR external_reference`
2. Fallback consulta MP API se disponível
3. Retorna JSON `{ paymentId, status, paid, source }`

## Deploy Validado

| Item | Valor |
|------|-------|
| Backend | `dist/index.js` 1.4 MB (esbuild 79ms) |
| Frontend Bundle | `index-DhMIhXHx.js` |
| Migration | `0015_expand_marketplace_orders_id.sql` |
| /api/pix/status | HTTP 200, JSON válido |
| Webhook MP | HTTP 200 |
| Rotas | /estoque, /minha-loja, /marketplaces, /pix/checkout ✅ 200 |
| Health | ok=true |

## Fluxo E2E Corrigido

```
[Marketplaces] preencher email + nome
       ↓ (auto-carry via URL params)
[/pix/checkout] auto-triggerCheckout (sem clicar botão)
       ↓
[MP Preference + PIX QR gerado] + INSERT marketplace_orders ✅
       ↓
[Usuário paga PIX no app do banco]
       ↓
[Webhook /webhooks/mercadopago] + Polling /api/pix/status
       ↓ (dupla garantia)
[UPDATE order paid + INSERT marketplace_user_library]
       ↓
[UI notifica "✅ Confirmado" + redirect /estoque em 3s]
       ↓
[Estoque exibe ebooks entregues] ✨
```

## Aprendizado Registrado
> **"varchar(36) é limite UUID clássico."** Para IDs customizados sempre usar varchar(128+). Aviso: erros silenciosos no INSERT precisam de log explícito no catch. Polling + webhook duplicam garantias de UX em PIX (webhook pode atrasar, polling pega imediato).
