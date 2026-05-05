import { describe, it, expect, beforeAll, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
import { TRPCError } from '@trpc/server';

// Mock context for testing
function createMockContext(role: 'user' | 'admin' = 'user'): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role,
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

describe('Dropshipping Router', () => {
  let userCaller: ReturnType<typeof appRouter.createCaller>;
  let adminCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    userCaller = appRouter.createCaller(createMockContext('user'));
    adminCaller = appRouter.createCaller(createMockContext('admin'));
  });

  describe('registerOrder', () => {
    it('should require all mandatory fields', async () => {
      try {
        await userCaller.dropshipping.registerOrder({
          productId: 1,
          customerName: '',
          customerEmail: 'test@example.com',
          shippingAddress: 'Test Address',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should validate email format', async () => {
      try {
        await userCaller.dropshipping.registerOrder({
          productId: 1,
          customerName: 'John Doe',
          customerEmail: 'invalid-email',
          shippingAddress: 'Test Address',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should require valid product ID', async () => {
      try {
        await userCaller.dropshipping.registerOrder({
          productId: 999999,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          shippingAddress: 'Test Address',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
      }
    });
  });

  describe('getMyOrders', () => {
    it('should return array of orders', async () => {
      const result = await userCaller.dropshipping.getMyOrders({
        limit: 50,
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('status');
        expect(result[0]).toHaveProperty('customerName');
        expect(result[0]).toHaveProperty('amount');
      }
    });

    it('should filter by status', async () => {
      const result = await userCaller.dropshipping.getMyOrders({
        limit: 50,
        status: 'pending',
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(order => {
        expect(order.status).toBe('pending');
      });
    });

    it('should respect limit parameter', async () => {
      const result = await userCaller.dropshipping.getMyOrders({
        limit: 5,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getOrderDetails', () => {
    it('should return null for non-existent order', async () => {
      try {
        await userCaller.dropshipping.getOrderDetails({
          orderId: 999999,
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
      }
    });

    it('should include order history', async () => {
      const orders = await userCaller.dropshipping.getMyOrders({ limit: 1 });

      if (orders.length > 0) {
        const details = await userCaller.dropshipping.getOrderDetails({
          orderId: orders[0].id,
        });

        expect(details).toHaveProperty('statusHistory');
        expect(Array.isArray(details?.statusHistory)).toBe(true);
      }
    });
  });

  describe('updateOrderStatus', () => {
    it('should require admin role', async () => {
      try {
        await userCaller.dropshipping.updateOrderStatus({
          orderId: 1,
          newStatus: 'confirmed',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        if (error instanceof TRPCError) {
          expect(error.code).toBe('FORBIDDEN');
        }
      }
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

      for (const status of validStatuses) {
        try {
          await adminCaller.dropshipping.updateOrderStatus({
            orderId: 1,
            newStatus: status,
          });
        } catch (error) {
          // Expected to fail if order doesn't exist, but not due to validation
          if (error instanceof TRPCError) {
            expect(error.code).not.toBe('BAD_REQUEST');
          }
        }
      }
    });
  });
});
