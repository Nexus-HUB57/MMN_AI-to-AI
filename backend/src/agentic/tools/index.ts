import { instagramTool } from "./instagramTool";
import { whatsappTool } from "./whatsappTool";
import type { AgenticChannel, ToolExecutionInput, ToolExecutionOutput } from "../types";

export interface AgenticTool {
  name: string;
  channel: AgenticChannel;
  run(input: ToolExecutionInput): Promise<ToolExecutionOutput>;
}

const tools: AgenticTool[] = [instagramTool, whatsappTool];

export function getToolByChannel(channel: AgenticChannel): AgenticTool {
  const tool = tools.find((item) => item.channel === channel);
  if (!tool) {
    throw new Error(`Nenhuma tool agentic configurada para o canal ${channel}`);
  }
  return tool;
}

export function listAgenticTools() {
  return tools.map((tool) => ({
    name: tool.name,
    channel: tool.channel,
  }));
}
