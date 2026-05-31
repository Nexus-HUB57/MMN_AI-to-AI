export interface Agent {
  id?: number | string;
  agentId?: number | string;
  name: string;
  specialization: string;
  description?: string | null;
  systemPrompt?: string | null;
  avatarUrl?: string | null;
  status?: string;
  health?: number;
  energy?: number;
  creativity?: number;
  reputation?: number;
  sencienceLevel?: number | string;
  [key: string]: unknown;
}

export interface GeneratedImage {
  id: number | string;
  agentId?: number | string;
  prompt: string;
  imageUrl: string;
  storageKey?: string | null;
  createdAt: string | Date;
  [key: string]: unknown;
}

export interface ScheduledPost {
  id: number | string;
  content: string;
  platform: string;
  scheduledAt: string | Date;
  status: string;
  imageUrl?: string | null;
  [key: string]: unknown;
}

export interface RecommendedProduct {
  id: number | string;
  productName: string;
  description?: string | null;
  marketplace: string;
  relevanceScore: number | string;
  affiliateLink: string;
  productUrl?: string;
  price?: number | string | null;
  commission?: number | string | null;
  imageUrl?: string | null;
  [key: string]: unknown;
}

export interface AgentSkill {
  id: number | string;
  skillName: string;
  description?: string | null;
  status: string;
  proficiency?: number | string;
  cost?: number | string | null;
  acquiredAt?: string | Date | null;
  [key: string]: unknown;
}

export interface EvolutionHistory {
  id: number | string;
  eventType: string;
  description?: string | null;
  createdAt: string | Date;
  [key: string]: unknown;
}
