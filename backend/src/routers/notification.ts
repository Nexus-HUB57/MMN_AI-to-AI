import { z } from "zod";
import { createNotification } from "../../../database/schemas/db";

export interface NotificationInput {
  userId?: number;
  title: string;
  content: string;
  type?: string;
}

/**
 * Notifica o proprietário ou um usuário específico
 */
export async function notifyOwner(input: NotificationInput) {
  console.log(`[Notification] ${input.title}: ${input.content}`);
  
  // Se tiver userId, salva no banco
  if (input.userId) {
    await createNotification({
      userId: input.userId,
      type: input.type || "system",
      title: input.title,
      content: input.content,
    });
  }
  
  return { success: true };
}
