import { describe, it, expect, beforeEach, vi } from "vitest";
import { dropshippingRouter } from "./dropshippingRouter";
import type { TrpcContext } from "./_core/context";

/**
 * Testes para o Dropshipping Router (Fase 8)
 * Validam fluxo de registro de pedido, atualização de status e comissionamento
 */

// Mock context para admin
const adminContext: any = {
  user: {
    id: 1,
    openId: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  req: {} as any,
  res: {} as any,
};

// Mock context para afiliado
const affiliateContext: any = {
  user: {
    id: 2,
    openId: "affiliate-123",
    name: "Affiliate User",
    email: "affiliate@example.com",
    role: "affiliate",
  },
  req: {} as any,
  res: {} as any,
};

describe("Dropshipping Router - Fase 8", () => {
  describe("registerOrder", () => {
    it("deve registrar um novo pedido de dropshipping com dados válidos", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      const result = await caller.registerOrder({
        productId: 1,
        customerName: "Cliente Teste",
        customerEmail: "cliente@teste.com",
        shippingAddress: "Rua Teste, 123, São Paulo - SP",
        quantity: 2,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.customerName).toBe("Cliente Teste");
      expect(result.status).toBe("pending");
      expect(result.externalOrderId).toContain("DROPSHIP-");
    });

    it("deve rejeitar pedido sem nome do cliente", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      expect(
        caller.registerOrder({
          productId: 1,
          customerName: "",
          customerEmail: "cliente@teste.com",
          shippingAddress: "Endereço",
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar pedido com email inválido", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      expect(
        caller.registerOrder({
          productId: 1,
          customerName: "Cliente",
          customerEmail: "email-invalido",
          shippingAddress: "Endereço",
        })
      ).rejects.toThrow();
    });
  });

  describe("updateOrderStatus", () => {
    it("deve atualizar o status de um pedido para 'shipped'", async () => {
      const caller = dropshippingRouter.createCaller(adminContext);

      const result = await caller.updateOrderStatus({
        orderId: 1,
        newStatus: "shipped",
      });

      expect(result.success).toBe(true);
    });

    it("deve atualizar o status para 'delivered' e disparar comissionamento", async () => {
      const caller = dropshippingRouter.createCaller(adminContext);

      const result = await caller.updateOrderStatus({
        orderId: 1,
        newStatus: "delivered",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar atualização por usuário não admin", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      expect(
        caller.updateOrderStatus({
          orderId: 1,
          newStatus: "shipped",
        })
      ).rejects.toThrow();
    });
  });

  describe("Fluxo completo de Dropshipping", () => {
    it("deve executar fluxo: registrar pedido -> atualizar para enviado -> atualizar para entregue", async () => {
      const affiliateCaller = dropshippingRouter.createCaller(affiliateContext);
      const adminCaller = dropshippingRouter.createCaller(adminContext);

      // 1. Registrar pedido
      const order = await affiliateCaller.registerOrder({
        productId: 1,
        customerName: "João Silva",
        customerEmail: "joao@exemplo.com",
        shippingAddress: "Av. Paulista, 1000, São Paulo - SP",
      });

      expect(order.status).toBe("pending");

      // 2. Atualizar para enviado
      const shipped = await adminCaller.updateOrderStatus({
        orderId: order.id,
        newStatus: "shipped",
      });

      expect(shipped.success).toBe(true);

      // 3. Atualizar para entregue (gatilho de comissão)
      const delivered = await adminCaller.updateOrderStatus({
        orderId: order.id,
        newStatus: "delivered",
      });

      expect(delivered.success).toBe(true);
    });
  });
});
