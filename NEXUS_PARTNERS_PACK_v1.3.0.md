# Nexus Partners Pack - Release Notes v1.3.0

**Data:** 2026-06-01
**Versão:** 1.3.0
**Status:** ✅ Entregue

---

## Visão Geral

Esta versão **fecha a cadeia event-driven** iniciada em v1.2.0 e adiciona
**cobertura de testes unitários** completa para o domínio Partners. Com
isto, o `PARTNER_TIER_PROMOTED` deixa de ser um sinal órfão e passa a
alimentar automaticamente o ciclo de XP e progressão de carreira do
parceiro — a primeira reação automática entre domínios do Nexus
Partners Pack.

---

## O que mudou em relação à v1.2.0

### 1. Subscriber `PARTNER_TIER_PROMOTED` → `XP_GRANTED` + `CAREER_LEVEL_UP`

Novo módulo `backend/src/domains/partners/subscribers.ts` que:

- Assina `PARTNER_TIER_PROMOTED` no barramento de eventos.
- Concede XP ao `userId` do parceiro promovido, baseado em uma tabela
  configurável de recompensas por tier:

  | Promoção | XP concedido |
  |----------|-------------:|
  | silver → gold | 500 |
  | gold → platinum | 1.500 |
  | platinum → diamond | 5.000 |

- Publica `XP_GRANTED` (`source: "milestone"`,
  `reason: "partner_tier_promotion:silver->gold"`, etc.) com
  `correlationId` / `causationId` propagados.
- Se o XP acumulado **cruza um threshold de nível**, publica também
  `CAREER_LEVEL_UP` com o delta de nível, rank anterior/novo e os
  benefícios desbloqueados.

| Nível | XP cumulativo | Rank |
|------:|--------------:|------|
| 1 | 0 | Affiliate |
| 2 | 500 | Partner |
| 3 | 2.000 | Pro Partner |
| 4 | 7.000 | Elite Partner |
| 5 | 20.000 | Master Partner |
| 6 | 50.000 | Diamond Partner |

#### API

```ts
import { registerPartnersEventHandlers } from "@/domains/partners";

// Chamado uma vez no boot (ex.: domains/index.ts) ou no app init.
const handle = registerPartnersEventHandlers();

// No graceful shutdown:
handle.dispose();
```

#### Estado de XP

Mantido em memória (`Map<userId, { totalXp, level, rank }>`),
consistente com o padrão in-memory do domínio. Helpers exportados:

- `getPartnerXpState(userId)`
- `resetPartnerXpState()` (útil em testes e em jobs de reconciliação
  que venham a ser introduzidos).

Quando a persistência real do XP chegar (v1.4.0), o cache pode ser
derivado do banco sem alterar a forma dos eventos publicados.

### 2. `repository.ts` — função `resetPartnerRepository()`

Adicionada função exportada que restaura o estado in-memory (partners,
partnerships, volume history) ao seed determinístico e zera os
contadores de ID. Habilita testes isolados e futuros jobs de
reconciliação.

### 3. Barrel atualizado

`backend/src/domains/partners/index.ts` agora exporta também o módulo
`subscribers`.

### 4. Cobertura de testes unitários

Novo arquivo `tests/unit/partnersDomainService.test.ts` com **30
testes** cobrindo:

| Bloco | # testes | O que cobre |
|-------|---------:|-------------|
| `GrowthAlgorithmEngine` | 14 | multiplicador de volume (base, crescimento, cap), bônus de rede (threshold e diamond), score de retenção, projeção de crescimento (com e sem crescimento), bônus escalonado de indicação |
| `getPartnerStatsSnapshot` | 1 | coerência do snapshot agregado |
| `calculatePartnerBenefits` | 2 | null para inexistente + breakdown válido |
| `analyzePartnerGrowth` | 1 | retention + potential + benefits |
| `recordPartnerVolume` (eventos) | 2 | `PARTNER_VOLUME_REGISTERED` + `PARTNER_TIER_PROMOTED` ao cruzar threshold |
| Lifecycle de partnerships (eventos) | 4 | open / approve / reject / terminate publicam seus eventos |
| Helpers de XP | 4 | `levelForXp`, `rankForLevel`, `rewardForPromotion`, constantes |
| Subscriber end-to-end | 3 | chain `PARTNER_TIER_PROMOTED` → `XP_GRANTED` → `CAREER_LEVEL_UP`, idempotência por `userId` |

Resultado: `vitest run` para a suite do Partners Pack: **30/30 ✓**.

---

## Compatibilidade

✅ Nenhum evento existente foi removido ou renomeado. Apenas
acrescentamos **2 novos consumers** (XP_GRANTED, CAREER_LEVEL_UP) ao
fluxo de PARTNER_TIER_PROMOTED — eles são aditivos.

✅ O router legado `routers/partnersRouter.ts` continua intacto.

✅ Nenhuma rota tRPC existente foi removida ou renomeada.

---

## Decisões de design

### Por que manter o estado de XP em memória (e não em DB)?

Consistência com o resto do `domains/partners/*` que já opera in-memory
com seed determinístico. A migração para DB é uma mudança maior (toque
no schema Drizzle, migrations, transações, etc.) e está prevista para
v1.4.0. Os eventos publicados **são a API estável** — quando o estado
persistir em DB, o subscriber passa a ler/escrever lá sem mudar a forma
dos eventos.

### Por que uma tabela de XP em código, não em DB?

A tabela de recompensas por tier é **lógica de negócio pura** que muda
raro. Mantê-la em código permite que testes e o subscriber compartilhem
o mesmo array de constantes. Para a Fase 11+, podemos expor a tabela
em `partner_tier_configs` (já existe) e ler daí dinamicamente.

### Por que `correlationId` e `causationId` no metadata?

Habilita tracing distribuído: um `CAREER_LEVEL_UP` causado por uma
promoção de tier traz a referência ao evento original. Isso vai
alimentar a observabilidade prevista na Epic 10.6 do roadmap.

---

## Próximos Passos (v1.4.0)

- [ ] **Migrar o `routers/partnersRouter.ts`** para consumir
      `domains/partners/service` ao invés de duplicar lógica (hoje há
      dois `GrowthAlgorithmEngine`, um em cada arquivo).
- [ ] **Persistência real (Drizzle)** nos casos de uso do `service`
      (substituir in-memory por DB).
- [ ] **Persistir o XP em DB** e derivar `xpStateByUserId` daí.
- [ ] **Endpoints REST** para white-label expor o Partners Pack em
      tenants (Epic 10.7 do roadmap).
- [ ] **Subscriber para `PARTNER_VOLUME_REGISTERED`** que dispara
      webhook outbound automaticamente.

---

## Checklist de validação

- [x] `tsc --noEmit` — sem novos erros introduzidos pelo Partners Pack
      (erros pré-existentes em outros domínios não relacionados).
- [x] `vitest run tests/unit/partnersDomainService.test.ts` — 30/30 ✓.
- [x] Barrel `domains/partners/index.ts` re-exporta o novo módulo.
- [x] Sem alteração no schema Drizzle ou em rotas tRPC existentes.
- [x] Sem novos peer-dependencies em `package.json`.

---

**Mantido por:** Nexus-HUB57
**Licença:** MIT
**Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
