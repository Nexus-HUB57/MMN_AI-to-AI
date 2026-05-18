import type { AgenticChannel } from "./types";

export interface WorkflowNode {
  id: string;
  label: string;
  description: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

export const marketingWorkflowGraph = {
  id: "marketing-orchestrator-v1",
  name: "Marketing Agentic Graph",
  nodes: [
    { id: "brief", label: "Brief", description: "Consolida objetivo, público e oferta da campanha." },
    { id: "memory", label: "Memory", description: "Recupera aprendizados e contexto recente do agente." },
    { id: "draft", label: "Draft", description: "Gera copy inicial no canal escolhido." },
    { id: "judge", label: "Judge", description: "Avalia qualidade, clareza e aderência à oferta." },
    { id: "publish_preview", label: "Preview", description: "Produz preview operacional para Instagram ou WhatsApp." },
  ] satisfies WorkflowNode[],
  edges: [
    { from: "brief", to: "memory" },
    { from: "memory", to: "draft" },
    { from: "draft", to: "judge" },
    { from: "judge", to: "publish_preview" },
  ] satisfies WorkflowEdge[],
};

export function buildMarketingPlan(channel: AgenticChannel): string[] {
  return [
    "brief",
    "memory",
    channel === "instagram" ? "draft-instagram" : "draft-whatsapp",
    "judge",
    "publish_preview",
  ];
}
