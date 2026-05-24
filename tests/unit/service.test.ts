import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerDropshippingOrder, updateDropshippingOrderStatus } from "./dropshippingService";
import { products, affiliates, orders, commissions } from "./schema-fields";

// Mock de dados
const mockProduct = { id: 1, price: 10000, commissionPercentage: 10, title: "Produto Teste", marketplace: "MercadoLivre" };
const mockAffiliate = { id: 1, userId: 2, commissionPercentage: 15 };

let mockOrders: any[] = [];
let mockCommissions: any[] = [];
let nextSelectResult: any[] = [];

// Mock do banco de dados simplificado
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockImplementation(() => {
    return Promise.resolve(nextSelectResult);
  }),
  orderBy: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  insert: vi.fn().mockImplementation((table) => ({
    values: vi.fn().mockImplementation((values) => {
      if (table === orders) {
        const newOrder = { id: mockOrders.length + 1, ...values };
        mockOrders.push(newOrder);
        return Promise.resolve({ insertId: newOrder.id });
      }
      if (table === commissions) {
        const newCommission = { id: mockCommissions.length + 1, ...values };
        mockCommissions.push(newCommission);
        return Promise.resolve({ insertId: newCommission.id });
      }
      return Promise.resolve({ insertId: 1 });
    })
  })),
  update: vi.fn().mockImplementation((table) => ({
    set: vi.fn().mockImplementation((values) => ({
      where: vi.fn().mockImplementation((condition) => {
        if (table === orders && mockOrders.length > 0) {
          mockOrders[0].status = values.status;
        }
        return Promise.resolve({ affectedRows: 1 });
      })
    }))
  })),
};

// Mock de db.ts
vi.mock("./db", () => ({
  getDb: vi.fn(async () => mockDb),
  createNotification: vi.fn(async () => {}),
  getAffiliateByUserId: vi.fn(async () => mockAffiliate),
  getUserByEmail: vi.fn(async () => null),
}));

// Mock de commissions.ts
vi.mock("./commissions", () => ({
  calculateConsumptionCommission: vi.fn(async (affiliateId, amount) => {
    const commission = { id: mockCommissions.length + 1, affiliateId, amount: 1000, status: "pending" };
    mockCommissions.push(commission);
    return commission;
  }),
  confirmCommissions: vi.fn(async (ids) => {
    ids.forEach(id => {
      const c = mockCommissions.find(x => x.id === id);
      if (c) c.status = "confirmed";
    });
  }),
  updateAffiliateCommissionTotals: vi.fn(async () => {}),
}));

describe("Dropshipping Service - Fase 8", () => {
  beforeEach(() => {
    mockOrders = [];
    mockCommissions = [];
    nextSelectResult = [mockProduct]; // Default
    vi.clearAllMocks();
  });

  it("deve registrar um novo pedido", async () => {
    const result = await registerDropshippingOrder({
      productId: 1,
      customerName: "Teste",
      customerEmail: "teste@exemplo.com",
      shippingAddress: "Endereço",
      quantity: 1
    }, 2);
    expect(result.id).toBe(1);
    expect(mockOrders.length).toBe(1);
  });

  it("deve rejeitar produto inexistente", async () => {
    nextSelectResult = []; // Simular produto não encontrado
    await expect(registerDropshippingOrder({
      productId: 999,
      customerName: "Teste",
      customerEmail: "teste@exemplo.com",
      shippingAddress: "Endereço",
      quantity: 1
    }, 2)).rejects.toThrow("Produto não encontrado");
  });

  it("deve atualizar status para entregue e gerar comissão", async () => {
    mockOrders.push({ id: 1, affiliateId: 1, amount: 10000, status: "pending", customerEmail: "teste@exemplo.com" });
    nextSelectResult = [mockOrders[0]]; // Para o select do pedido
    
    await updateDropshippingOrderStatus(1, "delivered");
    expect(mockOrders[0].status).toBe("delivered");
    expect(mockCommissions.length).toBe(1);
    expect(mockCommissions[0].status).toBe("confirmed");
  });
});
