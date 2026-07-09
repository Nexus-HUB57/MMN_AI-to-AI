# Fase 10 — Sprint 10.5 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.7.0-sprint5
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.5 concluída com entrega de **2 épics** de alta prioridade de negócio:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.3.4 | Firebase sessão completa | ✅ Entregue | upsert usuário DB + refresh token + sessão |
| 10.2.9 | generateDynamicQr OpenPix | ✅ Entregue | QR Code dinâmico real via API OpenPix em produção |

---

## Entregas Detalhadas

### 1. Firebase Social Login — Sessão Completa (Epic 10.3.4)

**Arquivos modificados:** `backend/src/routers/authRouter.ts`, `frontend/src/pages/Login.tsx`

#### Fluxo completo implementado:

```
1. Usuário clica "Entrar com Google"
2. firebase.ts → signInWithPopup(GoogleAuthProvider)
3. Obtém idToken do Firebase
4. Chama trpc.auth.loginWithFirebaseToken({ idToken, provider: "google" })
5. Backend: verifyIdToken → getUserByOpenId → getUserByEmail → upsertUser
6. Backend: createRefreshToken + createSessionAudit
7. Retorna { user, sessionId, tokenId, provider }
8. Frontend: emite CustomEvent "mmn:social-login" com dados de sessão
```

#### `loginWithFirebaseToken` — 3 passos:

**Passo 1 — Verificação do Token:**
```typescript
const adminApp = await getFirebaseAdmin();
decodedToken = await adminApp.auth().verifyIdToken(input.idToken);
// Extrai: uid, email, name/display_name, picture
```

**Passo 2 — Upsert do Usuário:**
```typescript
let user = await db.getUserByOpenId(firebaseUid);
if (!user && email) user = await db.getUserByEmail(email);
if (!user) {
  await db.upsertUser({ openId: firebaseUid, name, email, role: "user", loginMethod });
  user = await db.getUserByOpenId(firebaseUid);
}
if (user.openId !== firebaseUid) await db.updateLegacyUserToModern(user.id, firebaseUid);
```

**Passo 3 — Sessão:**
```typescript
await db.createRefreshToken({ id: tokenId, userId, tokenHash, deviceInfo: "social:google", ... });
await db.createSessionAudit({ action: "social_login", metadata: { firebase_uid, picture }, ... });
return { success: true, user: { id, name, email, role, picture }, sessionId, tokenId, provider };
```

**Resposta do endpoint:**
```typescript
{
  success: true,
  user: { id: number, name: string | null, email: string | null, role: string, picture: string | null },
  sessionId: string,   // identificador da sessão no cliente
  tokenId: string,     // ID do refresh token para renovação
  provider: "google" | "facebook" | "apple"
}
```

---

### 2. generateDynamicQr com OpenPix (Epic 10.2.9)

**Arquivo modificado:** `backend/src/routers/pixRouter.ts`

#### Schema de input atualizado:

```typescript
{
  amount: number,          // obrigatório — valor em R$
  cobUrl?: string,         // opcional — apenas em fallback sandbox
  txid?: string,           // opcional — correlationID OpenPix
  description?: string,    // opcional — até 140 chars
  payerName?: string,      // opcional — nome do pagador
  payerEmail?: string,     // opcional — email do pagador
}
```

#### Lógica de roteamento:

```
Se !PIX_SANDBOX && isOpenPixAvailable():
  → createOpenPixCharge(correlationID, valueCents, comment, expiresIn=1800s, customer?)
  → retorna: qrCodePayload (brCode), qrCodeImageUrl, paymentLinkUrl, openPixStatus
Senão (sandbox ou sem token):
  → cobUrl = input.cobUrl ?? fallback URL local
  → generatePixDynamicPayload(cobUrl, amount, txid)
  → retorna: qrCodePayload, type: "dynamic", sandbox: true
```

#### Resposta ampliada:

```typescript
{
  qrCodePayload: string,         // EMV/brCode para QR
  qrCodeImageUrl?: string,       // URL da imagem do QR (OpenPix only)
  paymentLinkUrl?: string,       // Link de pagamento (OpenPix only)
  txid: string,
  amount: number,
  type: "dynamic",
  sandbox: boolean,
  expiresAt: string,
  openPixStatus?: "ACTIVE" | "COMPLETED" | "EXPIRED",
}
```

---

## Arquivos Modificados

```
backend/src/routers/authRouter.ts     → loginWithFirebaseToken completo (upsert + sessão)
backend/src/routers/pixRouter.ts      → generateDynamicQr com OpenPix + input expandido
frontend/src/pages/Login.tsx          → chama loginWithFirebaseToken após signInWithPopup
CHANGELOG.md                          → entrada v1.7.0-sprint5
```

---

## Sprint 10.6 — Próximas Prioridades

1. **#10.3.5** Integrar `sessionId/tokenId` do social login com `AuthContext` (persistência localStorage + auto-login)
2. **#10.7.1** Testes de integração — webhook PIX (Vitest + mock OpenPix)
3. **#10.6.3** Alertmanager config (Slack/e-mail + regras de roteamento)
4. **#10.8.1** Endpoint `pix.refund` — devolução PIX via OpenPix API
5. **#10.9.1** Relatório de comissões CSV export (`commissions.exportCsv`)

**Documento atualizado em:** 2026-05-28
