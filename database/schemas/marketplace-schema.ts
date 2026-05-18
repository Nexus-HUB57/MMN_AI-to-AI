import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index, decimal, json, boolean, bigint } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// =============================================================================
// MARKETPLACE NEXUS - Catálogo Próprio de Produtos
// =============================================================================

/**
 * Marketplace Products - Produtos do catálogo próprio
 */
export const marketplaceProducts = mysqlTable('marketplace_products', {
  id: varchar("id", { length: 36 }).primaryKey(),
  affiliateId: int("affiliateId").notNull(), // Criador/fornecedor do produto
  categoryId: int("categoryId"),
  sku: varchar("sku", { length: 50 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  price: int("price").notNull(), // Preço em centavos
  compareAtPrice: int("compareAtPrice"), // Preço "de"
  costPrice: int("costPrice"), // Custo para cálculo de margem
  profitMargin: decimal("profitMargin", { precision: 5, scale: 2 }),
  commission: int("commission").default(0), // Comissão por venda
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }),
  stockQuantity: int("stockQuantity").notNull().default(0),
  lowStockThreshold: int("lowStockThreshold").default(5),
  trackInventory: boolean("trackInventory").default(true),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived", "out_of_stock"]).default("draft").notNull(),
  productType: mysqlEnum("productType", ["digital", "physical", "service", "subscription"]).default("digital").notNull(),
  isFeatured: boolean("isFeatured").default(false),
  isFeaturedInAffiliate: boolean("isFeaturedInAffiliate").default(false),
  weight: decimal("weight", { precision: 8, scale: 2 }), // kg
  dimensions: json("dimensions").$type<{ length: number; width: number; height: number }>(),
  images: json("images").$type<string[]>(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  viewCount: int("viewCount").default(0).notNull(),
  salesCount: int("salesCount").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  tags: json("tags").$type<string[]>(),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("marketplace_product_affiliate_idx").on(table.affiliateId),
  categoryIdIdx: index("marketplace_product_category_idx").on(table.categoryId),
  statusIdx: index("marketplace_product_status_idx").on(table.status),
  skuIdx: index("marketplace_product_sku_idx").on(table.sku),
  slugIdx: index("marketplace_product_slug_idx").on(table.slug),
  priceIdx: index("marketplace_product_price_idx").on(table.price),
}));

export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = typeof marketplaceProducts.$inferInsert;

/**
 * Product Categories - Categorias de produtos
 */
export const productCategories = mysqlTable('product_categories', {
  id: int("id").primaryKey().autoincrement(),
  parentId: int("parentId"),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  productCount: int("productCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  parentIdIdx: index("category_parent_idx").on(table.parentId),
  slugIdx: index("category_slug_idx").on(table.slug),
  activeIdx: index("category_active_idx").on(table.isActive),
}));

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

/**
 * Product Variations - Variações de produtos (tamanho, cor, etc)
 */
export const productVariations = mysqlTable('product_variations', {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(), // ex: "Tamanho", "Cor"
  value: varchar("value", { length: 100 }).notNull(), // ex: "P", "Azul"
  sku: varchar("sku", { length: 50 }),
  price: int("price"), // Preço adicional (pode ser negativo para desconto)
  stockQuantity: int("stockQuantity").default(0),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("variation_product_idx").on(table.productId),
  skuIdx: index("variation_sku_idx").on(table.sku),
}));

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;

/**
 * Marketplace Orders - Pedidos do marketplace
 */
export const marketplaceOrders = mysqlTable('marketplace_orders', {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  affiliateId: int("affiliateId").notNull(), // Afiliado que indicou/vendeu
  productAffiliateId: int("productAffiliateId").notNull(), // Criador do produto
  customerId: int("customerId").notNull(),
  status: mysqlEnum("status", [
    "pending", "confirmed", "processing", "shipped", "delivered",
    "cancelled", "refunded", "disputed", "completed"
  ]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(),
  discount: int("discount").default(0),
  shipping: int("shipping").default(0),
  tax: int("tax").default(0),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "boleto", "bank_transfer", "wallet"]).default("pix"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "partial_refund"]).default("pending"),
  paymentId: varchar("paymentId", { length: 100 }),
  paidAt: timestamp("paidAt"),
  shippingAddress: json("shippingAddress").$type<{
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  trackingCode: varchar("trackingCode", { length: 100 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  customerNotes: text("customerNotes"),
  internalNotes: text("internalNotes"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("mko_affiliate_idx").on(table.affiliateId),
  productAffiliateIdx: index("mko_product_affiliate_idx").on(table.productAffiliateId),
  customerIdIdx: index("mko_customer_idx").on(table.customerId),
  statusIdx: index("mko_status_idx").on(table.status),
  orderNumberIdx: index("mko_order_number_idx").on(table.orderNumber),
  createdAtIdx: index("mko_created_idx").on(table.createdAt),
}));

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

/**
 * Order Items - Itens do pedido
 */
export const orderItems = mysqlTable('order_items', {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("orderId", { length: 36 }).notNull(),
  productId: varchar("productId", { length: 36 }).notNull(),
  variationId: varchar("variationId", { length: 36 }),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  totalPrice: int("totalPrice").notNull(),
  discount: int("discount").default(0),
  commission: int("commission").default(0),
  affiliateCommission: int("affiliateCommission").default(0),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_item_order_idx").on(table.orderId),
  productIdIdx: index("order_item_product_idx").on(table.productId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Product Reviews - Avaliações de produtos
 */
export const productReviews = mysqlTable('product_reviews', {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull(),
  orderId: varchar("orderId", { length: 36 }),
  customerId: int("customerId").notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  content: text("content"),
  pros: json("pros").$type<string[]>(),
  cons: json("cons").$type<string[]>(),
  images: json("images").$type<string[]>(),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  helpfulCount: int("helpfulCount").default(0),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "flagged"]).default("pending"),
  repliedAt: timestamp("repliedAt"),
  reply: text("reply"),
  repliedBy: int("repliedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("review_product_idx").on(table.productId),
  customerIdIdx: index("review_customer_idx").on(table.customerId),
  ratingIdx: index("review_rating_idx").on(table.rating),
  statusIdx: index("review_status_idx").on(table.status),
}));

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

/**
 * Wishlists - Listas de desejos
 */
export const wishlists = mysqlTable('wishlists', {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).default("Minha Lista"),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("wishlist_user_idx").on(table.userId),
}));

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

/**
 * Wishlist Items - Itens da lista de desejos
 */
export const wishlistItems = mysqlTable('wishlist_items', {
  id: varchar("id", { length: 36 }).primaryKey(),
  wishlistId: varchar("wishlistId", { length: 36 }).notNull(),
  productId: varchar("productId", { length: 36 }).notNull(),
  notes: text("notes"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  wishlistIdIdx: index("wishlist_item_wishlist_idx").on(table.wishlistId),
  productIdIdx: index("wishlist_item_product_idx").on(table.productId),
}));

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

/**
 * Coupons - Cupons de desconto
 */
export const coupons = mysqlTable('coupons', {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  type: mysqlEnum("type", ["percentage", "fixed", "free_shipping", "buy_x_get_y"]).notNull(),
  value: int("value").notNull(), // Percentual (1-100) ou valor em centavos
  minPurchase: int("minPurchase").default(0),
  maxDiscount: int("maxDiscount"), // Máximo de desconto em centavos
  usageLimit: int("usageLimit"), // Total de usos permitidos
  usageCount: int("usageCount").default(0),
  perUserLimit: int("perUserLimit").default(1),
  applicableProducts: json("applicableProducts").$type<string[]>(), // IDs dos produtos ou null para todos
  applicableCategories: json("applicableCategories").$type<number[]>(), // IDs das categorias
  targetAudience: mysqlEnum("targetAudience", ["all", "new_customers", "vip", "affiliates", "specific"]).default("all"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("coupon_code_idx").on(table.code),
  activeIdx: index("coupon_active_idx").on(table.isActive),
  startDateIdx: index("coupon_start_idx").on(table.startDate),
}));

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Affiliate Marketplace Settings - Configurações de marketplace por afiliado
 */
export const affiliateMarketplaceSettings = mysqlTable('affiliate_marketplace_settings', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull().unique(),
  canSellProducts: boolean("canSellProducts").default(false),
  canCreateProducts: boolean("canCreateProducts").default(false),
  defaultCommission: int("defaultCommission").default(0),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("0"),
  autoApproveOrders: boolean("autoApproveOrders").default(false),
  minPayout: int("minPayout").default(1000), // Mínimo para saque em centavos
  payoutSchedule: mysqlEnum("payoutSchedule", ["weekly", "biweekly", "monthly"]).default("weekly"),
  paymentMethods: json("paymentMethods").$type<string[]>(),
  customBranding: boolean("customBranding").default(false),
  customDomain: varchar("customDomain", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("ams_affiliate_idx").on(table.affiliateId),
}));

export type AffiliateMarketplaceSettings = typeof affiliateMarketplaceSettings.$inferSelect;
export type InsertAffiliateMarketplaceSettings = typeof affiliateMarketplaceSettings.$inferInsert;