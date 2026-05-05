export interface Agent {
  id: number;
  userId: number;
  agentId: string;
  name: string;
  specialization: string;
  systemPrompt: string | null;
  description: string | null;
  avatarUrl: string | null;
  status: 'genesis' | 'active' | 'hibernating' | 'critical' | 'dead' | 'resurrectable';
  sencienceLevel: string | number;
  health: number;
  energy: number;
  creativity: number;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledPost {
  id: number;
  agentId: string;
  content: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  scheduledAt: Date;
  status: 'agendado' | 'publicado' | 'falhou';
  imageUrl: string | null;
  failureReason: string | null;
  createdAt: Date;
  publishedAt: Date | null;
}

export interface RecommendedProduct {
  id: number;
  agentId: string;
  productName: string;
  productUrl: string;
  affiliateLink: string;
  relevanceScore: string | number;
  marketplace: string;
  price: string | number | null;
  commission: string | number | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSkill {
  id: number;
  agentId: string;
  skillName: string;
  description: string | null;
  level: number;
  proficiency: string | number;
  status: 'locked' | 'unlocked' | 'active';
  cost: string | number | null;
  acquiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedContent {
  id: number;
  agentId: string;
  contentType: 'text' | 'image' | 'video';
  prompt: string;
  content: string | null;
  imageUrl: string | null;
  platform: string | null;
  createdAt: Date;
}

export interface GeneratedImage {
  id: number;
  agentId: string;
  prompt: string;
  imageUrl: string;
  storageKey: string | null;
  createdAt: Date;
}

export interface EvolutionHistory {
  id: number;
  agentId: string;
  eventType: string;
  description: string | null;
  sencienceGain: string | number | null;
  healthChange: number | null;
  energyChange: number | null;
  createdAt: Date;
}
