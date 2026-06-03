/**
 * Subscriptions Domain — modelo comercial atual.
 *
 * Cobre:
 *  - Catálogo do Nexus Partners Pack (Start, Growth, Enterprise)
 *  - Start + confirmação de pagamento
 *  - Upgrade entre planos publica PARTNER_TIER_PROMOTED
 *  - Cancelamento marca status correto e gera event log
 *  - Enterprise exige aprovação/admin contact (não cobra direto)
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

describe("Subscriptions Domain — Nexus Partners Pack", () => {
  beforeEach(() => {
    __resetSubscriptionsForTests();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("catalog", () => {
    it("expõe exatamente os 3 planos oficiais com versão v1.7.0", () => {
      const catalog = getCatalog();
      expect(catalog.version).toBe("1.7.0");
      expect(catalog.pivot).toBe("subscription-commercial");
      expect(catalog.storefront.productName).toBe("Nexus Partners Pack");
      const ids = catalog.plans.map((plan) => plan.id).sort();
      expect(ids).toEqual(["nexus-start", "nexus-growth", "nexus-enterprise"].sort());
    });

    it("Nexus Start tem preço mensal de R$ 100,00", () => {
      const start = getCatalog().plans.find((p) => p.id === "nexus-start");
      expect(start?.priceCents).toBe(10000);
      expect(start?.billingCycle).toBe("monthly");
      expect(start?.partnerTier).toBe("silver");
    });

    it("Nexus Growth é cobrança mensal de R$ 250,00", () => {
      const growth = getCatalog().plans.find((p) => p.id === "nexus-growth");
      expect(growth?.priceCents).toBe(25000);
      expect(growth?.billingCycle).toBe("monthly");
      expect(growth?.partnerTier).toBe("gold");
    });

    it("Nexus Enterprise é sob consulta com governança high-value", () => {
      const enterprise = getCatalog().plans.find((p) => p.id === "nexus-enterprise");
      expect(enterprise?.priceCents).toBeNull();
      expect(enterprise?.billingCycle).toBe("on_request");
      expect(enterprise?.governance.requiresAdminContact).toBe(true);
      expect(enterprise?.governance.highValue).toBe(true);
    });
  });

  describe("startSubscription", () => {
    it("Nexus Start cria assinatura pending_activation com instrução de pagamento PIX", async () => {
      const result = await startSubscription({ userId: 42, planId: "nexus-start", termMonths: 12 });
      expect(result.subscription.status).toBe("pending_activation");
      expect(result.requiresPayment).toBe(true);
      expect(result.requiresAdminApproval).toBe(false);
      expect(result.paymentInstructions?.method).toBe("pix");
      expect(result.paymentInstructions?.amountCents).toBe(10000);
      expect(result.commissionPreview?.rate).toBe(0.06);
    });

    it("Nexus Enterprise cria assinatura aguardando contato do admin", async () => {
      const result = await startSubscription({ userId: 7, planId: "nexus-enterprise", termMonths: 24 });
      expect(result.requiresAdminApproval).toBe(true);
      expect(result.requiresPayment).toBe(false);
      expect(result.paymentInstructions?.method).toBe("on_request");
      expect(result.paymentInstructions?.amountCents).toBeNull();
      expect(result.commissionPreview?.rate).toBe(0.1);
    });

    it("registra evento subscription_started no log", async () => {
      const { subscription } = await startSubscription({ userId: 99, planId: "nexus-growth", termMonths: 12 });
      const events = listSubscriptionEvents(subscription.id);
      expect(events.length).toBe(1);
      expect(events[0].type).toBe("subscription_started");
      expect(events[0].toPlanId).toBe("nexus-growth");
    });
  });

  describe("confirmSubscriptionPayment", () => {
    it("ativa assinatura mensal e calcula data de renovação ~30 dias depois", async () => {
      const { subscription } = await startSubscription({ userId: 1, planId: "nexus-growth", termMonths: 12 });
      const activated = await confirmSubscriptionPayment(subscription.id, "admin");
      expect(activated?.status).toBe("active");
      expect(activated?.activatedAt).toBeInstanceOf(Date);
      expect(activated?.renewsAt).toBeInstanceOf(Date);
    });

    it("ativação enterprise não cria renewsAt", async () => {
      const { subscription } = await startSubscription({ userId: 1, planId: "nexus-enterprise", termMonths: 24 });
      const activated = await confirmSubscriptionPayment(subscription.id);
      expect(activated?.status).toBe("active");
      expect(activated?.renewsAt).toBeNull();
    });
  });

  describe("changeSubscriptionPlan", () => {
    it("upgrade Start → Growth publica PARTNER_TIER_PROMOTED com novo tier gold", async () => {
      const publishSpy = vi
        .spyOn(partnersEvents, "publishPartnerTierPromoted")
        .mockResolvedValue(undefined);

      const { subscription } = await startSubscription({ userId: 11, planId: "nexus-start", termMonths: 24 });
      await confirmSubscriptionPayment(subscription.id);

      const result = await changeSubscriptionPlan({
        subscriptionId: subscription.id,
        toPlanId: "nexus-growth",
        triggeredBy: "user",
      });

      expect(result?.movement).toBe("upgrade");
      expect(result?.subscription.planId).toBe("nexus-growth");
      expect(publishSpy).toHaveBeenCalledTimes(1);
      const call = publishSpy.mock.calls[0][0];
      expect(call.previousTier).toBe("silver");
      expect(call.newTier).toBe("gold");
      expect(call.newCommissionRate).toBe(0.08);
      expect(call.triggeredBy).toBe("subscription_upgrade");
    });

    it("downgrade Growth → Start não publica PARTNER_TIER_PROMOTED", async () => {
      const publishSpy = vi
        .spyOn(partnersEvents, "publishPartnerTierPromoted")
        .mockResolvedValue(undefined);

      const { subscription } = await startSubscription({ userId: 12, planId: "nexus-growth", termMonths: 12 });
      await confirmSubscriptionPayment(subscription.id);

      const result = await changeSubscriptionPlan({
        subscriptionId: subscription.id,
        toPlanId: "nexus-start",
        triggeredBy: "user",
      });

      expect(result?.movement).toBe("downgrade");
      expect(publishSpy).not.toHaveBeenCalled();
    });
  });

  describe("cancelSubscription", () => {
    it("marca status como cancelled e registra event log", async () => {
      const { subscription } = await startSubscription({ userId: 33, planId: "nexus-start", termMonths: 12 });
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
      await startSubscription({ userId: 1, planId: "nexus-start", termMonths: 12 });
      const growth = await startSubscription({ userId: 2, planId: "nexus-growth", termMonths: 12 });
      await confirmSubscriptionPayment(growth.subscription.id);

      const overview = getSubscriptionsOverview();
      expect(overview.metrics.totalSubscriptions).toBe(2);
      expect(overview.metrics.byPlan["nexus-start"]).toBe(1);
      expect(overview.metrics.byPlan["nexus-growth"]).toBe(1);
      expect(overview.metrics.byStatus.pending_activation).toBe(1);
      expect(overview.metrics.byStatus.active).toBe(1);
      expect(overview.metrics.activeMRRCents).toBe(25000);
    });
  });
});
