import type { AgenticSession, JudgeResult, ToolExecutionOutput } from "../types";

export interface AgentRunResult {
  session: AgenticSession;
  judge: JudgeResult;
  toolOutput: ToolExecutionOutput;
}

export abstract class BaseAgent {
  constructor(public readonly id: string, public readonly role: string) {}

  abstract runCampaign(session: AgenticSession): Promise<AgentRunResult>;
}
