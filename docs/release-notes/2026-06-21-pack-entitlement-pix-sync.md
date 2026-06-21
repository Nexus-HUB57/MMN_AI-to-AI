# Release 2026-06-21 — Pack Entitlement + Sincronização Loja/Estoque

## Funcionalidade
Ao confirmar pagamento PIX de um Pack (A², A²II, A²III, AG, AGII, …, AAIII)
ou Upgrade, **10 e-books são sorteados automaticamente** do pool elegível do
pack e sincronizados imediatamente à Loja Virtual e ao Estoque do afiliado.

## Implementação técnica

### Backend
- **Migration** `marketplace_pack_grants`: tabela idempotente (uniq user+pack+payment_ref).
- **Service** `packEntitlementService.ts`:
  - `grantPackToUser(userId, packSlug, opts)` — sorteia N ebooks (Fisher-Yates auditável com seed SHA-256), insere em `marketplace_user_library`, registra auditoria em `marketplace_pack_drawings`, cria order virtual e grant.
  - `listUserGrants(userId)` — todos os grants do usuário com `ownedCount` real.
  - `redeliverPackForUser` — reentrega do pool restante.
  - Quotas oficiais: pack-a2=10, pack-a2ii=30, pack-a2iii=50, pack-ag=250, ..., pack-aaiii=350000.
- **Router** `packEntitlementsRouter` (registrado como `packEntitlements`):
  - `listMyGrants`, `listMyLibrary`, `quotaTable`, `confirmAndGrant`, `redeliver`, `adminGrant`.
- **Hook PIX**: `pixRouter.webhook` agora detecta pagamentos de Pack e dispara `grantPackToUser` automaticamente.
- **Refatoração `affiliateStore.myInventory`**: lê de `marketplace_user_library` (DB real) com fallback para perfil JSON. `activePacks` é detectado automaticamente.

### Frontend
- Novo componente `PackEntitlementsCard.tsx` (full/compact):
  - Banner verde "✅ N Pack(s) ativos · X e-books sincronizados"
  - Cards por Pack com `delivered/expected/poolSize`
  - Lista de e-books recentes com cover + categoria
  - Botão "Reentregar (faltam X)" se houver gap
  - Toast de feedback
- Injetado em 3 páginas:
  - `/packs` (PacksMarketplace) — variant full
  - `/estoque` (Estoque) — variant full
  - `/minha-loja` (MinhaLoja) — variant compact

## Validação E2E (live)

| Etapa | Resultado |
|---|---|
| Estado inicial user 1 | 0 ebooks · 0 grants |
| Grant Pack A² (paymentRef oficial) | ✅ 10 ebooks sorteados do pool 139 |
| Idempotência (mesmo paymentRef) | ✅ `alreadyGranted: true` · sem duplicação |
| `affiliateStore.myInventory` | Total=10 · ActivePacks=["pack-a2"] · Code=NX00001 |
| Distribuição por coleção | 9 coleções diferentes (sorteio aleatório auditável) |
| `packEntitlements.quotaTable` | 15 packs com quotas oficiais |

## API endpoints expostos

| Endpoint | Acesso | Função |
|---|---|---|
| `packEntitlements.listMyGrants` | protected | Lista grants do user |
| `packEntitlements.listMyLibrary` | protected | E-books recebidos via pack |
| `packEntitlements.confirmAndGrant` | protected | Confirmar PIX manual + entrega |
| `packEntitlements.redeliver` | protected | Reentregar (faltam) |
| `packEntitlements.quotaTable` | protected | Quotas oficiais por pack |
| `packEntitlements.adminGrant` | admin | Grant manual (sem pagamento) |

## Como Pack/Upgrade é entregue automaticamente
1. Usuário inicia checkout do Pack A² → cria `marketplace_orders` com item_type=pack e payment_id=txid.
2. Mercado Pago / banco confirma PIX → POST webhook em `/api/trpc/pix.webhook`.
3. `pixRouter.webhook` grava em `payments` E busca `marketplace_orders` pendente com mesmo `payment_id`.
4. Para cada order de pack encontrada, chama `grantPackToUser(user_id, pack_slug, txid)`.
5. Service sorteia 10 ebooks, insere em `marketplace_user_library`, cria registro em `marketplace_pack_grants`.
6. Frontend (`/packs`, `/estoque`, `/minha-loja`) reflete automaticamente via tRPC queries.

## Bundle final
- Frontend: `index-BzsSWaw3.js` (966 KB)
- Backend: `dist/index.js` (1.3 MB)
- Migration aplicada: `marketplace_pack_grants` (13 colunas, 3 índices)
