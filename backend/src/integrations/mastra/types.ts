/**
 * Mastra Integration Types
 *
 * Tipos TypeScript para integração com Mastra no Nexus Partners Pack.
 * Mastra é um framework TypeScript-native para construção de AI agents.
 *
 * @module integrations/mastra/types
 */

import { z } from 'zod';

/**
 * Configuration for Mastra integration
 */
export interface MastraConfig {
  /** Mastra API base URL */
  baseUrl?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Default model to use */
  defaultModel?: string;
  /** Maximum concurrent agents */
  maxConcurrentAgents?: number;
  /** Enable telemetry */
  telemetryEnabled?: boolean;
}

/**
 * Agent definition for Mastra
 */
export interface AgentDefinition {
  /** Unique agent identifier */
  id: string;
  /** Agent name */
  name: string;
  /** Agent description */
  description?: string;
  /** System instructions */
  instructions: string;
  /** Tools available to agent */
  tools?: string[];
  /** Default model */
  model?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Max tokens */
  maxTokens?: number;
}

/**
 * Agent execution input
 */
export interface AgentInput {
  /** Agent identifier */
  agentId: string;
  /** User message */
  message: string;
  /** Conversation ID */
  conversationId?: string;
  /** Context data */
  context?: Record<string, any>;
  /** Stream response */
  stream?: boolean;
}

/**
 * Agent execution result
 */
export interface AgentResult {
  /** Unique execution ID */
  executionId: string;
  /** Agent ID */
  agentId: string;
  /** Response message */
  response: string;
  /** Tool calls made */
  toolCalls?: ToolCall[];
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Execution metadata */
  metadata?: {
    duration: number;
    model: string;
    finishReason: string;
  };
}

/**
 * Tool call during agent execution
 */
export interface ToolCall {
  /** Tool name */
  tool: string;
  /** Tool input arguments */
  input: Record<string, any>;
  /** Tool output */
  output?: string;
  /** Execution time */
  duration?: number;
  /** Success status */
  success?: boolean;
}

/**
 * Workflow definition for agent orchestration
 */
export interface WorkflowDefinition {
  /** Unique workflow ID */
  id: string;
  /** Workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Steps in workflow */
  steps: WorkflowStep[];
  /** Error handling strategy */
  errorStrategy?: 'retry' | 'fallback' | 'skip' | 'stop';
  /** Max retries */
  maxRetries?: number;
}

/**
 * Single workflow step
 */
export interface WorkflowStep {
  /** Step identifier */
  id: string;
  /** Agent to use */
  agentId: string;
  /** Step input mapping */
  inputMapping: Record<string, string>;
  /** Step output variable */
  outputVariable?: string;
  /** Condition to execute */
  condition?: string;
  /** On error action */
  onError?: 'retry' | 'fallback' | 'skip' | 'stop';
}

/**
 * Workflow execution input
 */
export interface WorkflowInput {
  /** Workflow identifier */
  workflowId: string;
  /** Initial input data */
  initialData: Record<string, any>;
  /** Execution options */
  options?: {
    stream?: boolean;
    timeout?: number;
  };
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  /** Unique execution ID */
  executionId: string;
  /** Workflow ID */
  workflowId: string;
  /** Execution status */
  status: 'success' | 'failed' | 'partial';
  /** Final output */
  output: Record<string, any>;
  /** Step results */
  stepResults: StepResult[];
  /** Total duration */
  duration: number;
  /** Errors if any */
  errors?: WorkflowError[];
}

/**
 * Individual step result
 */
export interface StepResult {
  /** Step ID */
  stepId: string;
  /** Agent ID */
  agentId: string;
  /** Step output */
  output: any;
  /** Step duration */
  duration: number;
  /** Success status */
  success: boolean;
}

/**
 * Workflow error
 */
export interface WorkflowError {
  /** Step where error occurred */
  stepId: string;
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Retry count */
  retryCount: number;
}

/**
 * Tool definition for agents
 */
export interface ToolDefinition {
  /** Unique tool identifier */
  id: string;
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Input schema */
  inputSchema: z.ZodSchema;
  /** Tool handler */
  handler: (input: any) => Promise<any>;
}

/**
 * Mastra service interface
 */
export interface MastraServiceInterface {
  /** Register an agent */
  registerAgent(agent: AgentDefinition): Promise<void>;
  /** Execute an agent */
  executeAgent(input: AgentInput): Promise<AgentResult>;
  /** Register a workflow */
  registerWorkflow(workflow: WorkflowDefinition): Promise<void>;
  /** Execute a workflow */
  executeWorkflow(input: WorkflowInput): Promise<WorkflowResult>;
  /** Register a tool */
  registerTool(tool: ToolDefinition): Promise<void>;
  /** Check service health */
  healthCheck(): Promise<boolean>;
}

/**
 * Event types for streaming
 */
export type MastraEventType =
  | 'agent.start'
  | 'agent.response'
  | 'agent.tool_call'
  | 'agent.tool_result'
  | 'agent.complete'
  | 'workflow.step_start'
  | 'workflow.step_complete'
  | 'workflow.complete'
  | 'error';

/**
 * Stream event
 */
export interface StreamEvent {
  /** Event type */
  type: MastraEventType;
  /** Event data */
  data: any;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Agent metrics
 */
export interface AgentMetrics {
  agentId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  totalTokensUsed: number;
  toolCallsCount: number;
}