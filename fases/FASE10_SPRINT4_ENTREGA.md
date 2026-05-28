# Fase 10 — Sprint 10.4 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.6.0-sprint4
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.4 concluída com entrega de **4 épics**:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.2.8 | OpenPix PSP Service | ✅ Entregue | Serviço de integração com API OpenPix para PIX dinâmico |
| 10.3.3 | Firebase Client SDK | ✅ Entregue | `firebase.ts` + `loginWithFirebaseToken` backend + Login fix |
| 10.4.1 | Prometheus Alertas | ✅ Entregue | `prometheus-alerts.yml` — 12 alertas em 5 grupos |
| 10.5.2 | Cache Invalidation | ✅ Entregue | Webhook PIX invalida `dashboard:*` após confirmação |

---

## Entregas Detalhadas

### 1. OpenPix PSP Service (Epic 10.2.8)

**Arquivo criado:** `backend/src/services/openPixService.ts`

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `isOpenPixAvailable()` | Verifica se `OPENPIX_TOKEN` está configurado |
| `createOpenPixCharge(input)` | Cria cobrança PIX dinâmica via `POST /api/v1/charge` |
| `getOpenPixChargeStatus(correlationID)` | Consulta status via `GET /api/v1/charge/{id}` |
| `validateOpenPixWebhookSignature(rawBody, header)` | Valida header `x-webhook-signature` |
| `mapOpenPixStatus(status)` | Mapeia `ACTIVE/COMPLETED/EXPIRED` → `ATIVA/CONCLUIDA/EXPIRADA` |

**Variáveis de ambiente:**
```
OPENPIX_TOKEN=    # Bearer token da API (app.openpix.com.br → API/Plugins)
OPENPIX_APP_ID=   # App ID para validação de webhook
```

**Integração no pixRouter:**
- `checkPaymentStatus`: em produção, tenta OpenPix primeiro, depois DB como fallback
- Quando status é `CONCLUIDA`, persiste no cache Redis/memory por 24h

---

### 2. Cache Invalidation pós-webhook PIX (Epic 10.5.2)

**Arquivo modificado:** `backend/src/routers/pixRouter.ts`

Após processar todos os PIX recebidos no webhook:
```typescript
await invalidateCachePattern(CACHE_KEYS.DASHBOARD_PATTERN).catch(() => undefined);
```

**Efeito:** dados do dashboard (`dashboard:*`) ficam obsoletos após confirmação, forçando recálculo na próxima visualização. O `.catch(() => undefined)` garante que falhas no cache não abortem o webhook.

---

### 3. Firebase Client SDK (Epic 10.3.3)

**Arquivo criado:** `frontend/src/lib/firebase.ts`

```typescript
// Uso no frontend:
import { signInWithGoogle, signInWithFacebook, signInWithApple } from "@/lib/firebase";
const profile = await signInWithGoogle();
// profile: { uid, email, displayName, photoURL, idToken, provider }
```

**Design:** usa `await import("firebase/app")` e `await import("firebase/auth")` dinamicamente.
Se o pacote não estiver instalado, lança erro com mensagem descritiva.
Se variáveis `VITE_FIREBASE_*` não estiverem definidas, lança erro antes de tentar importar.

**Como ativar:**
1. `pnpm --filter @mmn/frontend add firebase`
2. Definir no `.env.local` do frontend:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_APP_ID=
   ```
3. Ativar provedores no Firebase Console (Authentication → Sign-in methods)

**Login.tsx (`SocialLoginButtons`) atualizado:**
- `handleSocial` agora é `async`, importa firebase.ts dinamicamente
- Estado `loading` (string | null) e `socialError` (string | null)
- Botões desabilitados enquanto loading
- Mensagem de erro exibida abaixo dos botões
- **Fix:** imports React (`useState`, `useMemo`, `useEffect`) movidos para o topo do arquivo (estavam na linha 123 — após definições de funções)

**Endpoint backend:** `auth.loginWithFirebaseToken`

```typescript
// Uso no frontend (após implementação completa):
const result = await trpc.auth.loginWithFirebaseToken.mutate({
  idToken: profile.idToken,
  provider: "google",
});
// result: { success, firebaseUid, email, name, picture, provider }
```

---

### 4. Prometheus Alertas (Epic 10.4.1)

**Arquivo criado:** `monitoring/prometheus-alerts.yml`

| Grupo | Alerta | Gatilho | Severidade |
|-------|--------|---------|------------|
| availability | BackendDown | `up == 0` por 2min | critical |
| availability | HighHttpErrorRate | erros > 5% por 5min | warning |
| availability | HighTrpcErrorRate | erros tRPC > 10% por 5min | warning |
| latency | HighHttpLatencyP95 | p95 > 2000ms por 5min | warning |
| latency | CriticalHttpLatencyP99 | p99 > 5000ms por 2min | critical |
| latency | HighTrpcLatencyP95 | p95 > 3000ms por 5min | warning |
| pix | NoPIXQrGenerated | sem QR em 2h (horário comercial) | warning |
| pix | PIXWebhookSpike | > 100 confirmações/min | critical |
| agents | HighAgentFailureRate | falhas > 20% por 5min | warning |
| resources | HighHeapUsage | heap > 800MB por 5min | warning |
| resources | ProcessRestarted | uptime < 5min (após >1h ativo) | warning |
| commissions | NoCommissionEvents | sem comissões em 24h (dia útil) | warning |

**Como usar:**
```yaml
# Em prometheus.yml:
rule_files:
  - "prometheus-alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]
```

---

## Arquivos Modificados / Criados

```
backend/src/services/openPixService.ts           → NOVO (Epic 10.2.8)
backend/src/routers/pixRouter.ts                  → checkPaymentStatus (OpenPix) + webhook cache invalidation
backend/src/routers/authRouter.ts                 → loginWithFirebaseToken endpoint
frontend/src/lib/firebase.ts                      → NOVO (Epic 10.3.3)
frontend/src/pages/Login.tsx                      → SocialLoginButtons async + fix imports
monitoring/prometheus-alerts.yml                  → NOVO (Epic 10.4.1)
.env.example                                      → OPENPIX_TOKEN, OPENPIX_APP_ID, VITE_FIREBASE_*
CHANGELOG.md                                      → entrada v1.6.0-sprint4
```

---

## Sprint 10.5 — Próximas Prioridades

1. **#10.3.4** Completar fluxo Firebase → sessão local (login completo com cookie/JWT)
2. **#10.2.9** `generateDynamicQr` usando `createOpenPixCharge` em produção
3. **#10.7.1** Testes de integração — webhook PIX (Jest/Vitest mock)
4. **#10.6.3** Alertmanager config (Slack + e-mail) para os alertas do Sprint 10.4
5. **#10.1.3** EAS Build config para Expo (app.json, eas.json, OTA updates)

**Documento atualizado em:** 2026-05-28
