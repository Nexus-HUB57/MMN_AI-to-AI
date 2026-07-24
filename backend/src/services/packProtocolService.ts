/**
 * packProtocolService — Registro Oficial do Protocolo Pack
 *
 * Fonte única de verdade para todos os Packs da plataforma Nexus Affil'IA'te.
 * Baseado em: docs/planning/Protocolo_Pack
 *
 * CEO-014: Sincronizado com o Protocolo Pack oficial.
 * Cada Pack define: Produtos (ebooks, XP, Skills, PNE/SiSu),
 * Benefícios (comissões, acessos), e Ativação Mensal (valor + compensação).
 *
 * TODO: Quando o sistema tiver Skills, Academ'IA, Lab Nexus, Lib Nexus,
 * Hall de Sócios, Credenciais VIP — adicionar delivery handlers aqui.
 */

// ============================================================
// TIPOS
// ============================================================

export interface PackNetworkRequirements {
  /** Nível 1 da Rede Binária (Diretos) */
  level1: { min: number; max: number; pack: string };
  /** Nível 2 da Rede Binária (Indiretos) — opcional */
  level2?: { min: number; max: number; pack: string };
}

export interface PackSkills {
  /** Prompt level: "basico" | "intermediario" | "avancado" | "pleno" */
  promptLevel: string;
  /** Número de Skills Nível I */
  level1: number;
  /** Número de Skills Nível II */
  level2: number;
  /** Número de Skills Nível III */
  level3: number;
}

export interface PackCommission {
  /** Nível da rede (1-5) */
  level: number;
  /** Percentual de comissão */
  percent: number;
}

export interface PackActivation {
  /** Se a ativação mensal está ativa neste nível */
  enabled: boolean;
  /** Custo da ativação em centavos */
  costCents: number;
  /** Quantidade de Pack A² recebidos como compensação */
  packsCompensation: number;
}

export interface PackBenefit {
  /** Tipo do benefício */
  type: "academia" | "commission" | "pack_sales" | "parity" | "lab" | "lib" | "hall" | "vip" | "acess_pleno";
  /** Descrição legível */
  description: string;
  /** Valor associado (percentual, quantidade, etc.) */
  value?: number | string;
}

export interface PackProtocol {
  /** Slug identificador (ex.: "pack-a2") */
  slug: string;
  /** Nome completo do Pack */
  name: string;
  /** Nível dentro da categoria (I, II, III) */
  level: string;
  /** Categoria do agente */
  category: "agente_afiliado" | "agente_preditivo" | "agente_generativo" | "agente_orquestrador" | "ia_agentic";
  /** XP mínimo exigido para este nível */
  xpRequired: number;
  /** XP concedido ao adquirir o Pack */
  xpGranted: number;
  /** Número de ebooks atribuídos ao estoque */
  ebookQuota: number;
  /** PREU (Pacotes de Revenda Unitários) — cada PREU = 25 ebooks */
  preuCount: number;
  /** Skills concedidas */
  skills: PackSkills;
  /** PNE: Número de Pack A² SiSu (Sub-Contas Sustentáveis) */
  pneSubAccounts: number;
  /** Benefícios garantidos */
  benefits: PackBenefit[];
  /** Comissões por nível da rede */
  commissions: PackCommission[];
  /** 100% de comissão nas vendas do Pack A² */
  packSalesCommission: boolean;
  /** Paridade de vendas R$1 = 1XP */
  salesParity: boolean;
  /** Configuração da Ativação Mensal */
  activation: PackActivation;
  /** Requisitos de rede binária */
  network: PackNetworkRequirements;
}

// ============================================================
// REGISTRO OFICIAL DE PACKS — Protocolo_Pack
// ============================================================

export const PACK_PROTOCOL: Record<string, PackProtocol> = {
  // ─────────────────────────────────────────────────
  // AGENTE AFILIADO
  // ─────────────────────────────────────────────────

  "pack-a2": {
    slug: "pack-a2",
    name: 'Pack Agente Afiliado "Pack A²"',
    level: "I",
    category: "agente_afiliado",
    xpRequired: 0,
    xpGranted: 1000,
    ebookQuota: 10,
    preuCount: 0,
    skills: { promptLevel: "basico", level1: 2, level2: 0, level3: 0 },
    pneSubAccounts: 0,
    benefits: [
      { type: "academia", description: "Acesso Academ'IA" },
    ],
    commissions: [],
    packSalesCommission: false,
    salesParity: false,
    activation: { enabled: false, costCents: 0, packsCompensation: 0 },
    network: {
      level1: { min: 0, max: 0, pack: "" },
    },
  },

  "pack-a2ii": {
    slug: "pack-a2ii",
    name: 'Pack Agente Afiliado "Pack A²II"',
    level: "II",
    category: "agente_afiliado",
    xpRequired: 5000,
    xpGranted: 3000,
    ebookQuota: 30,
    preuCount: 0,
    skills: { promptLevel: "basico", level1: 3, level2: 0, level3: 0 },
    pneSubAccounts: 1,
    benefits: [
      { type: "commission", description: '10% de Participação/Comissão do NO 1º Nível (Unilevel)', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [{ level: 1, percent: 10 }],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 1000, packsCompensation: 1 },
    network: {
      level1: { min: 2, max: 25, pack: "pack-a2" },
    },
  },

  "pack-a2iii": {
    slug: "pack-a2iii",
    name: 'Pack Agente Afiliado "A²III"',
    level: "III",
    category: "agente_afiliado",
    xpRequired: 10000,
    xpGranted: 5000,
    ebookQuota: 50,
    preuCount: 0,
    skills: { promptLevel: "basico", level1: 5, level2: 0, level3: 0 },
    pneSubAccounts: 2,
    benefits: [
      { type: "commission", description: '10% de Participação/Comissão do NO 1º Nível (Unilevel)', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [{ level: 1, percent: 10 }],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 1000, packsCompensation: 1 },
    network: {
      level1: { min: 5, max: 25, pack: "pack-a2" },
    },
  },

  // ─────────────────────────────────────────────────
  // AGENTE PREDITIVO
  // ─────────────────────────────────────────────────

  "pack-ag": {
    slug: "pack-ag",
    name: 'Pack Agente Preditivo "AG"',
    level: "I",
    category: "agente_preditivo",
    xpRequired: 55000,
    xpGranted: 25000,
    ebookQuota: 250,
    preuCount: 10,
    skills: { promptLevel: "intermediario", level1: 5, level2: 0, level3: 0 },
    pneSubAccounts: 5,
    benefits: [
      { type: "commission", description: '10% NO 1º Nível (Multilevel)', value: 10 },
      { type: "commission", description: '5% NO 2º Nível (Multilevel)', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 10 },
      { level: 2, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 2000, packsCompensation: 2 },
    network: {
      level1: { min: 10, max: 25, pack: "pack-a2ii" },
      level2: { min: 10, max: 125, pack: "pack-a2" },
    },
  },

  "pack-agii": {
    slug: "pack-agii",
    name: 'Pack Agente Preditivo "AGII"',
    level: "II",
    category: "agente_preditivo",
    xpRequired: 210000,
    xpGranted: 0,
    ebookQuota: 500,
    preuCount: 20,
    skills: { promptLevel: "intermediario", level1: 5, level2: 2, level3: 0 },
    pneSubAccounts: 10,
    benefits: [
      { type: "commission", description: '10% NO 1º Nível (Multilevel)', value: 10 },
      { type: "commission", description: '5% NO 2º Nível (Multilevel)', value: 5 },
      { type: "commission", description: '5% NO 3º Nível (Multilevel)', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 10 },
      { level: 2, percent: 5 },
      { level: 3, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 2000, packsCompensation: 2 },
    network: {
      level1: { min: 20, max: 25, pack: "pack-a2iii" },
      level2: { min: 20, max: 125, pack: "pack-a2ii" },
    },
  },

  "pack-agiii": {
    slug: "pack-agiii",
    name: 'Pack Agente Preditivo "AGIII"',
    level: "III",
    category: "agente_preditivo",
    xpRequired: 315000,
    xpGranted: 0,
    ebookQuota: 750,
    preuCount: 30,
    skills: { promptLevel: "intermediario", level1: 5, level2: 5, level3: 0 },
    pneSubAccounts: 20,
    benefits: [
      { type: "commission", description: '10% NO 1º Nível (Multilevel)', value: 10 },
      { type: "commission", description: '10% NO 2º Nível (Multilevel)', value: 10 },
      { type: "commission", description: '5% NO 3º Nível (Multilevel)', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 10 },
      { level: 2, percent: 10 },
      { level: 3, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 2000, packsCompensation: 2 },
    network: {
      level1: { min: 25, max: 25, pack: "pack-a2iii" },
      level2: { min: 30, max: 125, pack: "pack-a2ii" },
    },
  },

  // ─────────────────────────────────────────────────
  // AGENTE GENERATIVO
  // ─────────────────────────────────────────────────

  "pack-agn": {
    slug: "pack-agn",
    name: 'Pack Agente Generativo "AGN"',
    level: "I",
    category: "agente_generativo",
    xpRequired: 850000,
    xpGranted: 0,
    ebookQuota: 1000,
    preuCount: 40,
    skills: { promptLevel: "intermediario", level1: 7, level2: 5, level3: 0 },
    pneSubAccounts: 30,
    benefits: [
      { type: "commission", description: '15% NO 1º Nível', value: 15 },
      { type: "commission", description: '10% NO 2º Nível', value: 10 },
      { type: "commission", description: '5% NO 3º Nível', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 15 },
      { level: 2, percent: 10 },
      { level: 3, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 3000, packsCompensation: 3 },
    network: {
      level1: { min: 10, max: 25, pack: "pack-ag" },
      level2: { min: 10, max: 125, pack: "pack-a2ii" },
    },
  },

  "pack-agnii": {
    slug: "pack-agnii",
    name: 'Pack Agente Generativo "AGNII"',
    level: "II",
    category: "agente_generativo",
    xpRequired: 2700000,
    xpGranted: 0,
    ebookQuota: 2000,
    preuCount: 80,
    skills: { promptLevel: "intermediario", level1: 7, level2: 7, level3: 0 },
    pneSubAccounts: 40,
    benefits: [
      { type: "commission", description: '15% NO 1º Nível', value: 15 },
      { type: "commission", description: '15% NO 2º Nível', value: 15 },
      { type: "commission", description: '5% NO 3º Nível', value: 5 },
      { type: "commission", description: '5% NO 4º Nível', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 15 },
      { level: 2, percent: 15 },
      { level: 3, percent: 5 },
      { level: 4, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 3000, packsCompensation: 3 },
    network: {
      level1: { min: 20, max: 25, pack: "pack-agiii" },
      level2: { min: 10, max: 125, pack: "pack-ag" },
    },
  },

  "pack-agniii": {
    slug: "pack-agniii",
    name: 'Pack Agente Generativo "AGNIII"',
    level: "III",
    category: "agente_generativo",
    xpRequired: 4050000,
    xpGranted: 0,
    ebookQuota: 3000,
    preuCount: 120,
    skills: { promptLevel: "intermediario", level1: 7, level2: 7, level3: 2 },
    pneSubAccounts: 50,
    benefits: [
      { type: "commission", description: '15% NO 1º Nível', value: 15 },
      { type: "commission", description: '15% NO 2º Nível', value: 15 },
      { type: "commission", description: '10% NO 3º Nível', value: 10 },
      { type: "commission", description: '5% NO 4º Nível', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 15 },
      { level: 2, percent: 15 },
      { level: 3, percent: 10 },
      { level: 4, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 3000, packsCompensation: 3 },
    network: {
      level1: { min: 25, max: 25, pack: "pack-agiii" },
      level2: { min: 30, max: 125, pack: "pack-ag" },
    },
  },

  // ─────────────────────────────────────────────────
  // AGENTE ORQUESTRADOR
  // ─────────────────────────────────────────────────

  "pack-ao": {
    slug: "pack-ao",
    name: 'Pack Agente Orquestrador "AO"',
    level: "I",
    category: "agente_orquestrador",
    xpRequired: 5500000,
    xpGranted: 0,
    ebookQuota: 5000,
    preuCount: 200,
    skills: { promptLevel: "avancado", level1: 3, level2: 1, level3: 0 },
    pneSubAccounts: 100,
    benefits: [
      { type: "commission", description: '15% NO 1º Nível', value: 15 },
      { type: "commission", description: '15% NO 2º Nível', value: 15 },
      { type: "commission", description: '10% NO 3º Nível', value: 10 },
      { type: "commission", description: '5% NO 4º Nível', value: 5 },
      { type: "commission", description: '5% NO 5º Nível', value: 5 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 15 },
      { level: 2, percent: 15 },
      { level: 3, percent: 10 },
      { level: 4, percent: 5 },
      { level: 5, percent: 5 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 5000, packsCompensation: 5 },
    network: {
      level1: { min: 10, max: 25, pack: "pack-agniii" },
      level2: { min: 10, max: 125, pack: "pack-agnii" },
    },
  },

  "pack-aoii": {
    slug: "pack-aoii",
    name: 'Pack Agente Orquestrador "AOII"',
    level: "II",
    category: "agente_orquestrador",
    xpRequired: 11000000,
    xpGranted: 0,
    ebookQuota: 10000,
    preuCount: 400,
    skills: { promptLevel: "avancado", level1: 5, level2: 3, level3: 0 },
    pneSubAccounts: 200,
    benefits: [
      { type: "commission", description: '20% NO 1º Nível', value: 20 },
      { type: "commission", description: '20% NO 2º Nível', value: 20 },
      { type: "commission", description: '15% NO 3º Nível', value: 15 },
      { type: "commission", description: '10% NO 4º Nível', value: 10 },
      { type: "commission", description: '10% NO 5º Nível', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 20 },
      { level: 2, percent: 20 },
      { level: 3, percent: 15 },
      { level: 4, percent: 10 },
      { level: 5, percent: 10 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 10000, packsCompensation: 10 },
    network: {
      level1: { min: 20, max: 25, pack: "pack-agniii" },
      level2: { min: 20, max: 125, pack: "pack-agnii" },
    },
  },

  "pack-aoiii": {
    slug: "pack-aoiii",
    name: 'Pack Agente Orquestrador "AOIII"',
    level: "III",
    category: "agente_orquestrador",
    xpRequired: 17000000,
    xpGranted: 0,
    ebookQuota: 20000,
    preuCount: 800,
    skills: { promptLevel: "avancado", level1: 7, level2: 5, level3: 2 },
    pneSubAccounts: 300,
    benefits: [
      { type: "commission", description: '20% NO 1º Nível', value: 20 },
      { type: "commission", description: '20% NO 2º Nível', value: 20 },
      { type: "commission", description: '20% NO 3º Nível', value: 20 },
      { type: "commission", description: '15% NO 4º Nível', value: 15 },
      { type: "commission", description: '10% NO 5º Nível', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
    ],
    commissions: [
      { level: 1, percent: 20 },
      { level: 2, percent: 20 },
      { level: 3, percent: 20 },
      { level: 4, percent: 15 },
      { level: 5, percent: 10 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 20000, packsCompensation: 20 },
    network: {
      level1: { min: 25, max: 25, pack: "pack-agniii" },
      level2: { min: 30, max: 125, pack: "pack-agnii" },
    },
  },

  // ─────────────────────────────────────────────────
  // IA AGENTIC
  // ─────────────────────────────────────────────────

  "pack-aa": {
    slug: "pack-aa",
    name: 'Pack Agente IA Agentic "AA"',
    level: "I",
    category: "ia_agentic",
    xpRequired: 35000000,
    xpGranted: 0,
    ebookQuota: 50000,
    preuCount: 2000,
    skills: { promptLevel: "avancado", level1: 7, level2: 7, level3: 5 },
    pneSubAccounts: 500,
    benefits: [
      { type: "commission", description: '25% NO 1º Nível', value: 25 },
      { type: "commission", description: '20% NO 2º Nível', value: 20 },
      { type: "commission", description: '20% NO 3º Nível', value: 20 },
      { type: "commission", description: '15% NO 4º Nível', value: 15 },
      { type: "commission", description: '10% NO 5º Nível', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
      { type: "academia", description: "Acesso Nexus Academ'IA - Nível IV" },
      { type: "lab", description: "Acesso Lab Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "lib", description: "Acesso Lib Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "hall", description: "Acesso ao Hall de Sócios Nexus" },
      { type: "vip", description: "Credencial VIP /Harmonic Life" },
    ],
    commissions: [
      { level: 1, percent: 25 },
      { level: 2, percent: 20 },
      { level: 3, percent: 20 },
      { level: 4, percent: 15 },
      { level: 5, percent: 10 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 50000, packsCompensation: 50 },
    network: {
      level1: { min: 10, max: 25, pack: "pack-aoiii" },
      level2: { min: 10, max: 125, pack: "pack-aoii" },
    },
  },

  "pack-aaii": {
    slug: "pack-aaii",
    name: 'Pack Agente IA Agentic "AAII"',
    level: "II",
    category: "ia_agentic",
    xpRequired: 70000000,
    xpGranted: 0,
    ebookQuota: 100000,
    preuCount: 4000,
    skills: { promptLevel: "avancado", level1: 7, level2: 7, level3: 7 },
    pneSubAccounts: 1000,
    benefits: [
      { type: "commission", description: '25% NO 1º Nível', value: 25 },
      { type: "commission", description: '25% NO 2º Nível', value: 25 },
      { type: "commission", description: '20% NO 3º Nível', value: 20 },
      { type: "commission", description: '20% NO 4º Nível', value: 20 },
      { type: "commission", description: '10% NO 5º Nível', value: 10 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
      { type: "academia", description: "Acesso Nexus Academ'IA - Nível V" },
      { type: "lab", description: "Acesso Lab Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "lib", description: "Acesso Lib Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "hall", description: "Acesso ao Hall de Sócios Nexus" },
      { type: "vip", description: "Credencial VIP /Harmonic Life" },
    ],
    commissions: [
      { level: 1, percent: 25 },
      { level: 2, percent: 25 },
      { level: 3, percent: 20 },
      { level: 4, percent: 20 },
      { level: 5, percent: 10 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 100000, packsCompensation: 100 },
    network: {
      level1: { min: 20, max: 25, pack: "pack-aoiii" },
      level2: { min: 20, max: 125, pack: "pack-aoii" },
    },
  },

  "pack-aaiii": {
    slug: "pack-aaiii",
    name: 'Pack Agente IA Agentic "AAIII"',
    level: "III",
    category: "ia_agentic",
    xpRequired: 110000000,
    xpGranted: 0,
    ebookQuota: 150000,
    preuCount: 6000,
    skills: { promptLevel: "pleno", level1: 7, level2: 7, level3: 7 },
    pneSubAccounts: 2000,
    benefits: [
      { type: "commission", description: '25% NO 1º Nível', value: 25 },
      { type: "commission", description: '25% NO 2º Nível', value: 25 },
      { type: "commission", description: '20% NO 3º Nível', value: 20 },
      { type: "commission", description: '20% NO 4º Nível', value: 20 },
      { type: "commission", description: '15% NO 5º Nível', value: 15 },
      { type: "pack_sales", description: '100% de Comissão nas Vendas do Pack A²', value: 100 },
      { type: "parity", description: "Paridade de Vendas R$1 = 1XP" },
      { type: "academia", description: "Acesso Nexus Academ'IA - Acesso Pleno" },
      { type: "lab", description: "Acesso Lab Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "lib", description: "Acesso Lib Nexus - Sandbox Nexus /Nível Avançado" },
      { type: "hall", description: "Acesso ao Hall de Sócios Nexus" },
      { type: "vip", description: "Credencial VIP /Harmonic Life" },
    ],
    commissions: [
      { level: 1, percent: 25 },
      { level: 2, percent: 25 },
      { level: 3, percent: 20 },
      { level: 4, percent: 20 },
      { level: 5, percent: 15 },
    ],
    packSalesCommission: true,
    salesParity: true,
    activation: { enabled: true, costCents: 200000, packsCompensation: 200 },
    network: {
      level1: { min: 25, max: 25, pack: "pack-aa" },
      level2: { min: 30, max: 125, pack: "pack-aoiii" },
    },
  },
};

// ============================================================
// HELPERS
// ============================================================

/** Retorna o protocolo completo de um Pack */
export function getPackProtocol(slug: string): PackProtocol | undefined {
  return PACK_PROTOCOL[slug];
}

/** Retorna todos os slugs de pack registrados */
export function getAllPackSlugs(): string[] {
  return Object.keys(PACK_PROTOCOL);
}

/** Retorna packs de uma categoria */
export function getPacksByCategory(category: PackProtocol["category"]): PackProtocol[] {
  return Object.values(PACK_PROTOCOL).filter((p) => p.category === category);
}

/** Retorna a ebook quota oficial do Protocolo_Pack */
export function getOfficialEbookQuota(slug: string): number {
  return PACK_PROTOCOL[slug]?.ebookQuota ?? 0;
}

/** Compat: mapa slug → ebook quota (mantém compatibilidade com packEntitlementService) */
export const PACK_EBOOK_QUOTA_OFFICIAL: Record<string, number> = Object.fromEntries(
  Object.entries(PACK_PROTOCOL).map(([slug, p]) => [slug, p.ebookQuota]),
);

/**
 * CEO-014: Tabela de divergências detectadas entre o código antigo e o Protocolo_Pack.
 * Packs AGN, AGNII, AGNIII, AO, AOII, AOIII, AA, AAII, AAIII tinham quotas
 * multiplicadas por ~2x no código antigo vs. o Protocolo oficial.
 */
export const PACK_QUOTA_DIVERGENCES: Record<string, { old: number; official: number }> = {
  "pack-agn":   { old: 1100,  official: 1000 },
  "pack-agnii":  { old: 4000,  official: 2000 },
  "pack-agniii": { old: 6000,  official: 3000 },
  "pack-ao":    { old: 10000, official: 5000 },
  "pack-aoii":   { old: 20000, official: 10000 },
  "pack-aoiii":  { old: 40000, official: 20000 },
  "pack-aa":    { old: 100000, official: 50000 },
  "pack-aaii":   { old: 200000, official: 100000 },
  "pack-aaiii":  { old: 350000, official: 150000 },
};
