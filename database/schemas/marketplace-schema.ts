import { pgTable, serial, integer, varchar, text, timestamp, index, numeric, jsonb, boolean } from "drizzle-orm/pg-core";

export const marketplaceProducts = pgTable("marketplace_products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  categoryId: integer("categoryId"),
  sku: varchar("sku", { length: 50 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  price: integer("price").notNull(),
  compareAtPrice: integer("compareAtPrice"),
  costPrice: integer("costPrice"),
  profitMargin: numeric("profitMargin", { precision: 5, scale: 2 }),
  commission: integer("commission").default(0),
  commissionPercentage: numeric("commissionPercentage", { precision: 5, scale: 2 }),
  stockQuantity: integer("stockQuantity").notNull().default(0),
  lowStockThreshold: integer("lowStockThreshold").default(5),
  trackInventory: boolean("trackInventory").default(true),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  productType: varchar("productType", { length: 20 }).default("digital").notNull(),
  isFeatured: boolean("isFeatured").default(false),
  isFeaturedInAffiliate: boolean("isFeaturedInAffiliate").default(false),
  weight: numeric("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions").$type<{ length: number; width: number; height: number }>(),
  images: jsonb("images").$type<string[]>(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  viewCount: integer("viewCount").default(0).notNull(),
  salesCount: integer("salesCount").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("reviewCount").default(0),
  tags: jsonb("tags").$type<string[]>(),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parentId"),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  sortOrder: integer("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  productCount: integer("productCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  parentIdIdx: index("category_parent_idx").on(table.parentId),
  slugIdx: index("category_slug_idx").on(table.slug),
  activeIdx: index("category_active_idx").on(table.isActive),
}));

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

export const productVariations = pgTable("product_variations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 50 }),
  price: integer("price"),
  stockQuantity: integer("stockQuantity").default(0),
  isActive: boolean("isActive").default(true),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("variation_product_idx").on(table.productId),
}));

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;

export const marketplaceOrders = pgTable("marketplace_orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  buyerId: integer("buyerId").notNull(),
  sellerId: integer("sellerId").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingCost: integer("shippingCost").default(0),
  discount: integer("discount").default(0),
  total: integer("total").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentStatus: varchar("paymentStatus", { length: 20 }).default("pending"),
  shippingAddress: jsonb("shippingAddress").$type<{ street: string; city: string; state: string; zip: string; country: string }>(),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  buyerIdIdx: index("mp_order_buyer_idx").on(table.buyerId),
  sellerIdIdx: index("mp_order_seller_idx").on(table.sellerId),
  statusIdx: index("mp_order_status_idx").on(table.status),
  createdAtIdx: index("mp_order_date_idx").on(table.createdAt),
}));

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

export const marketplaceOrderItems = pgTable("marketplace_order_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("orderId", { length: 36 }).notNull(),
  productId: varchar("productId", { length: 36 }).notNull(),
  variationId: varchar("variationId", { length: 36 }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unitPrice").notNull(),
  totalPrice: integer("totalPrice").notNull(),
  commissionAmount: integer("commissionAmount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index("mp_order_item_order_idx").on(table.orderId),
  productIdIdx: index("mp_order_item_product_idx").on(table.productId),
}));

export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type InsertMarketplaceOrderItem = typeof marketplaceOrderItems.$inferInsert;

export const productReviews = pgTable("product_reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  orderId: varchar("orderId", { length: 36 }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("review_product_idx").on(table.productId),
  userIdIdx: index("review_user_idx").on(table.userId),
  statusIdx: index("review_status_idx").on(table.status),
}));

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

export const dropshippingSuppliers = pgTable("dropshipping_suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  apiEndpoint: varchar("apiEndpoint", { length: 500 }),
  apiKey: text("apiKey"),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 30 }),
  country: varchar("country", { length: 10 }).default("BR"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  processingTime: integer("processingTime").default(2),
  shippingTime: integer("shippingTime").default(7),
  commission: numeric("commission", { precision: 5, scale: 2 }).default("0"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("supplier_status_idx").on(table.status),
}));

export type DropshippingSupplier = typeof dropshippingSuppliers.$inferSelect;
export type InsertDropshippingSupplier = typeof dropshippingSuppliers.$inferInsert;
