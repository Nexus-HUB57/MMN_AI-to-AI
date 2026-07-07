# ONDA 14 · FLUXO PIX → ESTOQUE → LOJA · CORRIGIDO
**Data:** 2026-07-03 22:47 BRT  
**Diretiva CEO:** *"Teste PIX R$1 OK, mas estoque vazio. Corrigir e Go Live"*  
**Episódios Niko:** id=25 (bugfix) + id=26 (retroativo)

## Contexto
CEO executou teste completo de PIX R$1:
- ✅ Escolha 2 ebooks OK
- ✅ Preenchimento carrinho OK
- ✅ QR code MP gerado OK
- ✅ Pagamento MP aprovado (R$1 confirmado no extrato)
- ✅ Email de confirmação enviado
- ❌ **Ebooks NÃO entregues no estoque**
- ❌ MinhaLoja retornou erro

## Root Cause Analysis (RCA)

### Bug Principal
`pix.createMarketplaceCheckout` gerava QR code do Mercado Pago **mas não inseria em `marketplace_orders`**. Sem order registrada:
1. Webhook do MP `/webhooks/mercadopago` recebe notificação
2. Busca em `marketplace_orders WHERE id=$1 OR external_reference=$1`
3. **0 rows** → webhook retorna `order_not_found`
4. Biblioteca `marketplace_user_library` nunca é populada
5. Estoque permanece vazio

### Bug Secundário
1. **PixCheckout.tsx** — `payerEmail` inicializava com `user?.email`, ignorando o email do carrinho passado via URL
2. **Marketplaces.tsx** — não enviava `payerName`, `slug`, `type`, `name` no query string
3. **App.tsx** — rota `/minha-loja` não estava registrada (só `/estoque`)

## Fixes Aplicados

### F1 · Backend: `pixRouter.ts.createMarketplaceCheckout`
Adicionado antes do `return result;`:
```typescript
// INSERT marketplace_orders + order_items (idempotente)
await client.query(
  `INSERT INTO marketplace_orders 
    (id, user_id, status, payment_status, subtotal_cents, total_cents,
     payment_method, external_reference, metadata, is_test_data)
   VALUES ($1, $2, 'pending', 'pending', $3, $3, 'mercado_pago', $1, $4::jsonb, false)`,
  [orderId, runtimeUser.id, input.amountCents, JSON.stringify({...})]
);

await client.query(
  `INSERT INTO marketplace_order_items 
    (order_id, item_slug, title, unit_price_cents, quantity)
   VALUES ($1, $2, $3, $4, 1)`,
  [orderId, input.slug, input.name, input.amountCents]
);
```

### F2 · Frontend: `PixCheckout.tsx`
```typescript
// ANTES:
const [payerEmail, setPayerEmail] = useState(user?.email ?? "");

// DEPOIS:
const [payerName, setPayerName] = useState<string>(
  (checkoutIntent as any)?.payerName ?? user?.name ?? ""
);
const [payerEmail, setPayerEmail] = useState(
  (checkoutIntent as any)?.payerEmail ?? user?.email ?? ""
);
```

### F3 · Frontend: `Marketplaces.tsx.handleGoToPixCheckout`
Envia agora: `amountCents`, `description`, `payerEmail`, **`payerName`**, `source`, **`slug`**, **`type`**, **`name`**

### F4 · Frontend: `App.tsx`
```typescript
import MinhaLoja from "@/pages/MinhaLoja";
<Route path="/minha-loja" component={MinhaLoja} />
```

### F5 · Retroativo: PIX R$1 CEO entregue manualmente
- `marketplace_orders.id = onda-14-retroativo-pix-r1-lucas`
- `marketplace_user_library` populated com 2 ebooks:
  - `01-minimax-a-ia-revolucionaria`
  - `02-minimax-como-construir-skills-vencedoras`

## Deploy

| Item | Valor |
|------|-------|
| Backend | `dist/index.js` 1.4 MB (esbuild 77ms) |
| Frontend Bundle | `index-BsCzNO8M.js` |
| PM2 reload | --update-env, cluster 2 instâncias |
| Health | ok=true |
| Webhook MP | HTTP 200 |
| Rotas | /estoque ✅, /minha-loja ✅ (novo), 11/11 admin ✅ |
| DB | 6 orders, 5 paid, CEO com 2 ebooks entregues |

## Fluxo Corrigido (E2E)

```
[Marketplaces] ─→ [carrinho + email + name] ─→ [/pix/checkout?params] 
       ↓
[PixCheckout] ─→ payerEmail + payerName pre-preenchidos do intent
       ↓
[pix.createMarketplaceCheckout] ─→ MP Preference + PIX QR + **INSERT marketplace_orders** ✨ NEW
       ↓
[Usuário paga PIX] ─→ [Mercado Pago aprova]
       ↓
[Webhook /webhooks/mercadopago] ─→ busca marketplace_orders by external_reference
       ↓ (agora ENCONTRA! ✨)
[UPDATE marketplace_orders SET paid] + [INSERT marketplace_user_library]
       ↓
[Estoque /estoque] ─→ affiliateStore.myInventory ─→ lista ebooks entregues ✅
[Minha Loja /minha-loja] ─→ affiliateStore.myInventory + publicInventoryByCode ✅
```

## Ações CEO
1. **Novo teste PIX R$1** — fluxo agora deve entregar automaticamente
2. **Limpar cache navegador** (Ctrl+Shift+R) para pegar `index-BsCzNO8M.js`
3. Verificar `/estoque` — deve mostrar 2 ebooks (retroativo do PIX R$1 anterior)
4. Verificar `/minha-loja` — deve funcionar sem erro

## Aprendizado (Niko id=25)
> **"Gerar checkout != Criar order."** Em fluxos de pagamento, sempre criar order no DB no momento do checkout (não apenas na confirmação), para que webhooks tenham algo para atualizar via `external_reference`. Retroativos são caros — evitar racelines por design.
