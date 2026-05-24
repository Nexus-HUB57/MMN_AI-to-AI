/**
 * Affiliate domain service — Fase Beta continuation.
 *
 * Encapsula as regras de negócio mais sensíveis do registro de afiliados sem
 * reescrever o acesso a dados (que continua chegando via callbacks injetados),
 * permitindo testes determinísticos e reuso pelo `mmnRouter` e por workers
 * futuros.
 */

import { nanoid } from "nanoid";

import {
  publishAffiliateActivated,
  publishAffiliateRegistered,
} from "./events";
import {
  DEFAULT_AFFILIATE_CONTENT_STRATEGY,
  type AffiliateRegistrationContext,
  type AffiliateRegistrationResult,
} from "./types";

export interface AffiliateRegistrationDeps {
  getAffiliateByUserId: (userId: number) => Promise<any>;
  getAffiliateByCode: (code: string) => Promise<any>;
  getAgentByUserId: (userId: number) => Promise<any>;
  insertAffiliate: (params: {
    userId: number;
    affiliateCode: string;
    sponsorId: number;
    commissionPercentage: number;
  }) => Promise<void>;
  insertNetworkLink: (params: {
    userId: number;
    sponsorUserId: number;
    level: number;
  }) => Promise<void>;
  createAgent: (params: {
    userId: number;
    name: string;
    contentStrategy: string;
  }) => Promise<void>;
  getUserById: (userId: number) => Promise<{
    id: number;
    email: string | null;
    name: string | null;
  } | null>;
  generateAffiliateCode?: () => string;
}

export class AffiliateAlreadyExistsError extends Error {
  constructor(public readonly existing: any) {
    super("Affiliate already exists");
    this.name = "AffiliateAlreadyExistsError";
  }
}

export class SponsorNotFoundError extends Error {
  constructor() {
    super("Sponsor affiliate not found");
    this.name = "SponsorNotFoundError";
  }
}

export class AffiliateCreationFailedError extends Error {
  constructor() {
    super("Failed to create affiliate profile");
    this.name = "AffiliateCreationFailedError";
  }
}

/**
 * Executa o registro completo de um afiliado: validação de patrocinador,
 * inserção do perfil, criação do vínculo de rede, criação opcional do agente
 * e publicação dos eventos `AffiliateRegistered` / `AffiliateActivated`.
 */
export async function registerAffiliate(
  context: AffiliateRegistrationContext,
  deps: AffiliateRegistrationDeps,
): Promise<{ affiliate: any; result: AffiliateRegistrationResult }> {
  const existingAffiliate = await deps.getAffiliateByUserId(context.userId);
  if (existingAffiliate) {
    throw new AffiliateAlreadyExistsError(existingAffiliate);
  }

  const sponsor = await deps.getAffiliateByCode(context.sponsorCode);
  if (!sponsor) {
    throw new SponsorNotFoundError();
  }

  const affiliateCode = (
    deps.generateAffiliateCode ? deps.generateAffiliateCode() : nanoid(12)
  ).toUpperCase();

  await deps.insertAffiliate({
    userId: context.userId,
    affiliateCode,
    sponsorId: sponsor.id,
    commissionPercentage: context.commissionPercentage,
  });

  await deps.insertNetworkLink({
    userId: context.userId,
    sponsorUserId: sponsor.userId,
    level: 1,
  });

  const existingAgent = await deps.getAgentByUserId(context.userId);
  let createdAgent = false;
  if (!existingAgent) {
    await deps.createAgent({
      userId: context.userId,
      name: `Agente ${context.userName ?? context.userId}`,
      contentStrategy: JSON.stringify(buildDefaultContentStrategy()),
    });
    createdAgent = true;
  }

  const createdAffiliate = await deps.getAffiliateByUserId(context.userId);
  if (!createdAffiliate) {
    throw new AffiliateCreationFailedError();
  }

  const user = await deps.getUserById(context.userId);

  await publishAffiliateRegistered(
    {
      affiliateId: String(createdAffiliate.id),
      sponsorId: sponsor.id ? String(sponsor.id) : undefined,
      email: user?.email ?? context.userEmail ?? "",
      name: user?.name ?? context.userName ?? createdAffiliate.affiliateCode,
      plan: "affiliate",
      rank: createdAffiliate.status,
    },
    {
      source: "mmn.registerAffiliate",
      userId: context.userId,
      sponsorCode: context.sponsorCode,
      commissionPercentage: context.commissionPercentage,
    },
  );

  await publishAffiliateActivated(String(createdAffiliate.id), {
    source: "mmn.registerAffiliate",
    userId: context.userId,
  });

  return {
    affiliate: createdAffiliate,
    result: {
      affiliateId: createdAffiliate.id,
      affiliateCode: createdAffiliate.affiliateCode,
      sponsorAffiliateId: sponsor.id,
      sponsorUserId: sponsor.userId,
      status: createdAffiliate.status,
      createdAgent,
    },
  };
}

export function buildDefaultContentStrategy() {
  return { ...DEFAULT_AFFILIATE_CONTENT_STRATEGY };
}
