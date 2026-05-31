/**
 * Mastra Integration Module
 *
 * Exportação pública do módulo de integração com Mastra
 * para construção de AI agents no Nexus Partners Pack.
 *
 * @module integrations/mastra
 */

export { MastraService, createMastraService } from './mastra-service';
export type {
  MastraConfig,
  MastraServiceInterface,
  AgentDefinition,
  AgentInput,
  AgentResult,
  ToolDefinition,
  ToolCall,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInput,
  WorkflowResult,
  StepResult,
  WorkflowError,
  StreamEvent,
  MastraEventType,
  AgentMetrics,
} from './types';

import { MastraService, createMastraService } from './mastra-service';

export const mastra = {
  /**
   * Cria uma instância do serviço Mastra
   */
  create: createMastraService,

  /**
   * Serviço padrão (local/simulation)
   */
  default: new MastraService(),

  /**
   * Pre-built agent templates
   */
  agentTemplates: {
    contentWriter: {
      id: 'content-writer',
      name: 'Content Writer Agent',
      description: 'Agent specialized in creating marketing content',
      instructions: 'You are a professional content writer specializing in affiliate marketing. Create engaging, SEO-optimized content that drives conversions.',
    },
    analyst: {
      id: 'analyst',
      name: 'Data Analyst Agent',
      description: 'Agent specialized in data analysis and insights',
      instructions: 'You are a data analyst specializing in affiliate marketing metrics. Analyze data and provide actionable insights.',
    },
    publisher: {
      id: 'publisher',
      name: 'Publisher Agent',
      description: 'Agent specialized in content distribution',
      instructions: 'You are a publisher agent that distributes content across multiple channels while maintaining brand consistency.',
    },
  },

  /**
   * Workflow templates
   */
  workflowTemplates: {
    contentPipeline: {
      id: 'content-pipeline',
      name: 'Content Creation Pipeline',
      description: 'Multi-agent workflow for content creation and distribution',
      steps: [
        { id: 'research', agentId: 'analyst', inputMapping: { topic: '$topic' }, outputVariable: 'research' },
        { id: 'write', agentId: 'content-writer', inputMapping: { context: '$research' }, outputVariable: 'content' },
        { id: 'publish', agentId: 'publisher', inputMapping: { content: '$content' }, outputVariable: 'published' },
      ],
    },
  },
};

export default MastraService;