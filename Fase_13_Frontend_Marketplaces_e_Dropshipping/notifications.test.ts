import { describe, it, expect, beforeAll, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext['res'],
  };
}

describe('Notifications Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('getMyNotifications', () => {
    it('should return array of notifications', async () => {
      const result = await caller.notifications.getMyNotifications({
        limit: 50,
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('type');
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('read');
      }
    });

    it('should filter by notification type', async () => {
      const result = await caller.notifications.getMyNotifications({
        limit: 50,
        type: 'new_dropshipping_order',
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(notification => {
        expect(notification.type).toBe('new_dropshipping_order');
      });
    });

    it('should respect limit parameter', async () => {
      const result = await caller.notifications.getMyNotifications({
        limit: 5,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const result = await caller.notifications.getUnreadCount();

      expect(result).toHaveProperty('unreadCount');
      expect(typeof result.unreadCount).toBe('number');
      expect(result.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      // Get a notification first
      const notifications = await caller.notifications.getMyNotifications({ limit: 1 });

      if (notifications.length > 0) {
        const notificationId = notifications[0].id;
        const result = await caller.notifications.markAsRead({
          notificationId,
        });

        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      }
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      // Get notifications first
      const notifications = await caller.notifications.getMyNotifications({ limit: 3 });

      if (notifications.length > 0) {
        const notificationIds = notifications.slice(0, 2).map(n => n.id);
        const result = await caller.notifications.markMultipleAsRead({
          notificationIds,
        });

        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      }
    });

    it('should handle empty array', async () => {
      const result = await caller.notifications.markMultipleAsRead({
        notificationIds: [],
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });

  describe('Notification Types', () => {
    it('should support all notification types', async () => {
      const types = [
        'new_dropshipping_order',
        'order_confirmation',
        'order_status_update',
        'commission_credited',
        'order_shipped',
        'order_delivered',
      ];

      for (const type of types) {
        const result = await caller.notifications.getMyNotifications({
          limit: 50,
          type,
        });

        expect(Array.isArray(result)).toBe(true);
      }
    });
  });
});
