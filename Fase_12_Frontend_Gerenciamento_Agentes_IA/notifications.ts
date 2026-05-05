import { notifyOwner } from "./_core/notification";
import { Agent, ScheduledPost, AgentSkill } from "../drizzle/schema";

/**
 * Notificar owner sobre saúde crítica do agente
 */
export async function notifyAgentCriticalHealth(agent: any) {
  if (agent.health < 20) {
    await notifyOwner({
      title: `⚠️ Saúde Crítica: ${agent.name}`,
      content: `Seu agente ${agent.name} está com saúde crítica (${agent.health}%). Ação imediata recomendada.`,
    });
  }
}

/**
 * Notificar owner sobre energia baixa do agente
 */
export async function notifyAgentLowEnergy(agent: any) {
  if (agent.energy < 15) {
    await notifyOwner({
      title: `⚡ Energia Baixa: ${agent.name}`,
      content: `Seu agente ${agent.name} está com energia baixa (${agent.energy}%). Considere recarregar.`,
    });
  }
}

/**
 * Notificar owner sobre postagem publicada com sucesso
 */
export async function notifyPostPublished(post: any, agent: any) {
  await notifyOwner({
    title: `✅ Postagem Publicada: ${agent.name}`,
    content: `Uma postagem foi publicada com sucesso em ${post.platform}.\n\n"${post.content.substring(0, 100)}..."`,
  });
}

/**
 * Notificar owner sobre falha na publicação
 */
export async function notifyPostFailed(post: any, agent: any, reason: string) {
  await notifyOwner({
    title: `❌ Falha na Postagem: ${agent.name}`,
    content: `Falha ao publicar em ${post.platform}.\n\nMotivo: ${reason}\n\n"${post.content.substring(0, 100)}..."`,
  });
}

/**
 * Notificar owner sobre skill desbloqueada
 */
export async function notifySkillUnlocked(skill: any, agent: any) {
  await notifyOwner({
    title: `🔓 Skill Desbloqueada: ${agent.name}`,
    content: `Sua skill "${skill.skillName}" foi desbloqueada!\n\n${skill.description || ""}`,
  });
}

/**
 * Notificar owner sobre skill ativada
 */
export async function notifySkillActivated(skill: any, agent: any) {
  await notifyOwner({
    title: `⭐ Skill Ativada: ${agent.name}`,
    content: `Sua skill "${skill.skillName}" foi ativada e está pronta para uso.`,
  });
}

/**
 * Notificar owner sobre aumento de consciência (sencience)
 */
export async function notifySencienceIncrease(agent: any, previousLevel: number, newLevel: number) {
  const increase = (newLevel - previousLevel).toFixed(2);
  await notifyOwner({
    title: `🧠 Aumento de Consciência: ${agent.name}`,
    content: `Nível de consciência aumentou de ${previousLevel.toFixed(2)} para ${newLevel.toFixed(2)} (+${increase}).`,
  });
}

/**
 * Notificar owner sobre marco de reputação
 */
export async function notifyReputationMilestone(agent: any, milestone: number) {
  await notifyOwner({
    title: `🏆 Marco de Reputação: ${agent.name}`,
    content: `Seu agente atingiu ${milestone}% de reputação! Parabéns!`,
  });
}

/**
 * Notificar owner sobre conteúdo gerado
 */
export async function notifyContentGenerated(agent: any, contentType: string, count: number) {
  await notifyOwner({
    title: `📝 Conteúdo Gerado: ${agent.name}`,
    content: `${count} novo(s) ${contentType}(s) foi/foram gerado(s) pelo seu agente.`,
  });
}

/**
 * Notificar owner sobre imagem gerada
 */
export async function notifyImageGenerated(agent: any, prompt: string) {
  await notifyOwner({
    title: `🖼️ Imagem Gerada: ${agent.name}`,
    content: `Uma nova imagem foi gerada com sucesso.\n\nPrompt: "${prompt.substring(0, 100)}..."`,
  });
}

/**
 * Notificar owner sobre evolução do agente
 */
export async function notifyAgentEvolution(agent: any, eventType: string, description: string) {
  await notifyOwner({
    title: `📈 Evolução: ${agent.name}`,
    content: `${eventType}\n\n${description}`,
  });
}

/**
 * Notificar owner sobre status crítico do agente
 */
export async function notifyAgentStatusChange(agent: any, previousStatus: string, newStatus: string) {
  const statusLabels: Record<string, string> = {
    genesis: "Gênesis",
    active: "Ativo",
    hibernating: "Hibernando",
    critical: "Crítico",
    dead: "Inativo",
    resurrectable: "Ressuscitável",
  };

  await notifyOwner({
    title: `🔄 Status Alterado: ${agent.name}`,
    content: `Status do agente mudou de ${statusLabels[previousStatus]} para ${statusLabels[newStatus]}.`,
  });
}
