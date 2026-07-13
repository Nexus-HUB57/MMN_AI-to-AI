# Fase 10 — Sprint 10.7 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.9.0-sprint7
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.7 concluída com entrega de **4 épics**:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.9.2 | Botão CSV no PixHistory | ✅ Entregue | Download automático de comissões em CSV |
| 10.3.6 | Auto-login social (AuthContext) | ✅ Entregue | Restaura sessão social do localStorage |
| 10.11.1 | Rate limiter PIX | ✅ Entregue | Middleware em memória, sem dependências |
| 10.7.1 | Testes de integração | ✅ Entregue | Vitest — webhook + refund + CRC-16 |

---

## Entregas Detalhadas

### 1. Botão "Exportar CSV" na PixHistory (Epic 10.9.2)

**Arquivo modificado:** `frontend/src/pages/PixHistory.tsx`

#### UX:

- Botão "Exportar CSV" aparece ao lado de "Atualizar" no header da página
- Usa os filtros de data ativos (`startDate`, `endDate`) ao exportar
- Ícone `Download` com animação `animate-pulse` durante o download
- Não bloqueia a UI — estado `isDownloading` independente

#### Fluxo técnico:

```typescript
// 1. Chama endpoint tRPC
const result = await utils.payments.exportCommissionsCsv.fetch({ startDate, endDate });

// 2. Decodifica base64 → Uint8Array → Blob
const bytes = Uint8Array.from(atob(result.csvBase64), c => c.charCodeAt(0));
const blob = new Blob([bytes], { type: "text/csv;charset=utf-8;" });

// 3. Download automático via URL object
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = result.filename; a.click();
URL.revokeObjectURL(url);
```

---

### 2. Auto-login Social (Epic 10.3.6)

**Arquivo modificado:** `frontend/src/contexts/AuthContext.tsx`

#### Lógica de restauração de sessão:

```typescript
// Fluxo no useEffect de inicialização:
if (stored) {
  const parsed = JSON.parse(stored) as User;
  if (parsed.role !== "admin") {
    const socialRaw = localStorage.getItem(SOCIAL_TOKEN_KEY);
    if (socialRaw) {
      const session = JSON.parse(socialRaw);
      if (session.expiresAt && new Date(session.expiresAt).getTime() > Date.now()) {
        setUser(parsed); // ✅ sessão social ainda válida → restaurar
      } else {
        // ❌ sessão expirada → limpar
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SOCIAL_TOKEN_KEY);
      }
    } else {
      setUser(parsed); // usuário não-social (demo/affiliate) → restaurar normalmente
    }
  }
}
```

**TTL da sessão social:** 7 dias (definido em `loginWithSocial`)

---

### 3. Rate Limiter PIX (Epic 10.11.1)

**Arquivo criado:** `backend/src/middlewares/pixRateLimiter.ts`

#### Especificação:

| Limite | Webhook (`pix.webhook`) | QR Code (`pix.generateDynamicQr`) |
|--------|------------------------|-----------------------------------|
| Janela | 60 segundos | 60 segundos |
| Máximo | 100 req/IP | 20 req/IP |
| HTTP | 429 Too Many Requests | 429 Too Many Requests |

#### Cabeçalhos de resposta:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1748444700
Retry-After: 45
```

#### Corpo da resposta 429:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit excedido. Tente novamente em 45s.",
  "retryAfter": 45
}
```

#### Sem dependências externas — usa `Map<string, WindowEntry>` nativo Node.js

---

### 4. Testes de Integração (Epic 10.7.1)

**Arquivo criado:** `backend/src/tests/pixWebhook.test.ts`

#### Cobertura:

```
pix.webhook (4 testes)
  ✓ processa um pagamento PIX válido e atualiza o cache
  ✓ calcula valor em centavos corretamente para diferentes formatos
  ✓ usa endToEndId como txid quando txid não é fornecido
  ✓ processa múltiplos pagamentos PIX na mesma requisição

pix.refund (sandbox) (4 testes)
  ✓ retorna status REFUNDED_SIMULATED em sandbox
  ✓ gera correlationID único quando não informado
  ✓ converte amount para centavos corretamente
  ✓ lança erro quando OpenPix não está disponível em produção

geração de payload PIX (2 testes)
  ✓ CRC-16 CCITT de string conhecida produz resultado esperado
  ✓ payload estático PIX tem formato EMV válido (começa com 000201)
```

#### Execução:

```bash
pnpm --filter backend test
# ou
cd backend && npx vitest run
```

---

## Arquivos Modificados / Criados

```
frontend/src/pages/PixHistory.tsx              → botão "Exportar CSV" + handleExportCsv
frontend/src/contexts/AuthContext.tsx          → auto-login social com verificação de expiração
backend/src/middlewares/pixRateLimiter.ts      → NOVO — rate limiter em memória
backend/src/index.ts                           → import + uso de pixWebhookRateLimiter/pixQrRateLimiter
backend/src/tests/pixWebhook.test.ts           → NOVO — 10 testes Vitest
CHANGELOG.md                                   → entrada v1.9.0-sprint7
```

---

## Sprint 10.8 — Próximas Prioridades

1. **#10.10.1** Relatório de agentes IA (`agents.exportCsv`) + dashboard admins
2. **#10.12.1** Vitest para `exportCommissionsCsv` (mock DB, RBAC)
3. **#10.13.1** Frontend: página de configurações de perfil (nome, email, avatar)
4. **#10.14.1** Notificações em tempo real (Server-Sent Events para status PIX)
5. **#10.15.1** Admin: bulk export de todas as comissões por período

**Documento atualizado em:** 2026-05-28
