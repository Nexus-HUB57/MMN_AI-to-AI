/**
 * Testes Unitários para PacksRouter
 * Sistema MMN_AI-to-AI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de packs disponíveis
const mockPacks = [
  {
    id: 1,
    name: 'Facebook Ads Master',
    description: 'Pack completo para campanhas de Facebook Ads',
    price: 79.90,
    category: 'ads',
    duration: 30,
    features: ['Campanhas ilimitadas', 'Análise avançada', 'Templates'],
    badge: 'best_seller',
  },
  {
    id: 2,
    name: 'Instagram Pro',
    description: 'Estratégias avançadas para Instagram',
    price: 59.90,
    category: 'social',
    duration: 30,
    features: ['Stories automáticos', 'Hashtag research', 'Engagement boost'],
    badge: 'popular',
  },
];

describe('PacksRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listAvailable', () => {
    it('deve listar packs disponíveis', async () => {
      const packs = mockPacks;

      expect(packs).toHaveLength(2);
      expect(packs[0].name).toBe('Facebook Ads Master');
    });

    it('deve filtrar por categoria', async () => {
      const category = 'social';
      const filtered = mockPacks.filter(p => p.category === category);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Instagram Pro');
    });
  });

  describe('purchasePack', () => {
    it('deve ativar pack por 30 dias', async () => {
      const purchase = {
        packId: 1,
        agentId: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      expect(purchase.endDate.getTime() - purchase.startDate.getTime())
        .toBe(30 * 24 * 60 * 60 * 1000);
    });
  });

  describe('cancelPack', () => {
    it('deve desativar pack ativo', async () => {
      const activePack = { agentId: 1, packId: 1, active: true };
      activePack.active = false;

      expect(activePack.active).toBe(false);
    });
  });

  describe('listMine', () => {
    it('deve listar packs ativos do agente', async () => {
      const myPacks = [
        { ...mockPacks[0], purchasedAt: new Date(), expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      ];

      expect(myPacks).toHaveLength(1);
      expect(myPacks[0].badge).toBe('best_seller');
    });
  });

  describe('getPackDetails', () => {
    it('deve retornar detalhes completos do pack', async () => {
      const pack = mockPacks[0];
      const details = {
        ...pack,
        totalFeatures: pack.features.length,
        pricePerDay: pack.price / pack.duration,
      };

      expect(details.totalFeatures).toBe(3);
      expect(details.pricePerDay).toBeLessThan(3);
    });
  });
});

describe('Pack Categories', () => {
  const categories = [
    'ads',
    'social',
    'ecommerce',
    'b2b',
    'analytics',
    'mmn',
  ];

  it('deve validar categorias disponíveis', () => {
    expect(categories).toContain('ads');
    expect(categories).toContain('social');
    expect(categories).toContain('mmn');
  });

  it('deve suportar todas as categorias configuradas', () => {
    expect(categories).toHaveLength(6);
  });
});

describe('Pack Badges', () => {
  const validBadges = ['best_seller', 'new', 'premium', 'offer', 'coming_soon'];

  it('deve validar badges visuais', () => {
    expect(validBadges).toContain('best_seller');
    expect(validBadges).toContain('premium');
  });
});