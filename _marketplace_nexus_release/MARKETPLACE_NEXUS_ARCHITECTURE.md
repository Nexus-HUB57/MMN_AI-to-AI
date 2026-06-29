# Marketplace Nexus · Arquitetura completa de Loja Virtual

> **Versão:** 1.0.0 · **Data:** 2026-06-11 · **Catálogo:** 132 ebooks  
> **Repositório:** `Nexus-HUB57/MMN_AI-to-AI` · **Domínio:** [oneverso.com.br](https://oneverso.com.br/marketplaces)

---

## 1. Princípios do produto

| Princípio | Decisão final |
|---|---|
| Preço de custo (afiliado) | **R$ 0,50** por ebook |
| Preço público (consumidor) | **R$ 0,99** por ebook |
| Margem por unidade | R$ 0,49 (≈ 98 %) |
| Agrupamento | **Híbrido**: coleção temática (rótulo) + biblioteca de pack (gate) |
| Escopo do deploy | 103 ebooks prontos + 29 markdowns convertidos = **132 publicados** |
| Sorteio de ebooks ao adquirir um Pack | **Aleatório determinístico** (auditável) excluindo já-possuídos |

---

## 2. Catálogo consolidado

Gerado por `scripts/generate_marketplace_ebooks.py` a partir dos 166 markdowns em
`docs/ebooks_markdown/` (filtrando READMEs e guias). Resultado:

| Pack | Pool cumulativo | Coleções inclusas |
|---|---|---|
| **pack-a2** (Afiliado I) | 77 ebooks | Raiz, As Novas Profissões, Curso Universo IA, HUMAN_IA |
| **pack-a2ii** (Afiliado II) | 98 ebooks | + MMN_IA, IA se Descreve |
| **pack-a2iii** (Afiliado III) | 110 ebooks | + A IA Perfeita, MAESTRIA IA APLICADA, AXIOMA PRIME |
| **pack-ag** (Preditivo I) | 132 ebooks | + NEXUS PROTOCOL, AgenticAI Revolução, FORJA AGÊNTICA, GNOX'S |

Artefatos físicos por ebook em produção:
- HTML responsivo em `/ebooks/<slug>.html`
- PDF A4 em `/ebooks/pdf/<slug>.pdf`
- Capa WebP em `/ebooks/covers/<slug>.webp`

---

## 3. Modelo de dados (PostgreSQL)

Migration: [`database/migrations/0010_marketplace_user_library.sql`](../database/migrations/0010_marketplace_user_library.sql).

```
┌────────────────────────────┐    ┌────────────────────────────┐
│   marketplace_ebooks       │    │   marketplace_carts        │
│ (catálogo mestre 132)      │    │ (1 carrinho aberto/user)   │
└────────────────────────────┘    └────────────┬───────────────┘
        ▲                                        │
        │  unlock_pack_slug                      │ 1..N
        │                                        ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│ marketplace_user_library   │    │ marketplace_cart_items     │
│ (estoque pessoal do user)  │    │ (ebook | pack | bundle)    │
└────────────▲───────────────┘    └────────────────────────────┘
             │ 1..N
             │ (gerado no deliverOrder)
┌────────────┴───────────────┐    ┌────────────────────────────┐
│   marketplace_orders       │◀───┤  marketplace_order_items   │
│ (pending → paid → deliver) │    │ (snapshot do carrinho)     │
└────────────▲───────────────┘    └────────────────────────────┘
             │
             │ 1..N
┌────────────┴───────────────┐
│ marketplace_pack_drawings  │
│ (auditoria sorteios pack)  │
└────────────────────────────┘
```

Tabelas criadas: `marketplace_ebooks`, `marketplace_carts`, `marketplace_cart_items`,
`marketplace_orders`, `marketplace_order_items`, `marketplace_user_library`,
`marketplace_pack_drawings`.

---

## 4. Fluxo do usuário (Loja Virtual responsiva)

```
 [Vitrine /marketplaces]
     │
     ▼ filtros: coleção temática · pack · busca · preço
 [Catálogo de 132 ebooks]  ← MarketplaceCatalog.tsx
     │  click no card
     ▼
 [Detalhe do ebook]  ← MarketplaceProductDetail.tsx
     │  + Adicionar ao carrinho
     ▼
 [Carrinho]  ← MarketplaceCart.tsx  (persistido em marketplace_carts)
     │  + Itens podem ser: ebook avulso ou pack completo
     ▼
 [Checkout PIX/Mercado Pago]  ← MarketplaceCheckout.tsx + PixCheckout.tsx
     │  cria marketplace_orders (status: pending)
     │  pixRouter.createMarketplaceCheckout
     ▼
 [Webhook PIX / confirmação MP]  → marca paid → deliverOrder()
     │  para cada item:
     │   - ebook  → grantEbookToUser
     │   - pack   → drawPackEbooksForUser (sorteio aleatório)
     ▼
 [Biblioteca do usuário]  ← /minha-biblioteca  (lê marketplace_user_library)
     │  baixa PDF · lê HTML · revende como afiliado
     ▼
 [Mini-site público do afiliado]  → exibe somente os ebooks em sua library
```

---

## 5. Sorteio aleatório por Pack (lógica oficial)

Implementado em `backend/src/domains/marketplace/userLibraryService.ts`:

1. Lê a **quota** do pack (campo `PACK_EBOOK_QUOTA`, ex: A² = 10, A²II = 30…).
2. Carrega o **pool** = todos `marketplace_ebooks` com `unlock_pack_slug` cuja
   ordem ≤ ordem do pack adquirido (cumulativo).
3. Subtrai os ebooks que o usuário **já possui**.
4. Aplica **Fisher–Yates determinístico** semeado por
   `sha256(userId:orderId:packSlug:timestamp)`. O `seed` é registrado em
   `marketplace_pack_drawings` para auditoria/recálculo.
5. Insere as N escolhas em `marketplace_user_library` (unique key impede dupla).

**Por que determinístico?** Permite ao auditor (ou ao suporte) reconstruir
exatamente o sorteio se necessário. Para o usuário a experiência é "aleatória";
para o operador é prova matemática de não-viés.

---

## 6. Integração com checkout existente

| Endpoint atual                                  | Mudança |
|---|---|
| `pix.createMarketplaceCheckout` (já existe)     | Aceita `type: 'pack' \| 'ebook' \| 'bundle'`; persiste `marketplace_orders` antes de pedir o PIX |
| `pix.webhook` (já existe)                       | Após confirmar pagamento, chama `deliverOrder(orderId)` |
| `marketplace.listProducts` (já existe)          | Estende para retornar do catálogo `marketplace_ebooks` (com filtro de coleção/pack) |
| **NOVO** `marketplace.myLibrary`                | Lista a biblioteca do usuário (estoque pessoal) |
| **NOVO** `marketplace.packDrawingHistory`       | Histórico de sorteios do usuário (transparência) |

---

## 7. Deploy

Script único, executado **no servidor de produção** (143.95.213.237:22022):

```bash
ssh -p 22022 root@143.95.213.237
cd /var/www/oneverso
sudo BRANCH=main \
     DATABASE_URL='postgres://usuario:senha@host:5432/db' \
     FRONTEND_URL='https://oneverso.com.br' \
     bash scripts/deploy_marketplace_nexus.sh
```

Etapas (idempotentes):

1. `git pull` do branch `main`
2. `psql -f database/migrations/0010_marketplace_user_library.sql`
3. `python3 scripts/seed_marketplace_ebooks.py` (132 upserts)
4. `python3 scripts/generate_marketplace_ebooks.py` (PDF/HTML/capa)
5. `pnpm install && pnpm build` (frontend + backend)
6. `pm2 reload ecosystem.config.js && systemctl reload nginx`
7. smoke tests `curl /health` e `/marketplaces`

A pipeline do GitHub Actions já existente (`.github/workflows/deploy.yml`)
roda **automaticamente** as etapas 5–7 a cada `push` em `main`; as etapas 1–4 são
executadas pelo script acima.

---

## 8. Checklist de pós-deploy

- [ ] `https://oneverso.com.br/marketplaces` exibe os **132 ebooks**
- [ ] Filtros funcionam: coleção temática, pack, busca, preço
- [ ] Carrinho persistente após login (via `marketplace_carts`)
- [ ] Checkout PIX gera QR Code (Mercado Pago) e fallback chave PIX manual
- [ ] Compra de **ebook avulso** entrega o item em `/minha-biblioteca`
- [ ] Compra de **Pack A²** sorteia 10 ebooks aleatórios e popula library
- [ ] Sorteio fica registrado em `marketplace_pack_drawings` (auditoria)
- [ ] Mini-site público do afiliado mostra apenas ebooks em sua library
- [ ] Cron de comissão (1 %–5 % afiliado/upline) é disparado pós-entrega
- [ ] **Credenciais expostas no chat foram revogadas** (token GitHub, senha root)

---

## 9. Segurança — ações obrigatórias

| Item | URL/ação |
|---|---|
| Revogar token GitHub | https://github.com/settings/tokens |
| Trocar senha root da VPS | `passwd root` via SSH |
| Encerrar sessão VNC ativa | painel HostGator → terminar sessão `a2d7bc13-…` |
| Gerar Deploy Key (sem senha) | `ssh-keygen -t ed25519 -f ~/.ssh/deploy_nexus -N ''` |
| Configurar PAT fine-grained | escopo: apenas `Nexus-HUB57/MMN_AI-to-AI`, contents:write |
