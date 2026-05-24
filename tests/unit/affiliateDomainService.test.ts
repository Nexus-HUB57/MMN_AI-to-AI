import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AffiliateAlreadyExistsError,
  AffiliateCreationFailedError,
  SponsorNotFoundError,
  registerAffiliate,
} from "../../backend/src/domains/affiliate/service";
import {
  DomainEventType,
  eventBus,
} from "../../backend/src/_core/events/eventBus";

function buildDeps(overrides: Partial<Parameters<typeof registerAffiliate>[1]> = {}) {
  const inserted: Record<string, any> = {};

  const baseDeps: Parameters<typeof registerAffiliate>[1] = {
    getAffiliateByUserId: vi.fn(async () => null),
    getAffiliateByCode: vi.fn(async () => ({ id: 99, userId: 999, status: "active" })),
    getAgentByUserId: vi.fn(async () => null),
    insertAffiliate: vi.fn(async (params) => {
      inserted.affiliate = params;
    }),
    insertNetworkLink: vi.fn(async (params) => {
      inserted.network = params;
    }),
    createAgent: vi.fn(async (params) => {
      inserted.agent = params;
    }),
    getUserById: vi.fn(async (userId: number) => ({
      id: userId,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
    })),
    generateAffiliateCode: () => "abc123def456",
  };

  // garante que o segundo getAffiliateByUserId retorna o registro criado
  let firstCall = true;
  baseDeps.getAffiliateByUserId = vi.fn(async (userId: number) => {
    if (firstCall) {
      firstCall = false;
      return null;
    }
    return {
      id: 7,
      userId,
      affiliateCode: "ABC123DEF456",
      status: "active",
    };
  }) as typeof baseDeps.getAffiliateByUserId;

  return { deps: { ...baseDeps, ...overrides }, inserted };
}

describe("affiliate domain service - registerAffiliate", () => {
  let publishedTypes: string[] = [];
  let subId: string;

  beforeEach(() => {
    publishedTypes = [];
    subId = eventBus.subscribe(DomainEventType.AFFILIATE_REGISTERED, (event) => {
      publishedTypes.push(event.type);
    });
    const subActivated = eventBus.subscribe(DomainEventType.AFFILIATE_ACTIVATED, (event) => {
      publishedTypes.push(event.type);
    });
    // store activated id on the array to clean up later
    (publishedTypes as any).__activatedSubId = subActivated;
  });

  afterEach(() => {
    eventBus.unsubscribe(subId);
    eventBus.unsubscribe((publishedTypes as any).__activatedSubId);
  });

  it("registra afiliado, cria agente e publica eventos", async () => {
    const { deps, inserted } = buildDeps();
    const result = await registerAffiliate(
      {
        userId: 42,
        userName: "Tester",
        userEmail: null,
        sponsorCode: "SPON123",
        commissionPercentage: 10,
      },
      deps,
    );

    expect(result.affiliate.id).toBe(7);
    expect(result.result.affiliateCode).toBe("ABC123DEF456");
    expect(result.result.createdAgent).toBe(true);
    expect(inserted.affiliate).toMatchObject({
      userId: 42,
      affiliateCode: "ABC123DEF456",
      sponsorId: 99,
      commissionPercentage: 10,
    });
    expect(inserted.network).toMatchObject({ userId: 42, sponsorUserId: 999, level: 1 });
    expect(publishedTypes).toEqual(
      expect.arrayContaining(["AffiliateRegistered", "AffiliateActivated"]),
    );
  });

  it("retorna existente sem reinserir quando afiliado já existe", async () => {
    const existing = { id: 1, affiliateCode: "OLD", status: "active" };
    const { deps } = buildDeps({
      getAffiliateByUserId: vi.fn(async () => existing),
    });

    await expect(
      registerAffiliate(
        {
          userId: 1,
          userName: "x",
          userEmail: null,
          sponsorCode: "SPON",
          commissionPercentage: 10,
        },
        deps,
      ),
    ).rejects.toBeInstanceOf(AffiliateAlreadyExistsError);
  });

  it("lança SponsorNotFoundError quando sponsor não existe", async () => {
    const { deps } = buildDeps({
      getAffiliateByCode: vi.fn(async () => null),
    });

    await expect(
      registerAffiliate(
        {
          userId: 2,
          userName: "x",
          userEmail: null,
          sponsorCode: "INVALID",
          commissionPercentage: 10,
        },
        deps,
      ),
    ).rejects.toBeInstanceOf(SponsorNotFoundError);
  });

  it("lança AffiliateCreationFailedError quando insert não persiste", async () => {
    const { deps } = buildDeps({
      // simula insert sem retorno: getAffiliateByUserId retorna null nos dois calls
      getAffiliateByUserId: vi.fn(async () => null),
    });

    await expect(
      registerAffiliate(
        {
          userId: 3,
          userName: "x",
          userEmail: null,
          sponsorCode: "SPON",
          commissionPercentage: 10,
        },
        deps,
      ),
    ).rejects.toBeInstanceOf(AffiliateCreationFailedError);
  });
});
