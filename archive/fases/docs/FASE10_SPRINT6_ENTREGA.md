# Fase 10 — Sprint 10.6 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.8.0-sprint6
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.6 concluída com entrega de **4 épics**:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.3.5 | AuthContext Social | ✅ Entregue | loginWithSocial + event listener + localStorage |
| 10.8.1 | pix.refund | ✅ Entregue | Devolução PIX via OpenPix API |
| 10.9.1 | Commissions CSV Export | ✅ Entregue | Export CSV base64 com filtros |
| 10.6.3 | Alertmanager Config | ✅ Entregue | `alertmanager.yml` — 5 receivers + 2 inhibit rules |

---

## Entregas Detalhadas

### 1. AuthContext — Sessão Social Completa (Epic 10.3.5)

**Arquivo modificado:** `frontend/src/contexts/AuthContext.tsx`

#### Fluxo completo agora funcional:

```
1. Clique em "Entrar com Google"
2. SocialLoginButtons: signInWithPopup → loginWithFirebaseToken → emit "mmn:social-login"
3. AuthProvider: window.addEventListener("mmn:social-login") → loginWithSocial(payload)
4. loginWithSocial: persiste tokenId/sessionId + setUser(socialUser) + persistUser
5. AuthContext.isAuthenticated === true → usuário logado
```

#### `loginWithSocial(payload)` — o que faz:

1. Cria `User` a partir do payload Firebase
2. Salva `{ sessionId, tokenId, provider, expiresAt }` em `SOCIAL_TOKEN_KEY` localStorage
3. Chama `setUser` + `persistUser` — usuário aparece autenticado imediatamente
4. Retorna o `User` criado

#### `SOCIAL_TOKEN_KEY`:

```json
{
  "sessionId": "...",
  "tokenId": "...",
  "provider": "google",
  "expiresAt": "2026-06-04T..."
}
```

**Logout** também limpa `SOCIAL_TOKEN_KEY`.

---

### 2. pix.refund (Epic 10.8.1)

**Arquivo modificado:** `backend/src/routers/pixRouter.ts`

```typescript
trpc.pix.refund.mutate({
  txid: "correlationID-da-cobranca",
  amount: 25.00,        // opcional — omitir para devolução total
  reason: "Produto não entregue",  // opcional
});
// Retorna:
// { ok, refundCorrelationID, txid, amount, status, sandbox, message }
```

**Em sandbox:**
```json
{ "ok": true, "status": "REFUNDED_SIMULATED", "sandbox": true }
```

**Em produção (com OPENPIX_TOKEN):**
- `POST https://api.openpix.com.br/api/v1/refund`
- `chargeCorrelationID` = txid da cobrança original
- `value` = centavos (opcional para devolução parcial)
- `comment` = reason ou "Devolução solicitada via MMN AI-to-AI"

---

### 3. Commissions CSV Export (Epic 10.9.1)

**Arquivo modificado:** `backend/src/routers/paymentsRouter.ts`

```typescript
const result = await trpc.payments.exportCommissionsCsv.query({
  affiliateId: 42,           // opcional — omitir para usar próprio afiliado
  status: "confirmed",       // opcional
  startDate: "2026-01-01",  // opcional
  endDate: "2026-05-28",    // opcional
});

// Para download no browser:
const bytes = atob(result.csvBase64);
const blob = new Blob([bytes], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = result.filename; a.click();
```

**Colunas do CSV:**
```
id, affiliateId, amount (R$), status, source, sourceId, type, createdAt
```

---

### 4. Alertmanager Config (Epic 10.6.3)

**Arquivo criado:** `monitoring/alertmanager.yml`

#### Receivers configurados:

| Receiver | Canal Slack | Destino |
|----------|-------------|---------|
| `critical` | `#mmn-alerts-critical` + e-mail | Alertas críticos (BackendDown, P99, PIXSpike) |
| `slack-warning` | `#mmn-alerts-warning` | Alertas de aviso padrão |
| `payments-team` | `#mmn-pagamentos` + e-mail | PIX/Pagamentos |
| `finance-team` | `#mmn-financeiro` | Comissões/Financeiro |
| `infra-team` | `#mmn-infra` | Heap/Processo |

#### Variáveis de ambiente necessárias:
```
SLACK_WEBHOOK_CRITICAL=https://hooks.slack.com/services/...
SLACK_WEBHOOK_WARNING=https://hooks.slack.com/services/...
SMTP_USERNAME=
SMTP_PASSWORD=
ALERT_EMAIL_FROM=
ALERT_EMAIL_CRITICAL=
ALERT_EMAIL_TEAM=
```

#### Como usar:
```yaml
# prometheus.yml
alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]
rule_files:
  - "prometheus-alerts.yml"
```

---

## Arquivos Modificados / Criados

```
frontend/src/contexts/AuthContext.tsx      → loginWithSocial + event listener + SOCIAL_TOKEN_KEY
backend/src/routers/pixRouter.ts           → pix.refund endpoint (OpenPix + sandbox)
backend/src/routers/paymentsRouter.ts      → payments.exportCommissionsCsv endpoint
monitoring/alertmanager.yml               → NOVO (Epic 10.6.3)
CHANGELOG.md                              → entrada v1.8.0-sprint6
```

---

## Sprint 10.7 — Próximas Prioridades

1. **#10.7.1** Testes de integração — webhook PIX + pix.refund (Vitest + mock fetch)
2. **#10.9.2** Frontend: botão "Exportar CSV" na página PixHistory
3. **#10.3.6** Restaurar sessão social do localStorage no AuthProvider (auto-login)
4. **#10.10.1** Relatório de agentes IA (`agents.exportCsv`) + dashboard admins
5. **#10.11.1** Rate limiting para endpoints PIX (express-rate-limit)

**Documento atualizado em:** 2026-05-28
