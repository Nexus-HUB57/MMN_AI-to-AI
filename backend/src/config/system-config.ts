/**
 * Nexus Partners Pack - Sistema de Configuração de Ambiente
 * Configurações centralizadas para todos os serviços
 */

export const config = {
  // API Gateway Configuration
  api: {
    port: parseInt(process.env.PORT || '3000'),
    baseUrl: process.env.API_BASE_URL || 'https://api.nexus-platform.com',
    timeout: 30000,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Database Configuration (PostgreSQL)
  database: {
    url: process.env.DATABASE_URL || '',
    maxConnections: 20,
    idleTimeout: 30000,
    connectionTimeout: 5000,
    ssl: process.env.NODE_ENV === 'production',
  },

  // Redis Cache Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Generative AI Configuration (High-Throughput Pipeline)
  generativeAI: {
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4-turbo',
        maxTokens: 4000,
        temperature: 0.7,
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-opus',
        maxTokens: 4000,
      },
      local: {
        endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434',
        model: 'llama3',
      },
    },
    // rRNA Self-Healing Configuration
    selfHealing: {
      enabled: true,
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
      maxDelay: 30000,
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
      },
      healthCheck: {
        interval: 30000,
        timeout: 5000,
      },
    },
    // High-Throughput Configuration
    throughput: {
      maxConcurrentRequests: 50,
      batchSize: 10,
      queueSize: 1000,
      cacheTTL: 3600, // 1 hour
    },
  },

  // Webhook Configuration for Commission Sync
  webhooks: {
    commissions: {
      endpoint: '/api/webhooks/commissions',
      secret: process.env.WEBHOOK_COMMISSION_SECRET,
      retryAttempts: 3,
      retryDelay: 5000,
    },
    tierPromotions: {
      endpoint: '/api/webhooks/tier-promotions',
      secret: process.env.WEBHOOK_TIER_SECRET,
    },
  },

  // Notification System Configuration
  notifications: {
    channels: {
      email: {
        provider: 'resend',
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.NOTIFICATION_FROM_EMAIL || 'noreply@nexus-platform.com',
      },
      push: {
        provider: 'fcm',
        credentials: process.env.FCM_CREDENTIALS,
      },
      inApp: {
        enabled: true,
        retentionDays: 90,
      },
    },
    templates: {
      tierPromotion: {
        subject: '🎉 Parabéns! Você foi promovido para {newTier}!',
        body: 'Olá {partnerName}, você acaba de ser promovido para o nível {newTier}! Seus benefícios incluem: {benefits}',
      },
      commissionReceived: {
        subject: '💰 Nova comissão recebida: R$ {amount}',
        body: 'Parabéns {partnerName}! Você recebeu uma comissão de R$ {amount} pela venda #{saleId}.',
      },
    },
  },

  // Analytics Dashboard Configuration
  analytics: {
    trends: {
      updateInterval: 300000, // 5 minutes
      historyDays: 90,
      metrics: ['commissions', 'sales', 'network_growth', 'xp_progress'],
    },
    charts: {
      defaultPeriod: '30d',
      availablePeriods: ['7d', '30d', '90d', '1y'],
    },
  },

  // Report Generation Configuration
  reports: {
    formats: ['pdf', 'excel', 'csv'],
    templates: {
      partnerSummary: '/templates/reports/partner-summary',
      commissionReport: '/templates/reports/commission-report',
      networkAnalysis: '/templates/reports/network-analysis',
    },
    storage: {
      provider: 's3',
      bucket: process.env.REPORTS_BUCKET || 'nexus-reports',
      retentionDays: 365,
    },
  },
};

export type Config = typeof config;
export default config;