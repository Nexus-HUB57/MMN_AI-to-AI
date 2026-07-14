import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { eq, and, or, like, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import {
  marketplaceProducts,
  productCategories,
  productVariations,
  marketplaceOrders,
  orderItems,
  productReviews,
  wishlists,
  wishlistItems,
  coupons,
  affiliateMarketplaceSettings,
  type InsertMarketplaceProduct,
  type InsertProductCategory,
  type InsertProductVariation,
  type InsertMarketplaceOrder,
  type InsertOrderItem,
  type InsertProductReview,
  type InsertCoupon,
} from '../../../database/schemas/marketplace-schema';

export const marketplaceRouter = router({
  // =============================================================================
  // PRODUTOS
  // =============================================================================

  // Listar produtos do marketplace
  listProducts: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      categoryId: z.number().optional(),
      search: z.string().optional(),
      status: z.enum(['draft', 'active', 'paused', 'archived', 'out_of_stock']).optional(),
      sortBy: z.enum(['createdAt', 'price', 'salesCount', 'rating', 'viewCount']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, categoryId, search, status, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (categoryId) conditions.push(eq(marketplaceProducts.categoryId, categoryId));
      if (status) conditions.push(eq(marketplaceProducts.status, status));
      if (search) {
        conditions.push(or(
          like(marketplaceProducts.name, `%${search}%`),
          like(marketplaceProducts.description, `%${search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const orderColumn = sortBy === 'createdAt' ? marketplaceProducts.createdAt :
                         sortBy === 'price' ? marketplaceProducts.price :
                         sortBy === 'salesCount' ? marketplaceProducts.salesCount :
                         sortBy === 'rating' ? marketplaceProducts.rating :
                         marketplaceProducts.viewCount;

      const [products, countResult] = await Promise.all([
        db.select()
          .from(marketplaceProducts)
          .where(where)
          .orderBy(sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(marketplaceProducts)
          .where(where),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
        },
      };
    }),

  // Obter produto por ID
  getProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const product = await db.select()
        .from(marketplaceProducts)
        .where(eq(marketplaceProducts.id, input.id))
        .limit(1);

      if (!product[0]) {
        throw new Error('Produto não encontrado');
      }

      // Incrementar visualização
      await db.update(marketplaceProducts)
        .set({ viewCount: sql`${marketplaceProducts.viewCount} + 1` })
        .where(eq(marketplaceProducts.id, input.id));

      // Buscar variações
      const variations = await db.select()
        .from(productVariations)
        .where(eq(productVariations.productId, input.id));

      return { ...product[0], variations };
    }),

  // Criar produto
  createProduct: protectedProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      sku: z.string().optional(),
      name: z.string().min(1).max(255),
      slug: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().max(500).optional(),
      price: z.number().min(0),
      compareAtPrice: z.number().optional(),
      costPrice: z.number().optional(),
      commission: z.number().default(0),
      stockQuantity: z.number().default(0),
      lowStockThreshold: z.number().default(5),
      trackInventory: z.boolean().default(true),
      status: z.enum(['draft', 'active', 'paused']).default('draft'),
      productType: z.enum(['digital', 'physical', 'service', 'subscription']).default('digital'),
      weight: z.number().optional(),
      dimensions: z.object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      }).optional(),
      images: z.array(z.string()).optional(),
      thumbnailUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      seoTitle: z.string().max(255).optional(),
      seoDescription: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const affiliateId = ctx.session.user.id;
      const id = crypto.randomUUID();
      const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const productData: InsertMarketplaceProduct = {
        id,
        affiliateId,
        categoryId: input.categoryId,
        sku: input.sku,
        name: input.name,
        slug,
        description: input.description,
        shortDescription: input.shortDescription,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        costPrice: input.costPrice,
        commission: input.commission,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        trackInventory: input.trackInventory,
        status: input.status,
        productType: input.productType,
        weight: input.weight?.toString(),
        dimensions: input.dimensions as any,
        images: input.images,
        thumbnailUrl: input.thumbnailUrl,
        tags: input.tags,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        publishedAt: input.status === 'active' ? new Date() : undefined,
      };

      await db.insert(marketplaceProducts).values(productData);
      return { id, slug };
    }),

  // Atualizar produto
  updateProduct: protectedProcedure
    .input(z.object({
      id: z.string(),
      categoryId: z.number().optional(),
      sku: z.string().optional(),
      name: z.string().min(1).max(255).optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().max(500).optional(),
      price: z.number().min(0).optional(),
      compareAtPrice: z.number().optional(),
      costPrice: z.number().optional(),
      commission: z.number().optional(),
      stockQuantity: z.number().optional(),
      lowStockThreshold: z.number().optional(),
      trackInventory: z.boolean().optional(),
      status: z.enum(['draft', 'active', 'paused', 'archived', 'out_of_stock']).optional(),
      productType: z.enum(['digital', 'physical', 'service', 'subscription']).optional(),
      isFeatured: z.boolean().optional(),
      weight: z.number().optional(),
      dimensions: z.object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      }).optional(),
      images: z.array(z.string()).optional(),
      thumbnailUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      seoTitle: z.string().max(255).optional(),
      seoDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const current = await db.select()
        .from(marketplaceProducts)
        .where(eq(marketplaceProducts.id, id))
        .limit(1);

      if (!current[0]) {
        throw new Error('Produto não encontrado');
      }

      const updateData: Record<string, any> = { ...updates };
      if (updates.dimensions) {
        updateData.dimensions = updates.dimensions as any;
      }
      if (updates.weight !== undefined) {
        updateData.weight = updates.weight.toString();
      }

      // Se ativando, definir publishedAt
      if (updates.status === 'active' && current[0].status !== 'active') {
        updateData.publishedAt = new Date();
      }

      await db.update(marketplaceProducts)
        .set(updateData)
        .where(eq(marketplaceProducts.id, id));

      return { success: true };
    }),

  // =============================================================================
  // CATEGORIAS
  // =============================================================================

  // Listar categorias
  listCategories: protectedProcedure
    .input(z.object({
      parentId: z.number().optional(),
      includeProducts: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const condition = input.parentId !== undefined
        ? eq(productCategories.parentId, input.parentId)
        : undefined;

      const categories = await db.select()
        .from(productCategories)
        .where(condition)
        .orderBy(asc(productCategories.sortOrder));

      if (input.includeProducts) {
        const categoriesWithProducts = await Promise.all(
          categories.map(async (cat) => {
            const products = await db.select()
              .from(marketplaceProducts)
              .where(and(
                eq(marketplaceProducts.categoryId, cat.id),
                eq(marketplaceProducts.status, 'active')
              ))
              .limit(10);
            return { ...cat, products };
          })
        );
        return categoriesWithProducts;
      }

      return categories;
    }),

  // Criar categoria
  createCategory: protectedProcedure
    .input(z.object({
      parentId: z.number().optional(),
      name: z.string().min(1).max(100),
      slug: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      imageUrl: z.string().optional(),
      sortOrder: z.number().default(0),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const id = Math.floor(Math.random() * 100000);
      const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');

      await db.insert(productCategories).values({
        id,
        parentId: input.parentId,
        name: input.name,
        slug,
        description: input.description,
        icon: input.icon,
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      });

      return { id, slug };
    }),

  // =============================================================================
  // PEDIDOS
  // =============================================================================

  // Listar pedidos
  listOrders: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed', 'completed']).optional(),
      affiliateId: z.number().optional(),
      customerId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, status, affiliateId, customerId, startDate, endDate } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (status) conditions.push(eq(marketplaceOrders.status, status));
      if (affiliateId) conditions.push(eq(marketplaceOrders.affiliateId, affiliateId));
      if (customerId) conditions.push(eq(marketplaceOrders.customerId, customerId));
      if (startDate) conditions.push(sql`${marketplaceOrders.createdAt} >= ${startDate}`);
      if (endDate) conditions.push(sql`${marketplaceOrders.createdAt} <= ${endDate}`);

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [orders, countResult] = await Promise.all([
        db.select()
          .from(marketplaceOrders)
          .where(where)
          .orderBy(desc(marketplaceOrders.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(marketplaceOrders)
          .where(where),
      ]);

      // Buscar itens para cada pedido
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db.select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return { ...order, items };
        })
      );

      return {
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
        },
      };
    }),

  // Obter pedido por ID
  getOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const order = await db.select()
        .from(marketplaceOrders)
        .where(eq(marketplaceOrders.id, input.id))
        .limit(1);

      if (!order[0]) {
        throw new Error('Pedido não encontrado');
      }

      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input.id));

      return { ...order[0], items };
    }),

  // Criar pedido
  createOrder: protectedProcedure
    .input(z.object({
      productId: z.string(),
      variationId: z.string().optional(),
      quantity: z.number().min(1).default(1),
      affiliateId: z.number(),
      shippingAddress: z.object({
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string().default('BR'),
      }),
      paymentMethod: z.enum(['pix', 'credit_card', 'boleto', 'bank_transfer', 'wallet']).default('pix'),
      couponCode: z.string().optional(),
      customerNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const customerId = ctx.session.user.id;
      const orderId = crypto.randomUUID();
      const orderNumber = `MKO-${Date.now().toString(36).toUpperCase()}`;

      // Buscar produto
      const product = await db.select()
        .from(marketplaceProducts)
        .where(eq(marketplaceProducts.id, input.productId))
        .limit(1);

      if (!product[0]) {
        throw new Error('Produto não encontrado');
      }

      if (product[0].stockQuantity < input.quantity && product[0].trackInventory) {
        throw new Error('Estoque insuficiente');
      }

      const unitPrice = product[0].price;
      const subtotal = unitPrice * input.quantity;
      let discount = 0;

      // Aplicar cupom se informado
      if (input.couponCode) {
        const coupon = await db.select()
          .from(coupons)
          .where(and(
            eq(coupons.code, input.couponCode),
            eq(coupons.isActive, true),
            sql`${coupons.startDate} <= now()`
          ))
          .limit(1);

        if (coupon[0] && (!coupon[0].endDate || coupon[0].endDate > new Date())) {
          if (coupon[0].type === 'percentage') {
            discount = Math.floor(subtotal * coupon[0].value / 100);
            if (coupon[0].maxDiscount) {
              discount = Math.min(discount, coupon[0].maxDiscount);
            }
          } else if (coupon[0].type === 'fixed') {
            discount = coupon[0].value;
          }
        }
      }

      const total = subtotal - discount;

      // Criar pedido
      const orderData: InsertMarketplaceOrder = {
        id: orderId,
        orderNumber,
        affiliateId: input.affiliateId,
        productAffiliateId: product[0].affiliateId,
        customerId,
        subtotal,
        discount,
        total,
        paymentMethod: input.paymentMethod,
        shippingAddress: input.shippingAddress as any,
        customerNotes: input.customerNotes,
      };

      await db.insert(marketplaceOrders).values(orderData);

      // Criar item do pedido
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        productId: input.productId,
        variationId: input.variationId,
        quantity: input.quantity,
        unitPrice,
        totalPrice: subtotal,
        commission: product[0].commission || 0,
        affiliateCommission: Math.floor(subtotal * (product[0].commissionPercentage || 0) / 100),
      });

      // Atualizar estoque
      if (product[0].trackInventory) {
        await db.update(marketplaceProducts)
          .set({
            stockQuantity: product[0].stockQuantity - input.quantity,
            status: product[0].stockQuantity - input.quantity <= 0 ? 'out_of_stock' : product[0].status,
          })
          .where(eq(marketplaceProducts.id, input.productId));
      }

      // Incrementar contador de vendas
      await db.update(marketplaceProducts)
        .set({ salesCount: sql`${marketplaceProducts.salesCount} + 1` })
        .where(eq(marketplaceProducts.id, input.productId));

      return { orderId, orderNumber, total };
    }),

  // Atualizar status do pedido
  updateOrderStatus: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed', 'completed']),
      trackingCode: z.string().optional(),
      trackingUrl: z.string().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: Record<string, any> = {
        status: input.status,
        internalNotes: input.internalNotes,
      };

      if (input.trackingCode) updateData.trackingCode = input.trackingCode;
      if (input.trackingUrl) updateData.trackingUrl = input.trackingUrl;
      if (input.status === 'shipped') updateData.shippedAt = new Date();
      if (input.status === 'delivered') updateData.deliveredAt = new Date();

      await db.update(marketplaceOrders)
        .set(updateData)
        .where(eq(marketplaceOrders.id, input.orderId));

      return { success: true };
    }),

  // =============================================================================
  // AVALIAÇÕES
  // =============================================================================

  // Listar avaliações de um produto
  listProductReviews: protectedProcedure
    .input(z.object({
      productId: z.string(),
      status: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
      rating: z.number().min(1).max(5).optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(productReviews.productId, input.productId)];
      if (input.status) conditions.push(eq(productReviews.status, input.status));
      if (input.rating) conditions.push(eq(productReviews.rating, input.rating));

      return db.select()
        .from(productReviews)
        .where(and(...conditions))
        .orderBy(desc(productReviews.createdAt));
    }),

  // Criar avaliação
  createReview: protectedProcedure
    .input(z.object({
      productId: z.string(),
      orderId: z.string().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().max(255).optional(),
      content: z.string().optional(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const customerId = ctx.session.user.id;
      const id = crypto.randomUUID();

      await db.insert(productReviews).values({
        id,
        productId: input.productId,
        orderId: input.orderId,
        customerId,
        rating: input.rating,
        title: input.title,
        content: input.content,
        pros: input.pros,
        cons: input.cons,
        images: input.images,
        isVerifiedPurchase: !!input.orderId,
        status: 'pending', // Aprovação manual inicialmente
      });

      return { id };
    }),

  // Aprovar/rejeitar avaliação (admin)
  moderateReview: protectedProcedure
    .input(z.object({
      reviewId: z.string(),
      status: z.enum(['approved', 'rejected', 'flagged']),
      reply: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, any> = {
        status: input.status,
      };

      if (input.reply) {
        updateData.reply = input.reply;
        updateData.repliedAt = new Date();
        updateData.repliedBy = ctx.session.user.id;
      }

      await db.update(productReviews)
        .set(updateData)
        .where(eq(productReviews.id, input.reviewId));

      // Se aprovado, atualizar rating do produto
      if (input.status === 'approved') {
        const stats = await db.select({
          avgRating: sql<string>`avg(rating)`,
          count: sql<number>`count(*)`,
        })
          .from(productReviews)
          .where(and(
            eq(productReviews.productId,
              db.select({ productId: productReviews.productId })
                .from(productReviews)
                .where(eq(productReviews.id, input.reviewId))
            ),
            eq(productReviews.status, 'approved')
          ));

        if (stats[0]) {
          await db.update(marketplaceProducts)
            .set({
              rating: stats[0].avgRating,
              reviewCount: stats[0].count,
            })
            .where(eq(marketplaceProducts.id, input.productId));
        }
      }

      return { success: true };
    }),

  // =============================================================================
  // CUPONS
  // =============================================================================

  // Listar cupons
  listCoupons: protectedProcedure
    .input(z.object({
      activeOnly: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      const condition = input.activeOnly
        ? and(
            eq(coupons.isActive, true),
            sql`${coupons.startDate} <= now()`,
            sql`(${coupons.endDate} is null OR ${coupons.endDate} > now())`
          )
        : undefined;

      return db.select()
        .from(coupons)
        .where(condition)
        .orderBy(desc(coupons.createdAt));
    }),

  // Criar cupom
  createCoupon: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(50),
      type: z.enum(['percentage', 'fixed', 'free_shipping', 'buy_x_get_y']),
      value: z.number(),
      minPurchase: z.number().default(0),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().optional(),
      perUserLimit: z.number().default(1),
      applicableProducts: z.array(z.string()).optional(),
      applicableCategories: z.array(z.number()).optional(),
      targetAudience: z.enum(['all', 'new_customers', 'vip', 'affiliates', 'specific']).default('all'),
      startDate: z.date(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = crypto.randomUUID();

      await db.insert(coupons).values({
        id,
        code: input.code.toUpperCase(),
        type: input.type,
        value: input.value,
        minPurchase: input.minPurchase,
        maxDiscount: input.maxDiscount,
        usageLimit: input.usageLimit,
        perUserLimit: input.perUserLimit,
        applicableProducts: input.applicableProducts,
        applicableCategories: input.applicableCategories,
        targetAudience: input.targetAudience,
        startDate: input.startDate,
        endDate: input.endDate,
        createdBy: 1, // Admin ID
      });

      return { id, code: input.code.toUpperCase() };
    }),

  // Validar cupom
  validateCoupon: protectedProcedure
    .input(z.object({
      code: z.string(),
      cartTotal: z.number(),
      productIds: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const coupon = await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.code, input.code.toUpperCase()),
          eq(coupons.isActive, true)
        ))
        .limit(1);

      if (!coupon[0]) {
        return { valid: false, error: 'Cupom não encontrado' };
      }

      if (coupon[0].startDate > new Date()) {
        return { valid: false, error: 'Cupom ainda não está ativo' };
      }

      if (coupon[0].endDate && coupon[0].endDate < new Date()) {
        return { valid: false, error: 'Cupom expirado' };
      }

      if (coupon[0].usageLimit && coupon[0].usageCount >= coupon[0].usageLimit) {
        return { valid: false, error: 'Cupom atingido limite de uso' };
      }

      if (input.cartTotal < coupon[0].minPurchase) {
        return { valid: false, error: `Valor mínimo de R$ ${(coupon[0].minPurchase / 100).toFixed(2)}` };
      }

      let discount = 0;
      if (coupon[0].type === 'percentage') {
        discount = Math.floor(input.cartTotal * coupon[0].value / 100);
        if (coupon[0].maxDiscount) {
          discount = Math.min(discount, coupon[0].maxDiscount);
        }
      } else if (coupon[0].type === 'fixed') {
        discount = coupon[0].value;
      }

      return {
        valid: true,
        discount,
        coupon: coupon[0],
      };
    }),

  // =============================================================================
  // ESTATÍSTICAS (ADMIN)
  // =============================================================================

  // Dashboard stats
  getDashboardStats: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      const dateCondition = startDate && endDate
        ? sql`${marketplaceOrders.createdAt} BETWEEN ${startDate} AND ${endDate}`
        : undefined;

      // Totais
      const [totals] = await db.select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum(total), 0)`,
        totalSales: sql<number>`coalesce(sum(salesCount), 0)`,
      })
        .from(marketplaceOrders)
        .where(dateCondition);

      // Pedidos por status
      const ordersByStatus = await db.select({
        status: marketplaceOrders.status,
        count: sql<number>`count(*)`,
      })
        .from(marketplaceOrders)
        .where(dateCondition)
        .groupBy(marketplaceOrders.status);

      // Produtos mais vendidos
      const topProducts = await db.select({
        productId: orderItems.productId,
        name: marketplaceProducts.name,
        totalSold: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.totalPrice})`,
      })
        .from(orderItems)
        .innerJoin(marketplaceProducts, eq(orderItems.productId, marketplaceProducts.id))
        .groupBy(orderItems.productId, marketplaceProducts.name)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(10);

      // Últimos pedidos
      const recentOrders = await db.select()
        .from(marketplaceOrders)
        .orderBy(desc(marketplaceOrders.createdAt))
        .limit(5);

      return {
        totals,
        ordersByStatus,
        topProducts,
        recentOrders,
      };
    }),
});

export type MarketplaceRouter = typeof marketplaceRouter;