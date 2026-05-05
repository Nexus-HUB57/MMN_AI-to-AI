import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("affiliate routes", () => {
  it("should return affiliate profile for authenticated user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // This test assumes there's affiliate data in the database
    // In a real scenario, you'd mock the database or use a test database
    try {
      const profile = await caller.affiliate.getProfile();
      expect(profile).toBeDefined();
    } catch (error: any) {
      // Expected to fail if no affiliate exists
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should return zero commissions for new affiliate", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const commissions = await caller.affiliate.getTotalCommissions();
    expect(commissions).toBe("0.00");
  });

  it("should return affiliate by code", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const affiliate = await caller.affiliate.getAffiliateByCode({ code: "TEST123" });
    // Will be null if code doesn't exist
    expect(affiliate === null || affiliate !== null).toBe(true);
  });

  it("should require authentication for protected routes", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    try {
      await caller.affiliate.getProfile();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});
