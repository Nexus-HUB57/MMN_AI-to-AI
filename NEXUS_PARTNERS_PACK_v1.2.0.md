# Nexus Partners Pack - Release Notes v1.2.0

**Data:** 2026-06-01
**Versão:** 1.2.0
**Status:** ✅ Entregue

---

## Visão Geral

Esta versão conclui a **migração do domínio Partners para a arquitetura
DCI (Domain-Command-Interactor)** alinhada com os demais domínios
(commissions, billing, marketplace, agent-runtime, etc.) e adiciona
**comunicação event-driven nativa** ao barramento de eventos do sistema.

---

## O que mudou em relação à v1.1.0

### 1. Migração do Domínio para Arquitetura DCI

Antes, o Partners vivia em `routers/partnersRouter.ts` (padrão legado)
com `GrowthAlgorithmEngine` acoplado ao router. Agora vive em
`domains/partners/` no padrão de todos os outros domínios:

```
backend/src/domains/partners/
├── types.ts        # tipos públicos (já existia)
├── events.ts       # 🆕 publishers de eventos de Partner
├── repository.ts   # 🆕 facade de dados in-memory com seed
├── service.ts      # 🆕 lógica de negócio + GrowthAlgorithmEngine
├── router.ts       # 🆕 anti-corruption layer
└── index.ts        # 🆕 barrel
```

### 2. Service Layer com `GrowthAlgorithmEngine` Extraído

Toda a lógica de crescimento exponencial foi movida para
`domains/partners/service.ts` como funções puras, testáveis, e sem
acoplamento com o tRPC router:

| Função | Propósito |
|--------|-----------|
| `calculateVolumeMultiplier(tier, volume)` | Multiplicador de volume exponencial |
| `calculateNetworkBonus(referrals, tier)` | Bônus de rede escalonado |
| `calculateRetentionScore(metrics)` | Score de retenção 0–100 |
| `calculateGrowthPotential(tier, volume, growth, rate)` | Projeção preditiva |
| `calculateTieredReferralBonus(referrals)` | Bônus escalonado por faixa |

Casos de uso de domínio:
- `registerPartner(input)` — cria parceiro + publica `PARTNER_REGISTERED`
- `calculatePartnerBenefits(partnerId)` — breakdown completo
- `analyzePartnerGrowth(partnerId)` — retenção + potencial
- `recordPartnerVolume(input)` — registra volume, detecta promoção,
  publica `PARTNER_VOLUME_REGISTERED` e `PARTNER_TIER_PROMOTED`
- `openPartnership(input)` / `approvePartnership()` /
  `rejectPartnership()` / `terminatePartnership()` — ciclo de vida
  da parceria, cada um publicando seu evento

### 3. Eventos de Domínio no Barramento (Event-Driven)

Adicionados 7 novos `DomainEventType` em
`_core/events/eventBus.ts`:

| Evento | Trigger |
|--------|---------|
| `PARTNER_REGISTERED` | Novo parceiro cadastrado |
| `PARTNER_TIER_PROMOTED` | Promoção automática de tier |
| `PARTNER_VOLUME_REGISTERED` | Volume registrado |
| `PARTNERSHIP_CREATED` | Parceria submetida |
| `PARTNERSHIP_APPROVED` | Parceria aprovada por admin |
| `PARTNERSHIP_REJECTED` | Parceria rejeitada |
| `PARTNERSHIP_TERMINATED` | Parceria encerrada |

Com os payloads tipados correspondentes em `eventBus.ts`:
`PartnerRegisteredPayload`, `PartnerTierPromotedPayload`,
`PartnerVolumeRegisteredPayload`, `PartnershipLifecyclePayload`.

Estes eventos habilitam:
- **Webhooks outbound**: o módulo `webhooks/` já existente pode
  consumir `PARTNER_TIER_PROMOTED` e `PARTNERSHIP_APPROVED`.
- **Notificações**: o `notificationService.ts` pode enviar e-mail
  / in-app quando o tier muda.
- **XP / Carreiras**: `XP_GRANTED` ou `CAREER_LEVEL_UP` podem
  ser disparados em cascata a partir de `PARTNER_TIER_PROMOTED`.

### 4. Repository In-Memory com Seed Determinístico

`domains/partners/repository.ts` expõe:

- Records tipados: `PartnerRecord`, `PartnershipRecord`,
  `PartnerVolumeHistoryEntry`, `PartnerTierConfigRecord`.
- Seed com 4 parceiros (1 por tier) + 4 parcerias (3 ativas,
  1 pending) + 5 entradas de histórico de volume.
- Funções de leitura (list/get) e escrita (create/update) que
  funcionam sem DB — útil para jobs, webhooks, testes e modo
  degradado.

### 5. Migration `0004_partners_pack.sql`

Migration Postgres que cria todas as 8 tabelas do schema
`schema-partners.ts` e popula os seeds default:

- `partners` (cadastro)
- `partnerships` (acordos)
- `partner_tier_configs` (configuração editável de tiers)
- `partner_metrics` (snapshots periódicos)
- `partner_benefits` (benefícios granulares)
- `partner_volume_history` (audit trail)
- `growth_algorithms` (4 algoritmos seed)
- `algorithm_executions` (histórico de execução)

### 6. Atualização dos Barrels

- `backend/src/domains/index.ts` agora exporta
  `export * as partners from "./partners";`
- `database/schemas/index.ts` agora exporta
  `export * from "./schema-partners";`

---

## Compatibilidade

✅ O router legado `routers/partnersRouter.ts` continua intacto. O
`domains/partners/router.ts` apenas re-exporta — sem breaking
change.

✅ O schema Drizzle `database/schemas/schema-partners.ts` continua
sendo a fonte primária para o router. O `domains/partners/service.ts`
opera com records próprios in-memory.

✅ Nenhuma rota tRPC existente foi removida ou renomeada.

---

## Como Usar a Nova Camada Service

```ts
import {
  GrowthAlgorithmEngine,
  registerPartner,
  recordPartnerVolume,
  calculatePartnerBenefits,
  analyzePartnerGrowth,
} from "@/domains/partners/service";

// Calcular projeções
const potential = GrowthAlgorithmEngine.calculateGrowthPotential(
  "gold", 12_000, 800, 0.05
);

// Registrar parceiro (emite PARTNER_REGISTERED)
const { partner } = await registerPartner({
  userId: 1234,
  tier: "gold",
});

// Registrar volume (emite PARTNER_VOLUME_REGISTERED,
// e se houver promoção, também PARTNER_TIER_PROMOTED)
await recordPartnerVolume({
  partnerId: partner.id,
  volume: 25_000,
  volumeType: "sale",
  source: "hotmart",
});

// Análise completa
const analysis = analyzePartnerGrowth(partner.id);
```

---

## Próximos Passos (v1.3.0)

- [ ] Migrar o `routers/partnersRouter.ts` para consumir
      `domains/partners/service` ao invés de duplicar lógica.
- [ ] Implementar persistência real (Drizzle) nos casos de uso
      do `service` (substituir in-memory por DB).
- [ ] Disparar `CAREER_LEVEL_UP` automaticamente em
      `PARTNER_TIER_PROMOTED` via subscriber.
- [ ] Adicionar endpoints REST para white-label expôr o
      Partners Pack em tenants.

---

**Mantido por:** Nexus-HUB57
**Licença:** MIT
**Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
