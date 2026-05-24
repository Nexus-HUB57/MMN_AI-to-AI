import { describe, expect, it } from "vitest";

import {
  buildCommissionHistory,
  createApproveBatchAudit,
  createUpdateStatusAudit,
  getAffiliateCommissions,
  getCommissionDetails,
  getCommissionStats,
  listCommissions,
} from "../../backend/src/domains/commissions/service";

describe("commissions domain service", () => {
  it("lista comissões filtrando por status", () => {
    const result = listCommissions({
      page: 1,
      limit: 50,
      status: "pending",
    });

    expect(result.commissions.length).toBeGreaterThan(0);
    expect(result.commissions.every((item) => item.status === "pending")).toBe(true);
    expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("retorna detalhes com histórico e resumo de auditoria", () => {
    const result = getCommissionDetails(3);

    expect(result.id).toBe(3);
    expect(result.auditSummary.currentStatus).toBe("paid");
    expect(result.history.map((entry) => entry.action)).toEqual(
      expect.arrayContaining(["created", "confirmed", "paid"]),
    );
  });

  it("cria auditoria para atualização de status com metadata", () => {
    const audit = createUpdateStatusAudit({
      id: 1,
      status: "confirmed",
      performedBy: "admin@nexus.com",
      notes: "validação manual",
    });

    expect(audit.action).toBe("update_status");
    expect(audit.targetId).toBe(1);
    expect(audit.metadata).toMatchObject({ status: "confirmed" });
  });

  it("cria auditoria para aprovação em lote", () => {
    const audit = createApproveBatchAudit({
      ids: [1, 2, 3],
      performedBy: "finance@nexus.com",
      notes: "fechamento semanal",
    });

    expect(audit.action).toBe("approve_batch");
    expect(audit.targetIds).toEqual([1, 2, 3]);
  });

  it("retorna snapshot de stats e consulta por afiliado", () => {
    const stats = getCommissionStats();
    const affiliate = getAffiliateCommissions({ affiliateId: 101, page: 1, limit: 20 });

    expect(stats.total).toBeGreaterThan(stats.pending);
    expect(stats.count.total).toBeGreaterThan(0);
    expect(affiliate.commissions.every((item) => item.affiliateId === 101)).toBe(true);
  });

  it("gera histórico cancelado quando a comissão foi estornada", () => {
    const history = buildCommissionHistory({
      status: "cancelled",
      createdAt: new Date("2026-05-08T13:20:00Z"),
      description: "cancelada",
      confirmedAt: null,
      paidAt: null,
    });

    expect(history.at(-1)?.action).toBe("cancelled");
  });
});
