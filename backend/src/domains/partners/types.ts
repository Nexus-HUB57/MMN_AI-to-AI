/**
 * Tipos do Domínio de Parceiros - Nexus Partners Pack
 * Sistema de tipagem para parceiros estratégicos
 */

// Tier de parceiro
export const partnerTiers = ["silver", "gold", "platinum", "diamond"] as const;
export type PartnerTier = (typeof partnerTiers)[number];

// Status de parceria
export const partnershipStatuses = ["pending", "active", "suspended", "terminated", "rejected"] as const;
export type PartnershipStatus = (typeof partnershipStatuses)[number];

// Interface de Parceiro
export interface Partner {
  id: string;
  userId: number;
  tier: PartnerTier;
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  commissionBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface de Parceria
export interface Partnership {
  id: string;
  partnerId: string;
  partnerName: string;
  status: PartnershipStatus;
  startedAt: Date;
  endedAt?: Date;
  commissionRate: number;
  benefits: string[];
}

// Interface de Estatísticas de Parceiros
export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  totalVolume: number;
  totalCommissions: number;
  averageTier: string;
  topPerformers: Array<{
    id: string;
    name: string;
    tier: PartnerTier;
    volume: number;
  }>;
}

// Schemas Zod para validação
import { z } from "zod";

export const partnerTierSchema = z.enum(partnerTiers);
export const partnershipStatusSchema = z.enum(partnershipStatuses);

export const partnerSchema = z.object({
  id: z.string(),
  userId: z.number(),
  tier: partnerTierSchema,
  referralCode: z.string(),
  referralCount: z.number(),
  totalVolume: z.number(),
  commissionBalance: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const partnershipSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  partnerName: z.string(),
  status: partnershipStatusSchema,
  startedAt: z.date(),
  endedAt: z.date().optional(),
  commissionRate: z.number().min(0).max(1),
  benefits: z.array(z.string()),
});

export const partnerStatsSchema = z.object({
  totalPartners: z.number(),
  activePartners: z.number(),
  totalVolume: z.number(),
  totalCommissions: z.number(),
  averageTier: z.string(),
  topPerformers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tier: partnerTierSchema,
      volume: z.number(),
    })
  ),
});

// Configuração de tiers
export interface TierConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  benefits: string[];
  minVolume: number;
  commissionRate: number;
}

export const TIER_CONFIGS: Record<PartnerTier, TierConfig> = {
  silver: {
    label: "Prata",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500",
    icon: "Shield",
    benefits: ["Dashboard Básico", "Relatórios Semanais"],
    minVolume: 1000,
    commissionRate: 0.05,
  },
  gold: {
    label: "Ouro",
    color: "from-amber-400 to-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
    icon: "Award",
    benefits: ["Dashboard Avançado", "Relatórios Diários", "Suporte Prioritário"],
    minVolume: 5000,
    commissionRate: 0.08,
  },
  platinum: {
    label: "Platina",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    icon: "Crown",
    benefits: ["Dashboard em Tempo Real", "API de Acesso", "Suporte 24/7"],
    minVolume: 20000,
    commissionRate: 0.12,
  },
  diamond: {
    label: "Diamante",
    color: "from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500",
    icon: "Gem",
    benefits: ["Tudo Anterior", "Gerente Dedicado", "Relatórios Customizados"],
    minVolume: 100000,
    commissionRate: 0.15,
  },
};
