#!/usr/bin/env bash
# ==============================================================================
# Script de Configuração do Sistema Orquestrador
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script configura o sistema de orquestração multi-agente,
# permitindo coordenação de agentes especializados em tarefas específicas.
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
ROUTERS_DIR="$BACKEND_DIR/src/routers"

# Criar diretórios necessários
setup_directories() {
    log_info "Configurando diretórios..."

    mkdir -p "$SERVICES_DIR/orchestrator"
    mkdir -p "$SERVICES_DIR/agent-registry"
    mkdir -p "$SERVICES_DIR/task-queue"

    log_success "Diretórios criados"
}

# Criar serviço de registro de agentes
create_agent_registry() {
    log_info "Criando serviço de registro de agentes..."

    cat > "$SERVICES_DIR/agent-registry/agent-registry.ts" << 'EOF'
/**
 * Serviço de Registro de Agentes
 * Responsável por manter o registro central de todos os agentes IA
 * e suas especialidades/habilidades
 */

import { nanoid } from 'nanoid';
import { db } from '../../db';
import { agents } from '../../database/schemas/schema-final';
import { eq } from 'drizzle-orm';

export type AgentType = 'affiliate' | 'predictive' | 'generative' | 'orchestrator' | 'agentic';
export type AgentStatus = 'learning' | 'active' | 'paused' | 'inactive';

export interface AgentSkill {
  skillId: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastUsed?: Date;
  successRate: number;
}

export interface AgentRegistration {
  id: string;
  userId: number;
  name: string;
  type: AgentType;
  status: AgentStatus;
  skills: AgentSkill[];
  specializations: string[];
  performanceScore: number;
  maxConcurrentTasks: number;
  currentTasks: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Registry em memória (em produção seria Redis ou banco)
const agentRegistry = new Map<string, AgentRegistration>();

/**
 * Registrar um novo agente
 */
export async function registerAgent(params: {
  userId: number;
  name: string;
  type: AgentType;
  specializations: string[];
  maxConcurrentTasks?: number;
}): Promise<AgentRegistration> {
  const id = nanoid();

  const agent: AgentRegistration = {
    id,
    userId: params.userId,
    name: params.name,
    type: params.type,
    status: 'learning',
    skills: [],
    specializations: params.specializations,
    performanceScore: 0,
    maxConcurrentTasks: params.maxConcurrentTasks || 5,
    currentTasks: 0,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  agentRegistry.set(id, agent);

  console.log(`[AgentRegistry] Registered agent: ${agent.name} (${id})`);

  return agent;
}

/**
 * Obter agente por ID
 */
export function getAgent(id: string): AgentRegistration | undefined {
  return agentRegistry.get(id);
}

/**
 * Obter agente por userId
 */
export function getAgentByUserId(userId: number): AgentRegistration | undefined {
  for (const agent of agentRegistry.values()) {
    if (agent.userId === userId) return agent;
  }
  return undefined;
}

/**
 * Listar agentes por tipo
 */
export function getAgentsByType(type: AgentType): AgentRegistration[] {
  return Array.from(agentRegistry.values()).filter(a => a.type === type);
}

/**
 * Listar agentes ativos
 */
export function getActiveAgents(): AgentRegistration[] {
  return Array.from(agentRegistry.values()).filter(a => a.status === 'active');
}

/**
 * Adicionar skill a um agente
 */
export function addSkillToAgent(agentId: string, skill: Omit<AgentSkill, 'successRate'>): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent) return false;

  agent.skills.push({
    ...skill,
    successRate: 0,
  });
  agent.updatedAt = new Date();

  return true;
}

/**
 * Atualizar taxa de sucesso de uma skill
 */
export function updateSkillSuccessRate(agentId: string, skillId: string, successRate: number): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent) return false;

  const skill = agent.skills.find(s => s.skillId === skillId);
  if (!skill) return false;

  skill.successRate = successRate;
  skill.lastUsed = new Date();
  agent.updatedAt = new Date();

  return true;
}

/**
 * Verificar se agente pode aceitar nova tarefa
 */
export function canAcceptTask(agentId: string): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent) return false;

  return agent.status === 'active' && agent.currentTasks < agent.maxConcurrentTasks;
}

/**
 * Incrementar tarefas atuais do agente
 */
export function incrementTaskCount(agentId: string): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent || !canAcceptTask(agentId)) return false;

  agent.currentTasks++;
  agent.updatedAt = new Date();
  return true;
}

/**
 * Decrementar tarefas atuais do agente
 */
export function decrementTaskCount(agentId: string): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent || agent.currentTasks <= 0) return false;

  agent.currentTasks--;
  agent.updatedAt = new Date();
  return true;
}

/**
 * Atualizar score de performance
 */
export function updatePerformanceScore(agentId: string, score: number): boolean {
  const agent = agentRegistry.get(agentId);
  if (!agent) return false;

  agent.performanceScore = Math.max(0, Math.min(100, score));
  agent.updatedAt = new Date();
  return true;
}

/**
 * Buscar agentes disponíveis para um tipo de tarefa
 */
export function findAvailableAgents(taskType: string): AgentRegistration[] {
  return Array.from(agentRegistry.values()).filter(agent => {
    if (agent.status !== 'active') return false;
    if (agent.currentTasks >= agent.maxConcurrentTasks) return false;
    if (agent.type === 'orchestrator') return false; // Orquestrador não executa tarefas

    // Verificar especialização
    return agent.specializations.some(spec =>
      taskType.toLowerCase().includes(spec.toLowerCase())
    );
  });
}

/**
 * Obter estatísticas do registry
 */
export function getRegistryStats(): {
  totalAgents: number;
  activeAgents: number;
  byType: Record<AgentType, number>;
} {
  const agents = Array.from(agentRegistry.values());

  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    byType: {
      affiliate: agents.filter(a => a.type === 'affiliate').length,
      predictive: agents.filter(a => a.type === 'predictive').length,
      generative: agents.filter(a => a.type === 'generative').length,
      orchestrator: agents.filter(a => a.type === 'orchestrator').length,
      agentic: agents.filter(a => a.type === 'agentic').length,
    },
  };
}
EOF

    log_success "Serviço de registro de agentes criado"
}

# Criar serviço de fila de tarefas
create_task_queue() {
    log_info "Criando serviço de fila de tarefas..."

    cat > "$SERVICES_DIR/task-queue/task-queue.ts" << 'EOF'
/**
 * Serviço de Fila de Tarefas
 * Gerencia a distribuição de tarefas para agentes disponíveis
 */

import { nanoid } from 'nanoid';
import { findAvailableAgents, incrementTaskCount, decrementTaskCount } from '../agent-registry/agent-registry';

export type TaskStatus = 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  type: string;
  description: string;
  priority: TaskPriority;
  parameters: Record<string, unknown>;
  assignedAgentId?: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

// Filas organizadas por prioridade
const taskQueues: Record<TaskPriority, Task[]> = {
  critical: [],
  high: [],
  medium: [],
  low: [],
};

// Histórico de tarefas
const taskHistory: Map<string, Task> = new Map();

/**
 * Adicionar tarefa à fila
 */
export function addTask(params: {
  type: string;
  description: string;
  priority?: TaskPriority;
  parameters?: Record<string, unknown>;
  maxRetries?: number;
}): Task {
  const task: Task = {
    id: nanoid(),
    type: params.type,
    description: params.description,
    priority: params.priority || 'medium',
    parameters: params.parameters || {},
    status: 'pending',
    createdAt: new Date(),
    retryCount: 0,
    maxRetries: params.maxRetries || 3,
  };

  taskQueues[task.priority].push(task);
  taskHistory.set(task.id, task);

  console.log(`[TaskQueue] Added task ${task.id} to ${task.priority} queue`);

  // Tentar atribuir imediatamente
  assignTask(task.id);

  return task;
}

/**
 * Atribuir tarefa a um agente disponível
 */
export function assignTask(taskId: string): boolean {
  const task = taskHistory.get(taskId);
  if (!task || task.status !== 'pending') return false;

  // Buscar agentes disponíveis
  const availableAgents = findAvailableAgents(task.type);

  if (availableAgents.length === 0) {
    console.log(`[TaskQueue] No available agents for task ${taskId}`);
    return false;
  }

  // Selecionar agente com menor carga (round-robin simples)
  const selectedAgent = availableAgents.reduce((prev, curr) =>
    prev.currentTasks < curr.currentTasks ? prev : curr
  );

  // Atribuir tarefa
  task.assignedAgentId = selectedAgent.id;
  task.status = 'assigned';
  task.assignedAt = new Date();

  // Incrementar contador do agente
  incrementTaskCount(selectedAgent.id);

  console.log(`[TaskQueue] Assigned task ${taskId} to agent ${selectedAgent.name}`);

  return true;
}

/**
 * Iniciar execução de tarefa
 */
export function startTask(taskId: string): boolean {
  const task = taskHistory.get(taskId);
  if (!task || task.status !== 'assigned') return false;

  task.status = 'executing';
  task.startedAt = new Date();

  console.log(`[TaskQueue] Task ${taskId} started`);

  return true;
}

/**
 * Completar tarefa com sucesso
 */
export function completeTask(taskId: string, result: unknown): boolean {
  const task = taskHistory.get(taskId);
  if (!task || task.status !== 'executing') return false;

  task.status = 'completed';
  task.result = result;
  task.completedAt = new Date();

  // Decrementar contador do agente
  if (task.assignedAgentId) {
    decrementTaskCount(task.assignedAgentId);
  }

  console.log(`[TaskQueue] Task ${taskId} completed`);

  return true;
}

/**
 * Falhar tarefa
 */
export function failTask(taskId: string, error: string): boolean {
  const task = taskHistory.get(taskId);
  if (!task) return false;

  task.retryCount++;

  if (task.retryCount < task.maxRetries) {
    // Tentar novamente
    task.status = 'pending';
    task.error = error;
    console.log(`[TaskQueue] Task ${taskId} failed, retrying (${task.retryCount}/${task.maxRetries})`);

    // Recolocar na fila
    taskQueues[task.priority].push(task);

    // Tentar atribuir novamente
    return assignTask(taskId);
  }

  // Excedeu tentativas
  task.status = 'failed';
  task.error = error;
  task.completedAt = new Date();

  // Decrementar contador do agente
  if (task.assignedAgentId) {
    decrementTaskCount(task.assignedAgentId);
  }

  console.log(`[TaskQueue] Task ${taskId} failed permanently`);

  return false;
}

/**
 * Obter tarefa por ID
 */
export function getTask(taskId: string): Task | undefined {
  return taskHistory.get(taskId);
}

/**
 * Obter tarefas pendentes
 */
export function getPendingTasks(): Task[] {
  return Array.from(taskHistory.values()).filter(t => t.status === 'pending');
}

/**
 * Obter tarefas em execução
 */
export function getExecutingTasks(): Task[] {
  return Array.from(taskHistory.values()).filter(t => t.status === 'executing');
}

/**
 * Obter estatísticas da fila
 */
export function getQueueStats(): {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  total: number;
} {
  const tasks = Array.from(taskHistory.values());

  return {
    byStatus: {
      pending: tasks.filter(t => t.status === 'pending').length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      executing: tasks.filter(t => t.status === 'executing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    },
    byPriority: {
      critical: taskQueues.critical.length,
      high: taskQueues.high.length,
      medium: taskQueues.medium.length,
      low: taskQueues.low.length,
    },
    total: tasks.length,
  };
}
EOF

    log_success "Serviço de fila de tarefas criado"
}

# Criar router de orquestração simplificado
create_orchestrator_router() {
    log_info "Criando router de orquestração..."

    cat > "$ROUTERS_DIR/orchestration-simple.ts" << 'EOF'
import { z } from 'zod';
import { publicProcedure, router } from '../config/trpc';
import { TRPCError } from '@trpc/server';
import {
  registerAgent,
  getAgent,
  getAgentByUserId,
  getAgentsByType,
  getActiveAgents,
  addSkillToAgent,
  getRegistryStats
} from '../services/agent-registry/agent-registry';
import {
  addTask,
  getTask,
  getPendingTasks,
  getExecutingTasks,
  getQueueStats
} from '../services/task-queue/task-queue';

export const orchestrationSimpleRouter = router({
  // ============ AGENT MANAGEMENT ============

  registerAgent: publicProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string(),
      type: z.enum(['affiliate', 'predictive', 'generative', 'orchestrator', 'agentic']),
      specializations: z.array(z.string()),
      maxConcurrentTasks: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const agent = await registerAgent(input);
        return { success: true, agent };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register agent',
        });
      }
    }),

  getAgent: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const agent = getAgent(input.id);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }
      return agent;
    }),

  getAgentByUserId: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const agent = getAgentByUserId(input.userId);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found for this user' });
      }
      return agent;
    }),

  listAgentsByType: publicProcedure
    .input(z.object({ type: z.enum(['affiliate', 'predictive', 'generative', 'orchestrator', 'agentic']) }))
    .query(async ({ input }) => {
      return getAgentsByType(input.type);
    }),

  listActiveAgents: publicProcedure.query(async () => {
    return getActiveAgents();
  }),

  addSkill: publicProcedure
    .input(z.object({
      agentId: z.string(),
      skillName: z.string(),
      proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    }))
    .mutation(async ({ input }) => {
      const success = addSkillToAgent(input.agentId, {
        skillId: `skill_${Date.now()}`,
        name: input.skillName,
        proficiency: input.proficiency,
      });
      return { success };
    }),

  getRegistryStats: publicProcedure.query(async () => {
    return getRegistryStats();
  }),

  // ============ TASK MANAGEMENT ============

  createTask: publicProcedure
    .input(z.object({
      type: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      parameters: z.record(z.unknown()).optional(),
      maxRetries: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const task = addTask(input);
      return { success: true, task };
    }),

  getTask: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const task = getTask(input.id);
      if (!task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }
      return task;
    }),

  getPendingTasks: publicProcedure.query(async () => {
    return getPendingTasks();
  }),

  getExecutingTasks: publicProcedure.query(async () => {
    return getExecutingTasks();
  }),

  getQueueStats: publicProcedure.query(async () => {
    return getQueueStats();
  }),

  // ============ ORCHESTRATION STATUS ============

  getOrchestrationStatus: publicProcedure.query(async () => {
    const registryStats = getRegistryStats();
    const queueStats = getQueueStats();

    return {
      agents: registryStats,
      tasks: queueStats,
      health: registryStats.activeAgents > 0 ? 'healthy' : 'degraded',
    };
  }),
});

export type OrchestrationSimpleRouter = typeof orchestrationSimpleRouter;
EOF

    log_success "Router de orquestração simplificado criado"
}

# Criar script de inicialização do sistema
create_initialization_script() {
    log_info "Criando script de inicialização..."

    cat > "$SERVICES_DIR/orchestrator/initialize-orchestrator.ts" << 'EOF'
/**
 * Script de Inicialização do Sistema de Orquestração
 * Deve ser executado no startup da aplicação
 */

import { registerAgent, AgentType } from '../agent-registry/agent-registry';

const DEFAULT_SPECIALIZATIONS: Record<AgentType, string[]> = {
  affiliate: ['content_generation', 'social_media', 'prospecting'],
  predictive: ['analytics', 'trend_analysis', 'sentiment_analysis'],
  generative: ['copywriting', 'creative_content', 'multi_platform'],
  orchestrator: ['task_coordination', 'agent_management', 'workflow_optimization'],
  agentic: ['autonomous_operation', 'goal_setting', 'continuous_learning'],
};

/**
 * Inicializar agentes padrão do sistema
 */
export async function initializeDefaultAgents(): Promise<void> {
  console.log('[Orchestrator] Initializing default agents...');

  // Criar Agente Orquestrador Principal
  await registerAgent({
    userId: 0, // Sistema
    name: 'Nexus Orchestrator',
    type: 'orchestrator',
    specializations: DEFAULT_SPECIALIZATIONS.orchestrator,
    maxConcurrentTasks: 50,
  });

  console.log('[Orchestrator] Default agents initialized');
}

/**
 * Verificar saúde do sistema de orquestração
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // TODO: Verificar conexões com banco/redis
  // TODO: Verificar status das filas
  // TODO: Verificar agentes ativos

  return {
    healthy: issues.length === 0,
    issues,
  };
}

// Executar inicialização se chamado diretamente
if (require.main === module) {
  initializeDefaultAgents()
    .then(() => {
      console.log('[Orchestrator] Initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Orchestrator] Initialization failed:', error);
      process.exit(1);
    });
}
EOF

    log_success "Script de inicialização criado"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  CONFIGURAÇÃO DO SISTEMA ORQUESTRADOR"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_directories
    create_agent_registry
    create_task_queue
    create_orchestrator_router
    create_initialization_script

    echo ""
    log_success "Sistema orquestrador configurado com sucesso"
    echo ""
    echo "Arquivos criados:"
    echo "  - $SERVICES_DIR/agent-registry/agent-registry.ts"
    echo "  - $SERVICES_DIR/task-queue/task-queue.ts"
    echo "  - $ROUTERS_DIR/orchestration-simple.ts"
    echo "  - $SERVICES_DIR/orchestrator/initialize-orchestrator.ts"
    echo ""
    echo "Endpoints disponíveis via tRPC:"
    echo "  orchestrationSimple.*"
    echo ""
    echo "Funcionalidades:"
    echo "  1. Registro e gerenciamento de agentes"
    echo "  2. Fila de tarefas com prioridades"
    echo "  3. Atribuição automática de tarefas"
    echo "  4. Sistema de retry automático"
    echo "  5. Estatísticas em tempo real"
    echo ""
}

# Executar função principal
main "$@"