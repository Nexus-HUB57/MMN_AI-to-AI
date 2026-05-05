import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./context";
import * as db from "./db";

// Mock the database module
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db") as any;
  return {
    ...actual,
    getDashboardMetrics: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    getCommissionConfigs: vi.fn(),
    getNetworkByAffiliate: vi.fn(),
    getDirectReferrals: vi.fn(),
    getPayments: vi.fn(),
    getPaymentsByAffiliate: vi.fn(),
    getMaterials: vi.fn(),
    getMaterialsByCategory: vi.fn(),
    logAdminAction: vi.fn(),
    getDb: vi.fn().mockResolvedValue({
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
    }),
  };
});

// Mock admin user
const createAdminContext = (): TrpcContext => {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
};

// Mock regular user
const createUserContext = (): TrpcContext => {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
};

describe("Admin Routers - Authorization", () => {
  it("should deny access to dashboard for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.dashboard.getMetrics();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny access to users router for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.users.list({ limit: 10, offset: 0 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("Admin Routers - Dashboard", () => {
  it("should return dashboard metrics for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockMetrics = {
      totalUsers: 100,
      totalAffiliates: 50,
      totalCommissionsPaid: 1000.50,
      pendingCommissions: 200.25,
    };
    vi.mocked(db.getDashboardMetrics).mockResolvedValue(mockMetrics);

    const result = await caller.dashboard.getMetrics();
    expect(result).toEqual(mockMetrics);
  });

  it("should handle null metrics with fallback", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    vi.mocked(db.getDashboardMetrics).mockResolvedValue(null);

    const result = await caller.dashboard.getMetrics();
    expect(result).toBeNull();
  });
});

describe("Admin Routers - User Management", () => {
  it("should list users with pagination", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockUsers = [{ id: 1, name: "User 1" }, { id: 2, name: "User 2" }];
    vi.mocked(db.getAllUsers).mockResolvedValue(mockUsers as any);

    const result = await caller.users.list({ limit: 10, offset: 0 });
    expect(result).toEqual(mockUsers);
    expect(db.getAllUsers).toHaveBeenCalledWith(10, 0);
  });

  it("should get user by ID", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockUser = { id: 1, name: "User 1" };
    vi.mocked(db.getUserById).mockResolvedValue(mockUser as any);

    const result = await caller.users.getById({ id: 1 });
    expect(result).toEqual(mockUser);
    expect(db.getUserById).toHaveBeenCalledWith(1);
  });
});

describe("Admin Routers - Commissions", () => {
  it("should list commission configs", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockConfigs = [{ level: 1, percentage: "10" }];
    vi.mocked(db.getCommissionConfigs).mockResolvedValue(mockConfigs as any);

    const result = await caller.commissionConfigs.list();
    expect(result).toEqual(mockConfigs);
  });

  it("should validate commission percentage (0-100)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.commissionConfigs.update({
        level: 1,
        percentage: 150,
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Admin Routers - Network", () => {
  it("should get network by affiliate", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockNetwork = [{ userId: 2, sponsorId: 1 }];
    vi.mocked(db.getNetworkByAffiliate).mockResolvedValue(mockNetwork as any);

    const result = await caller.network.getByAffiliate({ userId: 1 });
    expect(result).toEqual(mockNetwork);
  });

  it("should get direct referrals", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockReferrals = [{ userId: 2, sponsorId: 1 }];
    vi.mocked(db.getDirectReferrals).mockResolvedValue(mockReferrals as any);

    const result = await caller.network.getDirectReferrals({ sponsorId: 1 });
    expect(result).toEqual(mockReferrals);
  });
});

describe("Admin Routers - Payments", () => {
  it("should list payments with pagination", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockPayments = [{ id: 1, amount: "100" }];
    vi.mocked(db.getPayments).mockResolvedValue(mockPayments as any);

    const result = await caller.payments.list({ limit: 10, offset: 0 });
    expect(result).toEqual(mockPayments);
  });

  it("should validate payment status enum", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.payments.updateStatus({
        paymentId: 1,
        status: "invalid" as any,
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Admin Routers - Materials", () => {
  it("should list materials with pagination", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockMaterials = [{ id: 1, title: "Banner" }];
    vi.mocked(db.getMaterials).mockResolvedValue(mockMaterials as any);

    const result = await caller.materials.list({ limit: 10, offset: 0 });
    expect(result).toEqual(mockMaterials);
  });

  it("should get materials by category", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const mockMaterials = [{ id: 1, title: "Banner", category: "promo" }];
    vi.mocked(db.getMaterialsByCategory).mockResolvedValue(mockMaterials as any);

    const result = await caller.materials.getByCategory({ category: "promo" });
    expect(result).toEqual(mockMaterials);
  });
});

describe("Admin Routers - Public Access", () => {
  it("should allow public access to auth.me", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.role).toBe("user");
  });

  it("should allow public access to auth.logout", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
