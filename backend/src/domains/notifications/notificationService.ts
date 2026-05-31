/**
 * Nexus Partners Pack - Sistema de Notificações para Promoções de Tier
 * Implementação com templates, canais múltiplos e tracking de entrega
 */

import { EventEmitter } from 'events';

// Types
export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: string[];
  priority: NotificationPriority;
}

export interface NotificationPayload {
  userId: number;
  affiliateId: number;
  templateId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  data: Record<string, any>;
  scheduledAt?: Date;
  metadata?: {
    tierPromotion?: {
      previousTier: string;
      newTier: string;
      benefits: string[];
    };
    commission?: {
      amount: number;
      saleId: string;
    };
  };
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
  deliveredAt: Date;
  readAt?: Date;
}

// Notification Templates
export const NotificationTemplates: Record<string, NotificationTemplate> = {
  TIER_PROMOTION: {
    id: 'tier_promotion',
    name: 'Promoção de Tier',
    channel: 'email',
    subject: '🎉 Parabéns! Você foi promovido para {newTier}!',
    body: `Olá {partnerName},

Você acaba de ser promovido para o nível {newTier}!

Seus novos benefícios incluem:
{benefits}

Continue assim! Seu crescimento é nosso sucesso.

Equipe Nexus Partners`,
    variables: ['partnerName', 'newTier', 'previousTier', 'benefits', 'promotionDate'],
    priority: 'high',
  },
  TIER_PROMOTION_PUSH: {
    id: 'tier_promotion_push',
    name: 'Promoção de Tier - Push',
    channel: 'push',
    body: '🎉 Você foi promovido para {newTier}! Veja seus novos benefícios.',
    variables: ['newTier'],
    priority: 'high',
  },
  TIER_PROMOTION_IN_APP: {
    id: 'tier_promotion_in_app',
    name: 'Promoção de Tier - In-App',
    channel: 'in_app',
    subject: 'Nova Promoção!',
    body: 'Parabéns! Você alcançou o nível {newTier}. Seus benefícios foram atualizados.',
    variables: ['newTier', 'benefits'],
    priority: 'normal',
  },
  COMMISSION_RECEIVED: {
    id: 'commission_received',
    name: 'Comissão Recebida',
    channel: 'email',
    subject: '💰 Nova comissão recebida: R$ {amount}',
    body: `Olá {partnerName},

Parabéns! Você recebeu uma nova comissão.

Detalhes:
- Valor: R$ {amount}
- Venda: #{saleId}
- Data: {date}

Continue trabalhando e seus ganhos vão crescer!

Equipe Nexus Partners`,
    variables: ['partnerName', 'amount', 'saleId', 'date', 'commissionPercentage'],
    priority: 'normal',
  },
  COMMISSION_APPROVED: {
    id: 'commission_approved',
    name: 'Comissão Aprovada',
    channel: 'in_app',
    subject: 'Comissão Aprovada',
    body: 'Sua comissão de R$ {amount} foi aprovada e está pendente de pagamento.',
    variables: ['amount', 'paymentDate'],
    priority: 'normal',
  },
  BONUS_QUALIFIED: {
    id: 'bonus_qualified',
    name: 'Bônus Qualificado',
    channel: 'email',
    subject: '🎁 Você ganhou um bônus!',
    body: `Olá {partnerName},

Você acaba de se qualificar para um bônus especial!

- Tipo: {bonusType}
- Valor: R$ {bonusAmount}
- Motivo: {bonusReason}

Continue assim para ganhar mais!

Equipe Nexus Partners`,
    variables: ['partnerName', 'bonusType', 'bonusAmount', 'bonusReason'],
    priority: 'high',
  },
  WEEKLY_NETWORK_REPORT: {
    id: 'weekly_network_report',
    name: 'Relatório Semanal da Rede',
    channel: 'email',
    subject: '📊 Seu resumo semanal - {weekStartDate}',
    body: `Olá {partnerName},

Aqui está seu resumo da semana:

🌐 Sua Rede:
- Novos membros: {newMembers}
- Vendas da rede: {networkSales}
- Comissões geradas: R$ {totalCommissions}

📈 Seu Progresso:
- XP atual: {currentXP}
- Próximo nível: {nextLevel}
- XP necessário: {xpNeeded}

Continue crescendo!

Equipe Nexus Partners`,
    variables: ['partnerName', 'weekStartDate', 'newMembers', 'networkSales', 'totalCommissions', 'currentXP', 'nextLevel', 'xpNeeded'],
    priority: 'normal',
  },
};

// Channel Delivery Interfaces
interface ChannelDelivery {
  send(payload: NotificationPayload, template: NotificationTemplate): Promise<NotificationDeliveryResult>;
}

interface EmailChannelDelivery extends ChannelDelivery {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface PushChannelDelivery extends ChannelDelivery {
  fcmCredentials: any;
}

interface InAppChannelDelivery extends ChannelDelivery {
  db: any;
}

/**
 * Email Channel Implementation
 */
class EmailChannel implements EmailChannelDelivery {
  apiKey: string;
  fromEmail: string;
  fromName: string;

  constructor(apiKey: string, fromEmail: string, fromName: string = 'Nexus Partners') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async send(payload: NotificationPayload, template: NotificationTemplate): Promise<NotificationDeliveryResult> {
    const renderedBody = this.renderTemplate(template.body, payload.data);
    const renderedSubject = template.subject ? this.renderTemplate(template.subject, payload.data) : 'Notificação Nexus';

    try {
      // In production, integrate with Resend API
      // const response = await resend.emails.send({
      //   from: `${this.fromName} <${this.fromEmail}>`,
      //   to: payload.data.email,
      //   subject: renderedSubject,
      //   text: renderedBody,
      // });

      // Simulated for development
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[EmailChannel] Sending to user ${payload.userId}: ${renderedSubject}`);

      return {
        success: true,
        channel: 'email',
        messageId,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        error: error instanceof Error ? error.message : 'Email delivery failed',
        deliveredAt: new Date(),
      };
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{${key}}`, 'g');
      if (Array.isArray(value)) {
        result = result.replace(regex, value.join('\n- '));
      } else {
        result = result.replace(regex, String(value));
      }
    }
    return result;
  }
}

/**
 * In-App Notification Channel
 */
class InAppChannel implements InAppChannelDelivery {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async send(payload: NotificationPayload, template: NotificationTemplate): Promise<NotificationDeliveryResult> {
    const renderedBody = this.renderTemplate(template.body, payload.data);
    const renderedSubject = template.subject ? this.renderTemplate(template.subject, payload.data) : 'Notificação';

    try {
      // Store in notifications table
      const notification = {
        userId: payload.userId,
        type: template.id,
        title: renderedSubject,
        content: renderedBody,
        read: 0,
        priority: payload.priority,
        metadata: JSON.stringify(payload.metadata || {}),
        createdAt: new Date(),
      };

      // In production, insert into notifications table
      // await this.db.insert(notifications).values(notification);

      const messageId = `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[InAppChannel] Created notification for user ${payload.userId}: ${renderedSubject}`);

      return {
        success: true,
        channel: 'in_app',
        messageId,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        channel: 'in_app',
        error: error instanceof Error ? error.message : 'In-app notification failed',
        deliveredAt: new Date(),
      };
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }
}

/**
 * Push Notification Channel
 */
class PushChannel implements PushChannelDelivery {
  private fcmCredentials: any;

  constructor(fcmCredentials: any) {
    this.fcmCredentials = fcmCredentials;
  }

  async send(payload: NotificationPayload, template: NotificationTemplate): Promise<NotificationDeliveryResult> {
    const renderedBody = this.renderTemplate(template.body, payload.data);

    try {
      // In production, integrate with Firebase Cloud Messaging
      // const message = {
      //   notification: { title: template.subject || 'Nexus', body: renderedBody },
      //   data: payload.metadata,
      //   token: fcmToken,
      // };
      // await admin.messaging().send(message);

      const messageId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[PushChannel] Sending to user ${payload.userId}: ${renderedBody}`);

      return {
        success: true,
        channel: 'push',
        messageId,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        channel: 'push',
        error: error instanceof Error ? error.message : 'Push notification failed',
        deliveredAt: new Date(),
      };
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }
}

/**
 * Notification Manager
 * Orchestrates notification delivery across multiple channels
 */
export class NotificationManager extends EventEmitter {
  private channels: Map<NotificationChannel, ChannelDelivery> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private queue: NotificationPayload[] = [];
  private isProcessing = false;

  constructor() {
    super();
    this.initializeTemplates();
    this.startQueueProcessor();
  }

  /**
   * Configure email channel
   */
  configureEmailChannel(apiKey: string, fromEmail: string, fromName?: string): void {
    this.channels.set('email', new EmailChannel(apiKey, fromEmail, fromName));
  }

  /**
   * Configure in-app channel
   */
  configureInAppChannel(db: any): void {
    this.channels.set('in_app', new InAppChannel(db));
  }

  /**
   * Configure push channel
   */
  configurePushChannel(fcmCredentials: any): void {
    this.channels.set('push', new PushChannel(fcmCredentials));
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    Object.values(NotificationTemplates).forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Register custom template
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    this.emit('template:registered', template);
  }

  /**
   * Send single notification
   */
  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult[]> {
    const template = this.templates.get(payload.templateId);
    if (!template) {
      throw new Error(`Template not found: ${payload.templateId}`);
    }

    const channel = this.channels.get(payload.channel);
    if (!channel) {
      throw new Error(`Channel not configured: ${payload.channel}`);
    }

    this.emit('notification:send', { payload, template });

    const result = await channel.send(payload, template);

    this.emit('notification:sent', { payload, result });

    return [result];
  }

  /**
   * Send notification to multiple channels
   */
  async broadcast(payload: NotificationPayload): Promise<NotificationDeliveryResult[]> {
    const template = this.templates.get(payload.templateId);
    if (!template) {
      throw new Error(`Template not found: ${payload.templateId}`);
    }

    const results: NotificationDeliveryResult[] = [];
    const channelsToSend = payload.channel === 'all'
      ? Array.from(this.channels.keys())
      : [payload.channel];

    for (const channelName of channelsToSend) {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          const result = await channel.send(payload, template);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            channel: channelName,
            error: error instanceof Error ? error.message : 'Unknown error',
            deliveredAt: new Date(),
          });
        }
      }
    }

    this.emit('notification:broadcast', { payload, results });

    return results;
  }

  /**
   * Queue notification for async processing
   */
  enqueue(payload: NotificationPayload): void {
    this.queue.push(payload);
    this.emit('notification:enqueued', { payload });
  }

  /**
   * Schedule notification for later
   */
  schedule(payload: NotificationPayload): void {
    if (!payload.scheduledAt) {
      throw new Error('scheduledAt is required for scheduled notifications');
    }

    const delay = payload.scheduledAt.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.enqueue(payload);
      }, delay);
    }

    this.emit('notification:scheduled', { payload, scheduledFor: payload.scheduledAt });
  }

  /**
   * Send tier promotion notification
   */
  async sendTierPromotion(
    userId: number,
    affiliateId: number,
    previousTier: string,
    newTier: string,
    benefits: string[],
    partnerName: string
  ): Promise<NotificationDeliveryResult[]> {
    const payload: NotificationPayload = {
      userId,
      affiliateId,
      templateId: 'tier_promotion',
      channel: 'email',
      priority: 'high',
      data: {
        partnerName,
        previousTier,
        newTier,
        benefits,
        promotionDate: new Date().toLocaleDateString('pt-BR'),
      },
      metadata: {
        tierPromotion: { previousTier, newTier, benefits },
      },
    };

    // Broadcast to all channels
    const results = await this.broadcast({
      ...payload,
      channel: 'all' as any,
    });

    this.emit('tier_promotion:sent', { userId, previousTier, newTier, results });

    return results;
  }

  /**
   * Send commission notification
   */
  async sendCommissionNotification(
    userId: number,
    affiliateId: number,
    amount: number,
    saleId: string,
    partnerName: string
  ): Promise<NotificationDeliveryResult[]> {
    const payload: NotificationPayload = {
      userId,
      affiliateId,
      templateId: 'commission_received',
      channel: 'email',
      priority: 'normal',
      data: {
        partnerName,
        amount: amount.toFixed(2).replace('.', ','),
        saleId,
        date: new Date().toLocaleDateString('pt-BR'),
      },
      metadata: {
        commission: { amount, saleId },
      },
    };

    return this.broadcast({
      ...payload,
      channel: 'all' as any,
    });
  }

  /**
   * Get notification history for user
   */
  async getUserNotifications(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    // In production, query from notifications table
    // return await this.db.select().from(notifications).where(eq(notifications.userId, userId)).limit(limit).offset(offset);
    return [];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // In production, update notifications table
    // await this.db.update(notifications).set({ read: 1 }).where(eq(notifications.id, notificationId));
    this.emit('notification:read', { notificationId });
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    // In production, count unread notifications
    return 0;
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    }, 1000);
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const payload = this.queue.shift();
      if (payload) {
        try {
          await this.send(payload);
        } catch (error) {
          this.emit('notification:error', { payload, error });
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get manager statistics
   */
  getStats(): {
    channelsConfigured: number;
    templatesRegistered: number;
    queueLength: number;
  } {
    return {
      channelsConfigured: this.channels.size,
      templatesRegistered: this.templates.size,
      queueLength: this.queue.length,
    };
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Tier Promotion Helper Function
export async function notifyTierPromotion(
  userId: number,
  affiliateId: number,
  previousTier: string,
  newTier: string,
  benefits: string[],
  partnerName: string
): Promise<void> {
  await notificationManager.sendTierPromotion(
    userId,
    affiliateId,
    previousTier,
    newTier,
    benefits,
    partnerName
  );
}

// Commission Notification Helper
export async function notifyCommissionReceived(
  userId: number,
  affiliateId: number,
  amount: number,
  saleId: string,
  partnerName: string
): Promise<void> {
  await notificationManager.sendCommissionNotification(
    userId,
    affiliateId,
    amount,
    saleId,
    partnerName
  );
}