import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { 
  getUserNotifications, 
  markNotificationAsRead,
  getUnreadNotificationsCount,
} from "./db";

/**
 * Notifications Router - Gestão de notificações
 */
export const notificationsRouter = router({
  /**
   * Obter notificações do usuário
   */
  getMyNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const notifications = await getUserNotifications(ctx.user.id, input.limit);
      
      const filtered = input.type
        ? notifications.filter(n => n.type === input.type)
        : notifications;

      return filtered.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        relatedOrderId: notification.relatedOrderId,
        read: notification.read,
        createdAt: notification.createdAt,
      }));
    }),

  /**
   * Obter contagem de notificações não lidas
   */
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const count = await getUnreadNotificationsCount(ctx.user.id);
      return { unreadCount: count };
    }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  /**
   * Marcar múltiplas notificações como lidas
   */
  markMultipleAsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      for (const notificationId of input.notificationIds) {
        await markNotificationAsRead(notificationId);
      }
      return { success: true };
    }),
});
