# Nexus Partners Pack - Release Notes v1.3.1

**Data:** 2026-06-01
**Versão:** 1.3.1
**Status:** ✅ Entregue
**Compatibilidade:** 100% backward-compatible com v1.3.0

---

## Visão Geral

Esta é uma sub-release **incremental e estável** da v1.3.0. Não introduz
novas funcionalidades de negócio; entrega duas correções/adições que
tornam o event chain `PARTNER_TIER_PROMOTED → XP_GRANTED + CAREER_LEVEL_UP`
**observável e auditável** — essencial para um protótipo agentic de
verdade.

A v1.3.0 fechou a cadeia event-driven, mas deixou dois buracos:

1. **Sem audit trail de XP**: o estado agregado
   (`xpStateByUserId`) só guardava o último total. Não havia como
   responder "por que este usuário tem 2.000 XP?" ou reconstruir a
   história a partir dos eventos.
2. **Silent drop**: quando o subscriber não conseguia resolver o
   `partnerId` (parceiro inexistente, id inválido, ou promoção sem
   reward), o evento era descartado em silêncio. Para um sistema
   agentic, isso é inaceitável — observabilidade zero.

A v1.3.1 fecha os dois.

---

## O que mudou em relação à v1.3.0

### 1. XP Ledger — audit trail de concessões de XP

Novo módulo no `domains/partners/subscribers.ts` que registra **cada
concessão de XP** num ledger global em memória.

```ts
export interface XpLedgerEntry {
  sequence: number;             // 1-based, monotônico
  userId: string;
  partnerId: number;
  amount: number;
  reason: string;               // ex: "partner_tier_promotion:silver->gold"
  source: "activity" | "sale" | "milestone" | "bonus";
  previousTotal: number;
  newTotal: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  previousTier: PartnerTier;
  newTier: PartnerTier;
  correlationId?: string;       // propagado do evento original
  causationId?: string;         // id do evento que originou a concessão
  sourceEventType: DomainEventType;
  grantedAt: string;            // ISO-8601
}
```

**API**

```ts
import {
  getPartnerXpHistory,
  getXpLedgerStats,
  listAllXpLedger,
  type XpLedgerEntry,
  type XpLedgerStats,
} from "@/domains/partners";

// História de um usuário (na ordem cronológica)
const history: XpLedgerEntry[] = getPartnerXpHistory("user_123");

// Stats agregadas
const stats: XpLedgerStats = getXpLedgerStats("user_123");
//   { userId, totalGrants, totalXp, firstGrantAt, lastGrantAt,
//     levelUps, lastGrantAmount }

// Snapshot global (read-only) — útil para replay/auditoria
const all: ReadonlyArray<XpLedgerEntry> = listAllXpLedger();
```

### 2. Silent-drop eliminado — `SYSTEM_ALERT` no caminho do erro

Quando o subscriber de `PARTNER_TIER_PROMOTED` não consegue processar
o evento, **publica um `SYSTEM_ALERT`** ao invés de descartar em
silêncio. Três casos diagnosticados:

| Caso | Diagnostic | Severity | Título do alerta |
|------|-----------|----------|------------------|
| Promoção para `silver` (sem reward) | `{ kind: "no_reward", tier }` | `info` | "Partners XP chain: no reward for tier" |
| `partnerId` não-finito | `{ kind: "invalid_partner_id", rawPartnerId }` | `warning` | "Partners XP chain: invalid partnerId" |
| Parceiro inexistente no repositório | `{ kind: "partner_not_found", partnerId }` | `warning` | "Partners XP chain: partner not found" |

Cada alerta carrega `sourceDomain: "partners"`, o `diagnostic`
estruturado no `metadata`, e propaga `correlationId` / `causationId`
do evento original — preservando a cadeia de tracing.

### 3. `applyTierPromotionXpWithDiagnostic()`

Nova função que devolve diagnósticos estruturados:

```ts
type TierPromotionXpDiagnostic =
  | { kind: "no_reward"; tier: PartnerTier }
  | { kind: "invalid_partner_id"; rawPartnerId: string }
  | { kind: "partner_not_found"; partnerId: number };

function applyTierPromotionXpWithDiagnostic(
  payload: PartnerTierPromotedPayload,
): { result: GrantedXpResult; diagnostic: null }
 | { result: null; diagnostic: TierPromotionXpDiagnostic };
```

A função original `applyTierPromotionXp()` continua existindo com a
mesma assinatura (`GrantedXpResult | null`) — zero breaking change
para callers existentes.

### 4. `resetPartnerXpState()` agora limpa também o ledger

Consistência: um único helper para resetar todo o estado in-memory
do XP (agregado + ledger). Os testes existentes continuam usando
exatamente o mesmo setup.

### 5. Cobertura de testes unitários

| Bloco | # testes | O que cobre |
|-------|---------:|-------------|
| XP Ledger | 6 | registro com deltas corretos; histórico cronológico; `getXpLedgerStats` agrega; zeros para usuário sem grants; `listAllXpLedger` multi-user; `resetPartnerXpState` limpa ledger |
| Silent-drop eliminado | 5 | `SYSTEM_ALERT` para `partnerId` inválido; `SYSTEM_ALERT` para partner inexistente; `SYSTEM_ALERT` (info) para silver; `applyTierPromotionXpWithDiagnostic` para todos os 3 casos; sucesso devolve `result` + `diagnostic: null` |

**Total: 41/41 ✓** (30 da v1.3.0 + 11 novos).

---

## Compatibilidade com a v1.3.0

✅ **Nenhum evento existente removido ou renomeado**. Apenas
acrescentamos **1 novo consumer** (`SYSTEM_ALERT`) ao fluxo de
`PARTNER_TIER_PROMOTED` — ele é puramente aditivo e só é disparado
em caminhos de erro.

✅ **O router legado `routers/partnersRouter.ts` continua intacto**.

✅ **Nenhuma rota tRPC existente foi removida ou renomeada**.

✅ **A função `applyTierPromotionXp()` mantém a mesma assinatura**.

✅ **`resetPartnerRepository()` continua sendo o reset de Parceiros/Parcerias/Volume; `resetPartnerXpState()` é o reset de XP (agregado + ledger).**

✅ **Nenhum schema Drizzle alterado**. Nenhuma migração necessária.

---

## Decisões de design

### Por que ledger em memória, não em DB?

Consistência com o resto de `domains/partners/*` (in-memory com seed
determinístico). A migração para DB é uma mudança maior (schema
Drizzle, migrations, transações) e está prevista para v1.4.0.
**Os helpers do ledger são a API estável** — quando a persistência
real chegar, `getPartnerXpHistory` pode ler de uma tabela
`xp_grants` e a forma do retorno permanece a mesma.

### Por que um array global em vez de `Map<userId, XpLedgerEntry[]>`?

Três razões:
1. **Ordem cronológica exata** — preservada naturalmente por um
   array, sem precisar de `Map` ordenada.
2. **Replay/auditoria globais** — `listAllXpLedger()` é trivial
   sobre um array.
3. **Sequence monotônico** — mais simples de atribuir em push num
   array.

Para queries por usuário, `getPartnerXpHistory` faz `filter` em
O(n) — aceitável para o volume esperado em memória. Quando migrar
para DB, o índice `(user_id, sequence)` cuida disso.

### Por que `SYSTEM_ALERT` e não um log silencioso?

O `SYSTEM_ALERT` é **consumível**:
- Pode acionar uma notificação (`domains/notifications`).
- Pode ser exibido no dashboard de saúde do sistema.
- Pode acionar um alerta no PagerDuty/OpsGenie.
- Pode ser replayed por agentes que precisam auditar a integridade
  da cadeia event-driven.

Um `console.warn` não seria nenhum desses.

### Por que `severity: "info"` para o caso "no_reward"?

Promover para `silver` é uma operação administrativa rara (downgrade
de tier). O evento é informativo, não uma falha. Mantém o sinal
claro: warning = algo pode estar errado; info = "tudo certo, só não
houve XP".

---

## Próximos Passos (v1.4.0)

Itens inalterados da v1.3.0 + um novo item trazido pela v1.3.1:

- [ ] **Migrar o `routers/partnersRouter.ts`** para consumir
      `domains/partners/service` ao invés de duplicar lógica.
- [ ] **Persistência real (Drizzle)** nos casos de uso do `service`
      (substituir in-memory por DB).
- [ ] **Persistir o XP e o ledger em DB** — tabela `xp_grants`
      com índice `(user_id, sequence)`; `xpStateByUserId` derivado
      daí. A API do ledger permanece a mesma.
- [ ] **Endpoints REST** para white-label expor o Partners Pack
      (`getPartnerXpState`, `getPartnerXpHistory` já implementados,
      falta expor via tRPC).
- [ ] **Subscriber para `PARTNER_VOLUME_REGISTERED`** que dispara
      webhook outbound automaticamente.
- [ ] **Consumer de `SYSTEM_ALERT` com `sourceDomain: "partners"`**
      que dispara uma notificação para o time de plataforma (a
      infra já existe; basta um subscriber).

---

## Checklist de validação

- [x] `vitest run tests/unit/partnersDomainService.test.ts` —
      **41/41 ✓** (30 originais + 11 novos).
- [x] `tsc --noEmit` focado nos arquivos modificados (`subscribers.ts`,
      `events.ts`, `repository.ts`, `types.ts`, test file) — sem
      novos erros introduzidos pela v1.3.1.
- [x] Barrel `domains/partners/index.ts` continua re-exportando o
      `subscribers` (sem mudança; novas funções são exportadas
      individualmente do `subscribers.ts`).
- [x] Sem alteração no schema Drizzle ou em rotas tRPC existentes.
- [x] Sem novos peer-dependencies em `package.json`.
- [x] Compatibilidade 100% com a v1.3.0 — API pública do domínio
      Partners inalterada para callers existentes.

---

**Mantido por:** Nexus-HUB57
**Licença:** MIT
**Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
