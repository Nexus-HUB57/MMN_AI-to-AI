# Fase 10 — Sprint 10.2 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.4.0-sprint2
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.2 concluída com entrega de **4 épics** de alto impacto:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.2.3 | Webhook PIX + DB | ✅ Entregue | Persistência de pagamentos PIX no banco de dados |
| 10.2.4 | Checkout PIX UI | ✅ Entregue | Página completa de checkout PIX com QR Code |
| 10.3.2 | Login Social | ✅ Entregue | Botões Google / Facebook / Apple na tela de login |
| Routing | App.tsx | ✅ Entregue | Rota `/pix/checkout` registrada |

---

## Entregas Detalhadas

### 1. Webhook PIX com Persistência no Banco (Epic 10.2.3)

**Arquivo modificado:** `backend/src/routers/pixRouter.ts`

**O que mudou no handler `webhook`:**

**Estratégia dual-write (cache + banco):**
1. **Cache Redis** continua sendo gravado primeiro — garante resposta imediata ao polling do frontend
2. **Banco de dados** recebe insert na tabela `payments` quando `getDb()` retorna conexão válida
3. Falha no banco não aborta o webhook — grava warning em stderr e retorna `{ ok: true }` ao PSP

**Mapeamento de campos para `payments`:**

| Campo PIX | Campo `payments` |
|-----------|-----------------|
| `valor` (string) → centavos | `amount` (integer) |
| `"pix"` | `method` |
| `"confirmed"` | `status` |
| `txid[0..19]` | `bankNumber` |
| `endToEndId[0..19]` | `account` |
| `horario` (ISO) | `paymentDate` |
| `new Date()` | `confirmedAt` |

**Imports adicionados:** `getDb`, `payments` (schema), `InferInsertModel` (Drizzle)

**Substituição de `console.log`:** trocado por `process.stdout.write` com JSON estruturado (conforme padrão do logger do projeto)

---

### 2. Página de Checkout PIX (Epic 10.2.4)

**Arquivo criado:** `frontend/src/pages/PixCheckout.tsx`
**Rota registrada:** `/pix/checkout` em `frontend/src/App.tsx`

**Funcionalidades implementadas:**

| Feature | Detalhe |
|---------|---------|
| Formulário de cobrança | Campo valor (R$) + descrição opcional (máx 72 chars) |
| Geração de QR Code | Chama `pix.generateStaticQr` via tRPC mutation |
| Exibição do QR Code | Imagem via `api.qrserver.com` (sem dependências extras) |
| Código Copia e Cola | Payload EMV exibido + botão de copiar para clipboard |
| Polling automático | Checa `pix.checkPaymentStatus` a cada 5 segundos |
| Confirmação visual | Tela de sucesso com checkmark verde ao receber pagamento |
| Modo Sandbox | Botão "Simular Pagamento" chama `pix.sandboxConfirm` |
| Aba Info | Status de configuração do servidor PIX |
| Reset | Botão "Nova Cobrança" limpa estado |
| Estados de UI | idle → generated → polling → paid / error |

**Componentes UI usados:** `Card`, `Tabs`, `Button`, `Input`, `Label`, `Badge` (todos do projeto)

**Sem dependências novas:** QR Code renderizado via URL pública, sem npm packages adicionais

---

### 3. Login Social — Google / Facebook / Apple (Epic 10.3.2)

**Arquivo modificado:** `frontend/src/pages/Login.tsx`

**O que foi adicionado:**

- Componente `SocialLoginDivider` — separador "ou continue com" abaixo do botão principal de login
- Componente `SocialLoginButtons` — grid de 3 botões com SVG inline:
  - **Google** (4 paths coloridos #4285F4, #34A853, #FBBC05, #EA4335)
  - **Facebook** (#1877F2)
  - **Apple** (path correto iOS brand)
- Botões visíveis apenas no modo `"affiliate"` (não exibidos no login admin)
- Ao clicar: dispara evento `CustomEvent("mmn:social-login")` para integração futura + `alert()` orientando sobre configuração do Firebase
- Sem dependências externas — SVGs inline, sem `react-oauth/google` ou similar

**Para ativar em produção (Sprint 10.3.3):**
1. Instalar `firebase` no frontend (`pnpm --filter @workspace/frontend add firebase`)
2. Adicionar `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
3. Substituir o `alert()` pelo fluxo `signInWithPopup(provider)` real
4. Mapear ID token Firebase para sessão do backend via `firebaseAdmin.verifyFirebaseIdToken()`

---

## Arquivos Modificados

```
frontend/src/pages/PixCheckout.tsx           → NOVO (Epic 10.2.4)
frontend/src/App.tsx                          → rota /pix/checkout + import PixCheckout
frontend/src/pages/Login.tsx                  → SocialLoginDivider + SocialLoginButtons (Epic 10.3.2)
backend/src/routers/pixRouter.ts              → webhook: dual-write cache+DB, imports, console→stdout
fases/FASE10_SPRINT2_ENTREGA.md              → NOVO (este documento)
```

---

## Critérios de Aceitação Verificados

- [x] Webhook PIX persiste pagamentos na tabela `payments` sem abortar quando DB indisponível
- [x] Página `/pix/checkout` acessível, com formulário, QR Code e polling
- [x] Modo sandbox com botão de simulação funcional
- [x] Botões de login social Google/Facebook/Apple renderizando corretamente
- [x] Rota `/pix/checkout` registrada no Switch do App.tsx

---

## Sprint 10.3 — Próximas Prioridades

1. **#10.3.3** Integração real Firebase Client SDK (signInWithPopup) no frontend
2. **#10.2.5** Integração PSP real (OpenPix/Celcoin) para QR Code dinâmico
3. **#10.6.2** Dashboard Grafana — JSON de configuração + data source
4. **#10.2.6** Tela de histórico de cobranças PIX (admin + afiliado)
5. **#10.1.2** Validação build web Expo + testes de integração

**Documento atualizado em:** 2026-05-28
