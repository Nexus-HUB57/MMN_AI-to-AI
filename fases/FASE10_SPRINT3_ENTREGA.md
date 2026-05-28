# Fase 10 — Sprint 10.3 — Entrega Técnica

**Data:** 2026-05-28
**Versão:** v1.5.0-sprint3
**Responsável:** MiniMax Agent / Nexus Dev Team

---

## Resumo Executivo

Sprint 10.3 concluída com entrega de **4 épics**:

| Epic | Issue | Status | Descrição |
|------|-------|--------|-----------|
| 10.2.5 | PIX History endpoint | ✅ Entregue | `pix.listHistory` tRPC — paginação + filtros de data |
| 10.2.6 | Página Histórico PIX | ✅ Entregue | `/pix/history` com tabela, badges e paginação |
| 10.2.7 | Nav links PIX | ✅ Entregue | "Checkout PIX" e "Histórico PIX" no menu lateral |
| 10.6.2 | Grafana Dashboard | ✅ Entregue | `monitoring/grafana-dashboard.json` — dashboard completo |

---

## Entregas Detalhadas

### 1. Endpoint `pix.listHistory` (Epic 10.2.5)

**Arquivo modificado:** `backend/src/routers/pixRouter.ts`

**Assinatura:**
```typescript
pix.listHistory({
  limit?: number;    // 1–100, default 20
  offset?: number;   // default 0
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
})
```

**Resposta:**
```typescript
{
  items: {
    id: number;
    amount: number;       // centavos
    status: string;
    txid: string;
    endToEndId: string;
    paymentDate: string | null;
    confirmedAt: string | null;
    createdAt: string;
  }[];
  total: number;
  sandbox: boolean;
}
```

**Filtros Drizzle:**
- `eq(payments.method, "pix")` — filtra apenas pagamentos PIX
- `gte(payments.createdAt, new Date(startDate))` — data inicial
- `lte(payments.createdAt, new Date(endDate))` — data final
- `orderBy(desc(payments.createdAt))` — mais recentes primeiro

**Imports adicionados:** `eq, desc, and, gte, lte` (drizzle-orm)

---

### 2. Página `/pix/history` (Epic 10.2.6)

**Arquivo criado:** `frontend/src/pages/PixHistory.tsx`
**Rota:** `/pix/history`

**Funcionalidades:**

| Feature | Detalhe |
|---------|---------|
| Tabela de transações | ID, TxID, Valor, Status, Confirmado em, Criado em |
| Badges de status | Confirmado (verde), Pendente (amarelo), outros (vermelho) |
| Filtro de datas | Inputs data inicial e final + botão Filtrar |
| Paginação | Anterior / Próxima — 20 registros por página |
| Estado vazio | Mensagem + dica de como popular dados no sandbox |
| Atualização manual | Botão "Atualizar" com spinner |
| Modo sandbox | Badge amarelo indicando ambiente de testes |

---

### 3. Links PIX no menu lateral (Epic 10.2.7)

**Arquivo modificado:** `frontend/src/pages/DashboardLayout.tsx`

Itens adicionados ao grupo "Geral", após "Pagamentos":

```
├── Pagamentos          /payments          (Wallet)
├── Checkout PIX [Novo] /pix/checkout      (QrCode)    ← novo
└── Histórico PIX       /pix/history       (History)   ← novo
```

Ícones `QrCode` e `History` adicionados ao import do lucide-react.

---

### 4. Dashboard Grafana (Epic 10.6.2)

**Arquivo criado:** `monitoring/grafana-dashboard.json`

**Como importar:**
1. Abrir Grafana → Dashboards → Import
2. Clicar "Upload JSON file" ou colar conteúdo do arquivo
3. Selecionar a data source Prometheus apontando para `<backend-host>/metrics`
4. Salvar

**Painéis incluídos:**

| Seção | Painéis |
|-------|---------|
| Visão Geral | Total Requests, Erros HTTP, Chamadas tRPC, QR PIX Gerados, Pagamentos PIX, Uptime |
| Latência HTTP | p50/p95/p99 `http_request_duration_ms` |
| Latência tRPC | p50/p95/p99 `trpc_call_duration_ms` |
| PIX & Pagamentos | Taxa QR/confirmados por minuto, eventos de comissão |
| Agentes IA | Sessões iniciadas/completadas/falhas, Heap Node.js gauge |
| Requests | Taxa total/sucesso/erro por segundo (timeseries) |

**Configuração recomendada Prometheus:**
```yaml
scrape_configs:
  - job_name: mmn-backend
    static_configs:
      - targets: ['<host>:<port>']
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## Arquivos Modificados

```
backend/src/routers/pixRouter.ts              → listHistory endpoint + imports drizzle
frontend/src/pages/PixHistory.tsx             → NOVO (Epic 10.2.6)
frontend/src/pages/DashboardLayout.tsx        → nav links QrCode + History
frontend/src/App.tsx                          → rota /pix/history + import PixHistory
monitoring/grafana-dashboard.json             → NOVO (Epic 10.6.2)
CHANGELOG.md                                  → entrada v1.5.0-sprint3
```

---

## Critérios de Aceitação Verificados

- [x] `pix.listHistory` retorna dados paginados filtrados da tabela `payments`
- [x] Página `/pix/history` exibe tabela com paginação e filtros funcionais
- [x] Nav lateral mostra "Checkout PIX" (badge Novo) e "Histórico PIX"
- [x] Dashboard Grafana importável com todos os painéis de observabilidade
- [x] Nenhuma dependência nova adicionada ao frontend

---

## Sprint 10.4 — Próximas Prioridades

1. **#10.3.3** Firebase Client SDK — `signInWithPopup` real (Google/Facebook/Apple)
2. **#10.2.8** Integração PSP real OpenPix/Celcoin para QR Code dinâmico
3. **#10.4.1** Alertas Prometheus → Grafana (regras de alerting)
4. **#10.1.2** Validação e build de produção do app Expo (mobile)
5. **#10.5.2** Invalidação de cache em cascata (post-webhook PIX)

**Documento atualizado em:** 2026-05-28
