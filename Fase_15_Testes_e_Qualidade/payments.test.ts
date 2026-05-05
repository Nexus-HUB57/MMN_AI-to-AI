import { describe, it, expect, beforeEach, vi } from "vitest";
import { paymentsRouter } from "./paymentsRouter";
import type { TrpcContext } from "./context";

/**
 * Testes para o Payments Router (Fase 5)
 * Validam fluxo de inserção, identificação, confirmação e comissionamento de pagamentos
 */

// Mock context para admin
const adminContext: TrpcContext = {
  user: {
    id: 1,
    openId: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

// Mock context para afiliado
const affiliateContext: TrpcContext = {
  user: {
    id: 2,
    openId: "affiliate-123",
    name: "Affiliate User",
    email: "affiliate@example.com",
    role: "affiliate",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe("Payments Router - Fase 5", () => {
  describe("insertPayment", () => {
    it("deve inserir um novo pagamento com dados válidos", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.insertPayment({
        affiliateId: 1,
        amount: 10000, // R$ 100,00
        method: "boleto",
        bankCode: "001",
        bankNumber: "12345678",
        paymentDate: new Date(),
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(10000);
      expect(result.status).toBe("pending");
    });

    it("deve rejeitar pagamento com valor inválido", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.insertPayment({
          affiliateId: 1,
          amount: 0,
          method: "boleto",
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar pagamento sem affiliateId quando usuário não é admin", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      expect(
        caller.insertPayment({
          amount: 10000,
          method: "boleto",
        })
      ).rejects.toThrow();
    });
  });

  describe("listPendingPayments", () => {
    it("deve listar pagamentos pendentes", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.listPendingPayments();

      expect(Array.isArray(result)).toBe(true);
    });

    it("deve rejeitar se não for admin", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      expect(caller.listPendingPayments()).rejects.toThrow();
    });
  });

  describe("identifyPayment", () => {
    it("deve identificar um pagamento com um afiliado", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.identifyPayment({
        paymentId: 1,
        affiliateId: 1,
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar se pagamento não existir", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.identifyPayment({
          paymentId: 99999,
          affiliateId: 1,
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar se afiliado não existir", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.identifyPayment({
          paymentId: 1,
          affiliateId: 99999,
        })
      ).rejects.toThrow();
    });
  });

  describe("confirmPayment", () => {
    it("deve confirmar um pagamento e calcular comissões", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.confirmPayment({
        paymentId: 1,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe("confirmed");
      expect(result.confirmedAt).toBeDefined();
    });

    it("deve rejeitar se pagamento não existir", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.confirmPayment({
          paymentId: 99999,
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar se pagamento não estiver identificado", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      // Criar pagamento sem affiliateId
      const payment = await caller.insertPayment({
        amount: 10000,
        method: "boleto",
      });

      expect(
        caller.confirmPayment({
          paymentId: payment.id,
        })
      ).rejects.toThrow();
    });
  });

  describe("cancelPayment", () => {
    it("deve cancelar um pagamento", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.cancelPayment({
        paymentId: 1,
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar se pagamento não existir", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.cancelPayment({
          paymentId: 99999,
        })
      ).rejects.toThrow();
    });
  });

  describe("generateRemunerationStatement", () => {
    it("deve gerar extrato de remuneração para afiliado", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      const result = await caller.generateRemunerationStatement({});

      expect(result).toBeDefined();
      expect(result.affiliateId).toBeDefined();
      expect(result.totalConfirmed).toBeGreaterThanOrEqual(0);
      expect(result.totalPending).toBeGreaterThanOrEqual(0);
      expect(result.totalPaid).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.commissions)).toBe(true);
    });

    it("deve permitir admin ver extrato de qualquer afiliado", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.generateRemunerationStatement({
        affiliateId: 1,
      });

      expect(result).toBeDefined();
      expect(result.affiliateId).toBe(1);
    });

    it("deve rejeitar afiliado tentando ver extrato de outro", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      expect(
        caller.generateRemunerationStatement({
          affiliateId: 999,
        })
      ).rejects.toThrow();
    });
  });

  describe("getDelinquentAffiliates", () => {
    it("deve listar afiliados inadimplentes", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.getDelinquentAffiliates({
        daysOverdue: 30,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("deve rejeitar se não for admin", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      expect(
        caller.getDelinquentAffiliates({
          daysOverdue: 30,
        })
      ).rejects.toThrow();
    });
  });

  describe("getPaymentHistory", () => {
    it("deve listar histórico de pagamentos do afiliado", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      const result = await caller.getPaymentHistory({
        limit: 20,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("deve rejeitar se usuário não tiver perfil de afiliado", async () => {
      const noAffiliateContext: TrpcContext = {
        user: {
          id: 999,
          openId: "no-affiliate",
          name: "No Affiliate",
          email: "no@example.com",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {} as any,
        res: {} as any,
      };

      const caller = paymentsRouter.createCaller(noAffiliateContext);

      expect(
        caller.getPaymentHistory({
          limit: 20,
        })
      ).rejects.toThrow();
    });
  });

  describe("getPaymentDetails", () => {
    it("deve retornar detalhes de um pagamento", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      const result = await caller.getPaymentDetails({
        paymentId: 1,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.relatedCommissions).toBeDefined();
    });

    it("deve rejeitar se pagamento não existir", async () => {
      const caller = paymentsRouter.createCaller(adminContext);

      expect(
        caller.getPaymentDetails({
          paymentId: 99999,
        })
      ).rejects.toThrow();
    });

    it("deve permitir afiliado ver seu próprio pagamento", async () => {
      const caller = paymentsRouter.createCaller(affiliateContext);

      // Assumindo que o pagamento 1 pertence ao afiliado
      const result = await caller.getPaymentDetails({
        paymentId: 1,
      });

      expect(result).toBeDefined();
    });
  });

  describe("Fluxo completo de pagamento", () => {
    it("deve executar fluxo: inserir -> identificar -> confirmar -> extrato", async () => {
      const adminCaller = paymentsRouter.createCaller(adminContext);
      const affiliateCaller = paymentsRouter.createCaller(affiliateContext);

      // 1. Inserir pagamento
      const payment = await adminCaller.insertPayment({
        amount: 50000, // R$ 500,00
        method: "boleto",
        bankCode: "001",
        bankNumber: "87654321",
      });

      expect(payment.status).toBe("pending");

      // 2. Identificar pagamento
      const identified = await adminCaller.identifyPayment({
        paymentId: payment.id,
        affiliateId: 1,
      });

      expect(identified.success).toBe(true);

      // 3. Confirmar pagamento
      const confirmed = await adminCaller.confirmPayment({
        paymentId: payment.id,
      });

      expect(confirmed.status).toBe("confirmed");

      // 4. Gerar extrato
      const statement = await affiliateCaller.generateRemunerationStatement({
        affiliateId: 1,
      });

      expect(statement).toBeDefined();
      expect(statement.totalConfirmed).toBeGreaterThan(0);
    });
  });
});
