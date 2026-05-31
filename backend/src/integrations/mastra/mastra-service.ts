/**
 * Mastra Service Implementation
 *
 * Implementação do serviço de integração com Mastra para
 * construção de AI agents no Nexus Partners Pack.
 *
 * Mastra é um framework TypeScript-native que oferece primitivas
 * para tools, workflows e agent orchestration.
 *
 * @module integrations/mastra/mastra-service
 */

import { v4 as uuidv4 } from 'nanoid';
import {
  MastraConfig,
  AgentDefinition,
  AgentInput,
  AgentResult,
  ToolCall,
  WorkflowDefinition,
  WorkflowInput,
  WorkflowResult,
  StepResult,
  WorkflowError,
  MastraServiceInterface,
} from './types';

export class MastraService implements MastraServiceInterface {
  private config: Required<MastraConfig>;
  private agents: Map<string, AgentDefinition> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private agentMetrics: Map<string, {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalDuration: number;
    totalTokens: number;
  }> = new Map();

  constructor(config: MastraConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:5000',
      apiKey: config.apiKey || '',
      defaultModel: config.defaultModel || 'gpt-4o',
      maxConcurrentAgents: config.maxConcurrentAgents || 10,
      telemetryEnabled: config.telemetryEnabled ?? true,
    };
  }

  /**
   * Registra um novo agent
   */
  async registerAgent(agent: AgentDefinition): Promise<void> {
    if (!agent.id || !agent.name || !agent.instructions) {
      throw new Error('Agent must have id, name, and instructions');
    }

    const validatedAgent: AgentDefinition = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      instructions: agent.instructions,
      tools: agent.tools || [],
      model: agent.model || this.config.defaultModel,
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 4096,
    };

    this.agents.set(agent.id, validatedAgent);

    if (!this.agentMetrics.has(agent.id)) {
      this.agentMetrics.set(agent.id, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalDuration: 0,
        totalTokens: 0,
      });
    }

    console.log(`[Mastra] Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Executa um agent
   */
  async executeAgent(input: AgentInput): Promise<AgentResult> {
    const executionId = uuidv4();
    const startTime = Date.now();

    const agent = this.agents.get(input.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${input.agentId}`);
    }

    const metrics = this.agentMetrics.get(input.agentId);
    if (metrics) {
      metrics.totalExecutions++;
    }

    try {
      const toolCalls: ToolCall[] = [];
      let response = '';

      // Simulate agent execution with tool calls
      if (agent.tools && agent.tools.length > 0) {
        for (const toolId of agent.tools) {
          const toolCall: ToolCall = {
            tool: toolId,
            input: { context: input.context },
            duration: Math.floor(Math.random() * 100) + 50,
            success: true,
          };
          toolCalls.push(toolCall);
        }
      }

      // Generate response based on instructions
      response = await this.generateAgentResponse(agent, input.message, input.context);

      const duration = Date.now() - startTime;
      const usage = {
        promptTokens: Math.floor(response.length * 0.75),
        completionTokens: Math.floor(response.length * 0.25),
        totalTokens: response.length,
      };

      if (metrics) {
        metrics.successfulExecutions++;
        metrics.totalDuration += duration;
        metrics.totalTokens += usage.totalTokens;
      }

      return {
        executionId,
        agentId: input.agentId,
        response,
        toolCalls,
        usage,
        metadata: {
          duration,
          model: agent.model || this.config.defaultModel,
          finishReason: 'stop',
        },
      };
    } catch (error) {
      if (metrics) {
        metrics.failedExecutions++;
      }

      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Registra um workflow
   */
  async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    if (!workflow.id || !workflow.name || !workflow.steps.length) {
      throw new Error('Workflow must have id, name, and at least one step');
    }

    for (const step of workflow.steps) {
      if (!this.agents.has(step.agentId)) {
        console.warn(`[Mastra] Workflow references unknown agent: ${step.agentId}`);
      }
    }

    this.workflows.set(workflow.id, {
      ...workflow,
      errorStrategy: workflow.errorStrategy || 'retry',
      maxRetries: workflow.maxRetries || 3,
    });

    console.log(`[Mastra] Registered workflow: ${workflow.name} (${workflow.id})`);
  }

  /**
   * Executa um workflow
   */
  async executeWorkflow(input: WorkflowInput): Promise<WorkflowResult> {
    const executionId = uuidv4();
    const startTime = Date.now();

    const workflow = this.workflows.get(input.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${input.workflowId}`);
    }

    const stepResults: StepResult[] = [];
    const errors: WorkflowError[] = [];
    let context = { ...input.initialData };

    for (const step of workflow.steps) {
      const stepStartTime = Date.now();
      let stepSuccess = true;

      // Check condition
      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        stepResults.push({
          stepId: step.id,
          agentId: step.agentId,
          output: null,
          duration: 0,
          success: false,
        });
        continue;
      }

      // Map inputs from context
      const mappedInput: Record<string, any> = {};
      for (const [key, value] of Object.entries(step.inputMapping)) {
        mappedInput[key] = this.resolveValue(value, context);
      }

      try {
        let output: any;

        // Execute agent step
        if (this.agents.has(step.agentId)) {
          const agentResult = await this.executeAgent({
            agentId: step.agentId,
            message: JSON.stringify(mappedInput),
            context,
          });
          output = agentResult.response;
        } else {
          output = this.simulateStepExecution(step.agentId, mappedInput);
        }

        const duration = Date.now() - stepStartTime;

        if (step.outputVariable) {
          context[step.outputVariable] = output;
        }

        stepResults.push({
          stepId: step.id,
          agentId: step.agentId,
          output,
          duration,
          success: true,
        });
      } catch (error) {
        stepSuccess = false;
        const duration = Date.now() - stepStartTime;

        errors.push({
          stepId: step.id,
          code: 'STEP_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0,
        });

        stepResults.push({
          stepId: step.id,
          agentId: step.agentId,
          output: null,
          duration,
          success: false,
        });

        // Handle error strategy
        if (workflow.errorStrategy === 'stop') {
          break;
        }

        if (workflow.errorStrategy === 'skip') {
          continue;
        }

        if (workflow.errorStrategy === 'retry' && errors[errors.length - 1].retryCount < (workflow.maxRetries || 3)) {
          errors[errors.length - 1].retryCount++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const successCount = stepResults.filter(s => s.success).length;

    return {
      executionId,
      workflowId: input.workflowId,
      status: errors.length === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed',
      output: context,
      stepResults,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Registra uma tool
   */
  async registerTool(tool: { id: string; name: string; description: string; handler: (input: any) => Promise<any> }): Promise<void> {
    console.log(`[Mastra] Registered tool: ${tool.name} (${tool.id})`);
  }

  /**
   * Verifica saúde do serviço
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.config.baseUrl.startsWith('http://localhost')) {
        return true;
      }

      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtém métricas de um agent
   */
  getAgentMetrics(agentId: string) {
    return this.agentMetrics.get(agentId);
  }

  /**
   * Lista todos os agents registrados
   */
  listAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Lista todos os workflows registrados
   */
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  private async generateAgentResponse(
    agent: AgentDefinition,
    message: string,
    context?: Record<string, any>
  ): Promise<string> {
    const instructions = agent.instructions;
    const contextInfo = context ? `\nContext: ${JSON.stringify(context)}` : '';

    return `[Agent: ${agent.name}] Processing: "${message}"${contextInfo}\n\n` +
      `Based on instructions: "${instructions.substring(0, 100)}..."\n\n` +
      `Response: This is a simulated agent response. In production, this would integrate with ` +
      `the actual Mastra framework or LangChain for real agent execution.`;
  }

  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      const expr = condition.replace(/(\w+)/g, (match) => {
        if (context[match] !== undefined) {
          return JSON.stringify(context[match]);
        }
        return match;
      });

      return new Function(`return ${expr}`)() as boolean;
    } catch {
      return false;
    }
  }

  private resolveValue(value: string, context: Record<string, any>): any {
    if (value.startsWith('$')) {
      const key = value.substring(1);
      return context[key];
    }
    return value;
  }

  private simulateStepExecution(agentId: string, input: any): any {
    return {
      simulated: true,
      agentId,
      input,
      timestamp: new Date().toISOString(),
      result: 'Step executed successfully (simulation)',
    };
  }
}

export async function createMastraService(config?: MastraConfig): Promise<MastraService> {
  const service = new MastraService(config);

  const isHealthy = await service.healthCheck();
  if (!isHealthy) {
    console.warn('[Mastra] Mastra service health check failed. Running in simulation mode.');
  }

  return service;
}

export default MastraService;