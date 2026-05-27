// =============================================================================
// Nexus SaaS · Conexões oficiais com plataformas parceiras
//
// Importante:
// - Mantemos aqui SOMENTE dados públicos (nome de afiliado, username, ID de
//   afiliado exibido nos painéis das próprias plataformas).
// - Tokens, client_secret, basic auth e senhas FICAM EXCLUSIVAMENTE no
//   backend (variáveis de ambiente carregadas em /backend/.env, fora do git).
// =============================================================================

export interface PartnerConfig {
  slug: "shopee" | "hotmart" | "mercado-livre";
  name: string;
  status: "ativo" | "em_breve" | "manutencao";
  /** Nome público da loja/perfil Nexus SaaS na plataforma. */
  affiliateProfile: string;
  /** Username público quando aplicável (ex.: Shopee). */
  username?: string;
  /** ID público de afiliado (Shopee Afiliados, Hotmart Producer ID, etc). */
  affiliateId?: string;
  /** URL pública de login/painel da plataforma. */
  dashboardUrl: string;
}

export const NEXUS_PARTNERS: PartnerConfig[] = [
  {
    slug: "shopee",
    name: "Shopee Afiliados",
    status: "ativo",
    affiliateProfile: "Nexus SaaS",
    username: "lucasthomaz2",
    affiliateId: "18325891080",
    dashboardUrl: "https://affiliate.shopee.com.br",
  },
  {
    slug: "hotmart",
    name: "Hotmart",
    status: "ativo",
    affiliateProfile: "Nexus SaaS",
    dashboardUrl: "https://app-vlc.hotmart.com",
  },
  {
    slug: "mercado-livre",
    name: "Mercado Livre",
    status: "em_breve",
    affiliateProfile: "Nexus SaaS",
    dashboardUrl: "https://www.mercadolivre.com.br",
  },
];

export function getPartnerBySlug(slug: PartnerConfig["slug"]): PartnerConfig | undefined {
  return NEXUS_PARTNERS.find((p) => p.slug === slug);
}
