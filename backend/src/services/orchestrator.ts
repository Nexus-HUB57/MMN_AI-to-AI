import {
  addContentGenerationJob,
  addMarketplaceSyncJob,
  addOrderProcessingJob,
  addCommissionProcessingJob,
  ContentGenerationJob,
  MarketplaceSyncJob,
  OrderProcessingJob,
  CommissionProcessingJob,
} from '../config/queue';
import { invokeLLM } from './llm-v2';
import { notifyOwner } from '../_core/notification';

export interface HighLevelGoal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetMetrics?: Record<string, unknown>;
  createdAt: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface OrchestratorTask {
  goalId: string;
  taskId: string;
  type: 'content_generation' | 'marketplace_sync' | 'order_processing' | 'commission_processing';
  description: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'dispatched' | 'completed' | 'failed';
  createdAt: Date;
  dispatchedAt?: Date;
  completedAt?: Date;
}

/**
 * Agente Orquestrador Central
 * Responsável por receber metas de alto nível, decompô-las em subtarefas
 * e despachá-las para os workers apropriados
 */
export class CentralOrchestrator {
  private goals: Map<string, HighLevelGoal> = new Map();
  private tasks: Map<string, OrchestratorTask> = new Map();

  /**
   * Receber uma meta de alto nível e iniciar orquestração
   */
  async orchestrateGoal(goal: HighLevelGoal): Promise<void> {
    console.log('[Orchestrator] Received goal:', goal);

    try {
      // Armazenar meta
      this.goals.set(goal.id, { ...goal, status: 'executing' });

      // Usar LLM para decompor a meta em subtarefas
      const subtasks = await this.decomposeGoalWithLLM(goal);

      console.log(`[Orchestrator] Decomposed goal into ${subtasks.length} subtasks`);

      // Despachar subtarefas para as filas apropriadas
      for (const subtask of subtasks) {
        await this.dispatchTask(subtask);
      }

      // Notificar proprietário
      await notifyOwner({
        title: 'Meta de Orquestração Iniciada',
        content: `Meta "${goal.title}" foi decomposta em ${subtasks.length} subtarefas e despachada para execução`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Orchestrator] Failed to orchestrate goal:', errorMessage);

      // Atualizar status da meta
      const updatedGoal = this.goals.get(goal.id);
      if (updatedGoal) {
        updatedGoal.status = 'failed';
        this.goals.set(goal.id, updatedGoal);
      }

      // Notificar proprietário sobre falha
      await notifyOwner({
        title: 'Falha em Orquestração de Meta',
        content: `Meta "${goal.title}" falhou durante orquestração: ${errorMessage}`,
      });

      throw error;
    }
  }

  /**
   * Usar LLM para decompor uma meta em subtarefas operacionais
   */
  private async decomposeGoalWithLLM(goal: HighLevelGoal): Promise<OrchestratorTask[]> {
    const systemPrompt = `Você é um agente orquestrador de tarefas de marketing multinível (MMN).
Sua responsabilidade é decompor metas de alto nível em subtarefas operacionais específicas que podem ser executadas por workers autônomos.

As subtarefas devem ser de um destes tipos:
1. content_generation: Gerar conteúdo para redes sociais, e-mails, descrições de produtos
2. marketplace_sync: Sincronizar produtos de marketplaces (Mercado Livre, Shopee, Hotmart)
3. order_processing: Processar pedidos de dropshipping
4. commission_processing: Calcular e processar comissões

Para cada subtarefa, forneça:
- type: O tipo de subtarefa
- description: Descrição clara da ação
- parameters: Parâmetros específicos para a subtarefa

Retorne um JSON com um array de subtarefas.`;

    const userPrompt = `Decomponha a seguinte meta em subtarefas operacionais:

Título: ${goal.title}
Descrição: ${goal.description}
Prioridade: ${goal.priority}
${goal.targetMetrics ? `Métricas Alvo: ${JSON.stringify(goal.targetMetrics)}` : ''}

Forneça as subtarefas em formato JSON.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'orchestrator_tasks',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                tasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: [
                          'content_generation',
                          'marketplace_sync',
                          'order_processing',
                          'commission_processing',
                        ],
                      },
                      description: { type: 'string' },
                      parameters: { type: 'object' },
                    },
                    required: ['type', 'description', 'parameters'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['tasks'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      const tasks: OrchestratorTask[] = parsed.tasks.map((task: Record<string, unknown>, index: number) => ({
        goalId: goal.id,
        taskId: `${goal.id}-task-${index}`,
        type: task.type as OrchestratorTask['type'],
        description: task.description as string,
        parameters: task.parameters as Record<string, unknown>,
        status: 'pending' as const,
        createdAt: new Date(),
      }));

      return tasks;
    } catch (error) {
      console.error('[Orchestrator] LLM decomposition failed:', error);
      throw error;
    }
  }

  /**
   * Despachar uma subtarefa para a fila apropriada
   */
  private async dispatchTask(task: OrchestratorTask): Promise<void> {
    console.log(`[Orchestrator] Dispatching task ${task.taskId}:`, task);

    try {
      task.status = 'dispatched';
      task.dispatchedAt = new Date();
      this.tasks.set(task.taskId, task);

      switch (task.type) {
        case 'content_generation':
          await addContentGenerationJob(task.parameters as unknown as ContentGenerationJob);
          break;
        case 'marketplace_sync':
          await addMarketplaceSyncJob(task.parameters as unknown as MarketplaceSyncJob);
          break;
        case 'order_processing':
          await addOrderProcessingJob(task.parameters as unknown as OrderProcessingJob);
          break;
        case 'commission_processing':
          await addCommissionProcessingJob(task.parameters as unknown as CommissionProcessingJob);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      console.log(`[Orchestrator] Task ${task.taskId} dispatched successfully`);
    } catch (error) {
      console.error(`[Orchestrator] Failed to dispatch task ${task.taskId}:`, error);
      task.status = 'failed';
      this.tasks.set(task.taskId, task);
      throw error;
    }
  }

  /**
   * Monitorar progresso de uma meta
   */
  async monitorGoalProgress(goalId: string): Promise<Record<string, unknown>> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal ${goalId} not found`);
    }

    const goalTasks = Array.from(this.tasks.values()).filter((t) => t.goalId === goalId);

    const stats = {
      total: goalTasks.length,
      pending: goalTasks.filter((t) => t.status === 'pending').length,
      dispatched: goalTasks.filter((t) => t.status === 'dispatched').length,
      completed: goalTasks.filter((t) => t.status === 'completed').length,
      failed: goalTasks.filter((t) => t.status === 'failed').length,
    };

    return {
      goalId,
      goalTitle: goal.title,
      goalStatus: goal.status,
      taskStats: stats,
      tasks: goalTasks,
    };
  }

  /**
   * Obter histórico de metas
   */
  getGoalHistory(): HighLevelGoal[] {
    return Array.from(this.goals.values());
  }

  /**
   * Obter histórico de tarefas
   */
  getTaskHistory(): OrchestratorTask[] {
    return Array.from(this.tasks.values());
  }
}

// Singleton instance
export const orchestrator = new CentralOrchestrator();
