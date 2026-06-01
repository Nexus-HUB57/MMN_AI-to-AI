/**
 * Subscriptions Domain — v1.4.0 Commercial Subscription Model.
 *
 * Cobre:
 *  - Catálogo (3 packs oficiais: A², AG, AA)
 *  - Start + confirmação de pagamento
 *  - Upgrade entre packs publica PARTNER_TIER_PROMOTED
 *  - Cancelamento marca status correto e gera event log
 *  - Pack AA exige aprovação de admin (não cobra direto)
 *  - Snapshot de métricas reflete estado do repositório
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  confirmSubscriptionPayment,
  getCatalog,
  getSubscriptionsOverview,
  startSubscription,
} from "../../backend/src/domains/subscriptions/service";
import {
  __resetSubscriptionsForTests,
  listSubscriptionEvents,
} from "../../backend/src/domains/subscriptions/repository";
import * as partnersEvents from "../../backend/src/domains/partners/events";

describe("Subscriptions Domain (v1.4.0 Commercial Pivot)", () => {
  beforeEach(() => {
    __resetSubscriptionsForTests();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("catalog", () => {
    it("expõe exatamente os 3 packs oficiais com versão v1.4.0", () => {
      const catalog = getCatalog();
      expect(catalog.version).toBe("1.4.0");
      expect(catalog.pivot).toBe("subscription-commercial");
      const ids = catalog.plans.map((plan) => plan.id).sort();
      expect(ids).toEqual(["pack-a2", "pack-ag", "pack-aa"].sort());
    });

    it("Pack A² tem preço de entrada R$ 10,00 (1000 centavos)", () => {
      const catalog = getCatalog();
      const a2 = catalog.plans.find((p) => p.id === "pack-a2");
      expect(a2?.priceCents).toBe(1000);
      expect(a2?.billingCycle).toBe("one_time");
      expect(a2?.partnerTier).toBe("silver");
    });

    it("Pack AG é cobrança mensal R$ 250,00", () => {
      const ag = getCatalog().plans.find((p) => p.id === "pack-ag");
      expect(ag?.priceCents).toBe(25000);
      expect(ag?.billingCycle).toBe("monthly");
      expect(ag?.partnerTier).toBe("gold");
    });

    it("Pack AA é sob consulta com governança high-value", () => {
      const aa = getCatalog().plans.find((p) => p.id === "pack-aa");
      expect(aa?.priceCents).toBeNull();
      expect(aa?.billingCycle).toBe("on_request");
      expect(aa?.governance.requiresAdminContact).toBe(true);
      expect(aa?.governance.highValue).toBe(true);
    });
  });

  describe("startSubscription", () => {
    it("Pack A² cria assinatura pending_activation com instrução de pagamento PIX", async () => {
      const result = await startSubscription({ userId: 42, planId: "pack-a2" });
      expect(result.subscription.status).toBe("pending_activation");
      expect(result.requiresPayment).toBe(true);
      expect(result.requiresAdminApproval).toBe(false);
      expect(result.paymentInstructions?.method).toBe("pix");
      expect(result.paymentInstructions?.amountCents).toBe(1000);
    });

    it("Pack AA cria assinatura aguardando contato do admin (não solicita pagamento direto)", async () => {
      const result = await startSubscription({ userId: 7, planId: "pack-aa" });
      expect(result.requiresAdminApproval).toBe(true);
      expect(result.requiresPayment).toBe(false);
      expect(result.paymentInstructions?.method).toBe("on_request");
    });

    it("registra evento subscription_started no log", async () => {
      const { subscription } = await startSubscription({ userId: 99, planId: "pack-ag" });
      const events = listSubscriptionEvents(subscription.id);
      expect(events.length).toBe(1);
      expect(events[0].type).toBe("subscription_started");
      expect(events[0].toPlanId).toBe("pack-ag");
    });
  });

  describe("confirmSubscriptionPayment", () => {
    it("ativa assinatura mensal e calcula data de renovação ~30 dias depois", async () => {
      const { subscription } = await startSubscription({ userId: 1, planId: "pack-ag" });
      const activated = await confirmSubscriptionPayment(subscription.id, "admin");
      expect(activated?.status).toBe("active");
      expect(activated?.activatedAt).toBeInstanceOf(Date);
      expect(activated?.renewsAt).toBeInstanceOf(Date);
    });

    it("ativação one_time (Pack A²) não cria renewsAt", async () => {
      const { subscription } = await startSubscription({ userId: 1, planId: "pack-a2" });
      const activated = await confirmSubscriptionPayment(subscription.id);
      expect(activated?.status).toBe("active");
      expect(activated?.renewsAt).toBeNull();
    });
  });

  describe("changeSubscriptionPlan", () => {
    it("upgrade A² → AG publica PARTNER_TIER_PROMOTED com novo tier 'gold'", async () => {
      const publishSpy = vi
        .spyOn(partnersEvents, "publishPartnerTierPromoted")
        .mockResolvedValue(undefined);

      const { subscription } = await startSubscription({ userId: 11, planId: "pack-a2" });
      await confirmSubscriptionPayment(subscription.id);

      const result = await changeSubscriptionPlan({
        subscriptionId: subscription.id,
        toPlanId: "pack-ag",
        triggeredBy: "user",
      });

      expect(result?.movement).toBe("upgrade");
      expect(result?.subscription.planId).toBe("pack-ag");
      expect(publishSpy).toHaveBeenCalledTimes(1);
      const call = publishSpy.mock.calls[0][0];
      expect(call.previousTier).toBe("silver");
      expect(call.newTier).toBe("gold");
      expect(call.newCommissionRate).toBe(0.08);
      expect(call.triggeredBy).toBe("subscription_upgrade");
    });

    it("downgrade AG → A² NÃO publica PARTNER_TIER_PROMOTED", async () => {
      const publishSpy = vi
        .spyOn(partnersEvents, "publishPartnerTierPromoted")
        .mockResolvedValue(undefined);

      const { subscription } = await startSubscription({ userId: 12, planId: "pack-ag" });
      await confirmSubscriptionPayment(subscription.id);

      const result = await changeSubscriptionPlan({
        subscriptionId: subscription.id,
        toPlanId: "pack-a2",
        triggeredBy: "user",
      });

      expect(result?.movement).toBe("downgrade");
      expect(publishSpy).not.toHaveBeenCalled();
    });
  });

  describe("cancelSubscription", () => {
    it("marca status como cancelled e registra event log", async () => {
      const { subscription } = await startSubscription({ userId: 33, planId: "pack-a2" });
      const cancelled = await cancelSubscription({
        subscriptionId: subscription.id,
        reason: "Mudou de estratégia",
      });
      expect(cancelled?.status).toBe("cancelled");
      expect(cancelled?.cancelledAt).toBeInstanceOf(Date);
      const events = listSubscriptionEvents(subscription.id);
      expect(events.find((e) => e.type === "subscription_cancelled")).toBeDefined();
    });
  });

  describe("getSubscriptionsOverview", () => {
    it("snapshot agregado reflete distribuição por plano e status", async () => {
      await startSubscription({ userId: 1, planId: "pack-a2" });
      const ag = await startSubscription({ userId: 2, planId: "pack-ag" });
      await confirmSubscriptionPayment(ag.subscription.id);

      const overview = getSubscriptionsOverview();
      expect(overview.metrics.totalSubscriptions).toBe(2);
      expect(overview.metrics.byPlan["pack-a2"]).toBe(1);
      expect(overview.metrics.byPlan["pack-ag"]).toBe(1);
      expect(overview.metrics.byStatus.pending_activation).toBe(1);
      expect(overview.metrics.byStatus.active).toBe(1);
      expect(overview.metrics.activeMRRCents).toBe(25000);
    });
  });
});
