#!/usr/bin/env bash
# ==============================================================================
# Script de Configuração do Sistema de Comunicação AI-to-AI
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script configura o sistema de comunicação entre agentes,
# permitindo troca de leads, ofertas cruzadas e suporte dentro da rede.
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
SERVICES_DIR="$BACKEND_DIR/src/services"

# Criar diretório de comunicação AI-to-AI
setup_communication_directory() {
    log_info "Configurando diretório de comunicação AI-to-AI..."

    mkdir -p "$SERVICES_DIR/ai-communication"
    log_success "Diretório de comunicação criado"
}

# Criar protocolo de mensagens
create_message_protocol() {
    log_info "Criando protocolo de mensagens..."

    cat > "$SERVICES_DIR/ai-communication/message-protocol.ts" << 'EOF'
/**
 * Protocolo de Comunicação AI-to-AI
 * Define os tipos de mensagens e protocolo de comunicação entre agentes
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';

// Tipos de mensagens
export enum MessageType {
  OFFER_SHARING = 'OFFER_SHARING',
  LEAD_EXCHANGE = 'LEAD_EXCHANGE',
  SUPPORT_REQUEST = 'SUPPORT_REQUEST',
  PERFORMANCE_UPDATE = 'PERFORMANCE_UPDATE',
  COLLABORATION_PROPOSAL = 'COLLABORATION_PROPOSAL',
  NETWORK_ALERT = 'NETWORK_ALERT',
}

// Schema para mensagem base
export const BaseMessageSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(MessageType),
  senderAgentId: z.string(),
  recipientAgentId: z.string().nullable(), // null para broadcast
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  timestamp: z.date(),
  expiresAt: z.date().nullable(),
  metadata: z.record(z.any()).optional(),
});

// Schema para OFFER_SHARING
export const OfferSharingMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.OFFER_SHARING),
  payload: z.object({
    offerId: z.string(),
    productId: z.string(),
    productName: z.string(),
    commissionRate: z.number(),
    marketplace: z.enum(['mercadolibre', 'shopee', 'hotmart', 'internal']),
    description: z.string(),
    targetAudience: z.array(z.string()).optional(),
    validityPeriod: z.date(),
  }),
});

// Schema para LEAD_EXCHANGE
export const LeadExchangeMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.LEAD_EXCHANGE),
  payload: z.object({
    leadId: z.string(),
    leadScore: z.number().min(0).max(100),
    leadSource: z.string(),
    interest: z.string(),
    contactPreference: z.enum(['whatsapp', 'email', 'instagram', 'facebook']),
    qualificationLevel: z.enum(['hot', 'warm', 'cold']),
    notes: z.string().optional(),
  }),
});

// Schema para SUPPORT_REQUEST
export const SupportRequestMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.SUPPORT_REQUEST),
  payload: z.object({
    requestType: z.enum(['technical', 'strategy', 'content', 'network']),
    subject: z.string(),
    description: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
    attachments: z.array(z.string()).optional(),
  }),
});

// Schema para PERFORMANCE_UPDATE
export const PerformanceUpdateMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.PERFORMANCE_UPDATE),
  payload: z.object({
    metrics: z.object({
      salesCount: z.number(),
      commissionAmount: z.number(),
      engagementRate: z.number(),
      conversionRate: z.number(),
    }),
    period: z.enum(['daily', 'weekly', 'monthly']),
  }),
});

// Schema para COLLABORATION_PROPOSAL
export const CollaborationProposalMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.COLLABORATION_PROPOSAL),
  payload: z.object({
    projectName: z.string(),
    projectDescription: z.string(),
    expectedOutcome: z.string(),
    resourceRequirements: z.array(z.string()),
    timeline: z.date(),
    revenueShare: z.number().min(0).max(100),
  }),
});

// Schema para NETWORK_ALERT
export const NetworkAlertMessageSchema = BaseMessageSchema.extend({
  type: z.literal(MessageType.NETWORK_ALERT),
  payload: z.object({
    alertType: z.enum(['new_member', 'rank_change', 'milestone', 'opportunity']),
    message: z.string(),
    relatedEntityId: z.string().optional(),
    actionRequired: z.boolean().default(false),
  }),
});

// Tipo union para todos os tipos de mensagem
export const MessageSchema = z.discriminatedUnion('type', [
  OfferSharingMessageSchema,
  LeadExchangeMessageSchema,
  SupportRequestMessageSchema,
  PerformanceUpdateMessageSchema,
  CollaborationProposalMessageSchema,
  NetworkAlertMessageSchema,
]);

// Tipos inferidos
export type BaseMessage = z.infer<typeof BaseMessageSchema>;
export type OfferSharingMessage = z.infer<typeof OfferSharingMessageSchema>;
export type LeadExchangeMessage = z.infer<typeof LeadExchangeMessageSchema>;
export type SupportRequestMessage = z.infer<typeof SupportRequestMessageSchema>;
export type PerformanceUpdateMessage = z.infer<typeof PerformanceUpdateMessageSchema>;
export type CollaborationProposalMessage = z.infer<typeof CollaborationProposalMessageSchema>;
export type NetworkAlertMessage = z.infer<typeof NetworkAlertMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;

// Factory para criar mensagens
export function createMessage<T extends Message>(
  type: MessageType,
  senderAgentId: string,
  recipientAgentId: string | null,
  payload: T['payload'],
  priority: BaseMessage['priority'] = 'medium'
): T {
  return {
    id: nanoid(),
    type,
    senderAgentId,
    recipientAgentId,
    priority,
    timestamp: new Date(),
    expiresAt: null,
    metadata: {},
    payload,
  } as T;
}

// Funções de criação específicas
export function createOfferSharingMessage(
  senderAgentId: string,
  recipientAgentId: string | null,
  offer: OfferSharingMessage['payload']
): OfferSharingMessage {
  return createMessage(MessageType.OFFER_SHARING, senderAgentId, recipientAgentId, offer);
}

export function createLeadExchangeMessage(
  senderAgentId: string,
  recipientAgentId: string | null,
  lead: LeadExchangeMessage['payload']
): LeadExchangeMessage {
  return createMessage(MessageType.LEAD_EXCHANGE, senderAgentId, recipientAgentId, lead, 'high');
}

export function createSupportRequestMessage(
  senderAgentId: string,
  recipientAgentId: string | null,
  request: SupportRequestMessage['payload']
): SupportRequestMessage {
  return createMessage(MessageType.SUPPORT_REQUEST, senderAgentId, recipientAgentId, request);
}

export function createPerformanceUpdateMessage(
  senderAgentId: string,
  recipientAgentId: string | null,
  metrics: PerformanceUpdateMessage['payload']['metrics'],
  period: PerformanceUpdateMessage['payload']['period']
): PerformanceUpdateMessage {
  return createMessage(
    MessageType.PERFORMANCE_UPDATE,
    senderAgentId,
    recipientAgentId,
    { metrics, period }
  );
}
EOF

    log_success "Protocolo de mensagens criado"
}

# Criar serviço de roteamento
create_message_router() {
    log_info "Criando serviço de roteamento de mensagens..."

    cat > "$SERVICES_DIR/ai-communication/message-router.ts" << 'EOF'
/**
 * Serviço de Roteamento de Mensagens AI-to-AI
 * Responsável por direcionar mensagens para os destinatários apropriados
 */

import { db } from '../../db';
import { agents } from '../../database/schemas/schema-final';
import { eq, and, or } from 'drizzle-orm';
import { Message, MessageType, BaseMessage } from './message-protocol';
import { nanoid } from 'nanoid';

export interface MessageRoute {
  messageId: string;
  senderAgentId: string;
  recipientAgentId: string;
  deliveryStatus: 'pending' | 'delivered' | 'read' | 'failed';
  deliveredAt: Date | null;
  readAt: Date | null;
}

export interface RoutingRule {
  id: string;
  type: MessageType;
  condition: (message: Message) => boolean;
  targetAgents: string[];
  priority: number;
}

/**
 * Criar rota para mensagem
 */
export async function createMessageRoute(message: Message): Promise<MessageRoute> {
  const route: MessageRoute = {
    messageId: message.id,
    senderAgentId: message.senderAgentId,
    recipientAgentId: message.recipientAgentId || '',
    deliveryStatus: 'pending',
    deliveredAt: null,
    readAt: null,
  };

  console.log('[MessageRouter] Creating route:', route);

  // TODO: Persistir no banco de dados
  // Por enquanto, retornar route em memória
  return route;
}

/**
 * Roteamento baseado em regras
 */
export function applyRoutingRules(
  message: Message,
  rules: RoutingRule[]
): string[] {
  // Filtrar regras aplicáveis ao tipo de mensagem
  const applicableRules = rules
    .filter(rule => rule.type === message.type)
    .sort((a, b) => b.priority - a.priority);

  // Aplicar condições
  const targetAgents: Set<string> = new Set();

  for (const rule of applicableRules) {
    if (rule.condition(message)) {
      rule.targetAgents.forEach(agentId => targetAgents.add(agentId));
    }
  }

  // Adicionar recipient específico se definido
  if (message.recipientAgentId) {
    targetAgents.add(message.recipientAgentId);
  }

  // Remover remetente da lista
  targetAgents.delete(message.senderAgentId);

  return Array.from(targetAgents);
}

/**
 * Encontrar agentes por critérios
 */
export async function findAgentsByCriteria(criteria: {
  classification?: string[];
  networkLevel?: number;
  performanceMin?: number;
  status?: string[];
}): Promise<string[]> {
  // TODO: Implementar busca no banco de dados
  return [];
}

/**
 * Roteamento inteligente para OFFER_SHARING
 * Encontra agentes com perfil compatível para compartilhar oferta
 */
export async function routeOfferSharing(
  senderAgentId: string,
  productCategory: string,
  targetAudience: string[]
): Promise<string[]> {
  // Encontrar agentes com nichos compatíveis
  const compatibleAgents = await findAgentsByCriteria({
    classification: ['generative', 'orchestrator', 'agentic'],
    status: ['active'],
  });

  // Filtrar por relevância (por enquanto, retornar todos)
  return compatibleAgents.filter(id => id !== senderAgentId);
}

/**
 * Roteamento inteligente para LEAD_EXCHANGE
 * Encontra agentes com maior potencial para converter lead específico
 */
export async function routeLeadExchange(
  senderAgentId: string,
  leadScore: number,
  interest: string
): Promise<string[]> {
  // Priorizar agentes com alta performance
  const topPerformers = await findAgentsByCriteria({
    classification: ['predictive', 'generative', 'orchestrator'],
    performanceMin: 70,
    status: ['active'],
  });

  // Filtrar por nichos relacionados ao interesse
  return topPerformers.filter(id => id !== senderAgentId);
}

/**
 * Roteamento para SUPPORT_REQUEST
 * Direciona para agentes com expertise no tipo de solicitação
 */
export async function routeSupportRequest(
  senderAgentId: string,
  requestType: string
): Promise<string[]> {
  const expertMap: Record<string, string[]> = {
    technical: [], // Agentes com expertise técnica
    strategy: [], // Agentes com expertise em estratégia
    content: [], // Agentes com expertise em conteúdo
    network: [], // Agentes com expertise em networking
  };

  const experts = expertMap[requestType] || [];
  return experts.filter(id => id !== senderAgentId);
}

/**
 * Roteamento broadcast para NETWORK_ALERT
 * Envia para todos os agentes na rede do remetente
 */
export async function routeNetworkAlert(
  senderAgentId: string,
  alertType: string
): Promise<string[]> {
  // Encontrar todos os agentes no mesmo network
  const networkAgents = await findAgentsByCriteria({
    status: ['active'],
  });

  return networkAgents.filter(id => id !== senderAgentId);
}

/**
 * Marcar mensagem como entregue
 */
export async function markAsDelivered(messageId: string): Promise<void> {
  console.log(`[MessageRouter] Marking message ${messageId} as delivered`);
  // TODO: Atualizar no banco de dados
}

/**
 * Marcar mensagem como lida
 */
export async function markAsRead(messageId: string): Promise<void> {
  console.log(`[MessageRouter] Marking message ${messageId} as read`);
  // TODO: Atualizar no banco de dados
}
EOF

    log_success "Serviço de roteamento criado"
}

# Criar serviço de message broker
create_message_broker() {
    log_info "Criando serviço de message broker..."

    cat > "$SERVICES_DIR/ai-communication/message-broker.ts" << 'EOF'
/**
 * Message Broker para Comunicação AI-to-AI
 * Gerencia delivery, retry e confirmação de mensagens
 */

import { Message, MessageType } from './message-protocol';
import { createMessageRoute, markAsDelivered, markAsRead } from './message-router';
import { notifyOwner } from '../../_core/notification';

export interface MessageDeliveryResult {
  success: boolean;
  messageId: string;
  deliveredAt: Date;
  error?: string;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  maxBackoffMs: number;
}

// Configuração padrão de retry
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  maxBackoffMs: 30000,
};

/**
 * Enviar mensagem
 */
export async function sendMessage(
  message: Message,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<MessageDeliveryResult> {
  console.log(`[MessageBroker] Sending message ${message.id} to ${message.recipientAgentId || 'broadcast'}`);

  try {
    // Criar rota para mensagem
    const route = await createMessageRoute(message);

    // Simular delivery (em produção, usar sistema de filas real)
    const result = await attemptDelivery(message, retryConfig, 0);

    // Notificar destinatário
    if (result.success && message.recipientAgentId) {
      await notifyOwner({
        title: 'Nova mensagem AI-to-AI',
        content: `Mensagem recebida de agente ${message.senderAgentId}`,
      });
    }

    return result;
  } catch (error) {
    console.error('[MessageBroker] Failed to send message:', error);
    return {
      success: false,
      messageId: message.id,
      deliveredAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Tentar delivery com retry
 */
async function attemptDelivery(
  message: Message,
  config: RetryConfig,
  attemptNumber: number
): Promise<MessageDeliveryResult> {
  try {
    // Simular delay de network
    await new Promise(resolve => setTimeout(resolve, 100));

    // Marcar como entregue
    await markAsDelivered(message.id);

    return {
      success: true,
      messageId: message.id,
      deliveredAt: new Date(),
    };
  } catch (error) {
    console.error(`[MessageBroker] Delivery attempt ${attemptNumber + 1} failed:`, error);

    if (attemptNumber < config.maxRetries) {
      // Calcular backoff exponencial
      const delay = Math.min(
        config.backoffMs * Math.pow(2, attemptNumber),
        config.maxBackoffMs
      );

      console.log(`[MessageBroker] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return attemptDelivery(message, config, attemptNumber + 1);
    }

    return {
      success: false,
      messageId: message.id,
      deliveredAt: new Date(),
      error: error instanceof Error ? error.message : 'Max retries exceeded',
    };
  }
}

/**
 * Broadcast mensagem para múltiplos destinatários
 */
export async function broadcastMessage(
  message: Message,
  recipientIds: string[]
): Promise<MessageDeliveryResult[]> {
  console.log(`[MessageBroker] Broadcasting message ${message.id} to ${recipientIds.length} recipients`);

  const results = await Promise.all(
    recipientIds.map(recipientId =>
      sendMessage(
        { ...message, recipientAgentId: recipientId },
        DEFAULT_RETRY_CONFIG
      )
    )
  );

  const successCount = results.filter(r => r.success).length;
  console.log(`[MessageBroker] Broadcast complete: ${successCount}/${recipientIds.length} delivered`);

  return results;
}

/**
 * Encaminhar mensagem para novo destinatário
 */
export async function forwardMessage(
  originalMessage: Message,
  newRecipientId: string
): Promise<MessageDeliveryResult> {
  const forwardedMessage: Message = {
    ...originalMessage,
    id: `${originalMessage.id}-fwd`,
    recipientAgentId: newRecipientId,
    timestamp: new Date(),
    metadata: {
      ...originalMessage.metadata,
      forwardedFrom: originalMessage.senderAgentId,
      originalMessageId: originalMessage.id,
    },
  };

  return sendMessage(forwardedMessage);
}
EOF

    log_success "Message broker criado"
}

# Criar export do módulo
setup_exports() {
    log_info "Configurando exports do módulo de comunicação..."

    cat > "$SERVICES_DIR/ai-communication/index.ts" << 'EOF'
/**
 * Módulo de Comunicação AI-to-AI
 * Exporta serviços para comunicação entre agentes
 */

export * from './message-protocol';
export * from './message-router';
export * from './message-broker';
EOF

    log_success "Exports configurados"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  CONFIGURAÇÃO COMUNICAÇÃO AI-TO-AI"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_communication_directory
    create_message_protocol
    create_message_router
    create_message_broker
    setup_exports

    echo ""
    log_success "Sistema de comunicação AI-to-AI configurado com sucesso"
    echo ""
    echo "Arquivos criados:"
    echo "  - $SERVICES_DIR/ai-communication/message-protocol.ts"
    echo "  - $SERVICES_DIR/ai-communication/message-router.ts"
    echo "  - $SERVICES_DIR/ai-communication/message-broker.ts"
    echo "  - $SERVICES_DIR/ai-communication/index.ts"
    echo ""
    echo "Tipos de mensagens disponíveis:"
    echo "  - OFFER_SHARING: Compartilhamento de ofertas"
    echo "  - LEAD_EXCHANGE: Troca de leads"
    echo "  - SUPPORT_REQUEST: Pedidos de suporte"
    echo "  - PERFORMANCE_UPDATE: Atualização de performance"
    echo "  - COLLABORATION_PROPOSAL: Propostas de colaboração"
    echo "  - NETWORK_ALERT: Alertas de rede"
    echo ""
}

# Executar função principal
main "$@"