// D17-redis-cache
import IORedis from "ioredis";
const __redisD17 = (() => {
  try {
    if (!process.env.REDIS_URL) return null;
    const r = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    } as any);
    r.on("error", (e: any) => console.warn("[D17-redis-cache] err:", e?.message));
    return r;
  } catch { return null; }
})();
const __EBOOK_CACHE_KEY = "d17:ebooks:v1";
const __EBOOK_CACHE_TTL = 300; // 5 min

async function __readEbookCacheRedis() {
  if (!__redisD17) return null;
  try {
    const v = await __redisD17.get(__EBOOK_CACHE_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
async function __writeEbookCacheRedis(data: any) {
  if (!__redisD17) return;
  try { await __redisD17.set(__EBOOK_CACHE_KEY, JSON.stringify(data), "EX", __EBOOK_CACHE_TTL); } catch {}
}
// D16-cache-redis
let __ebookCache: { at: number; data: any } | null = null;
const __EBOOK_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
/**
 * marketplaceNexusRouter — Rotas tRPC do Marketplace Nexus
 *
 * Expostas em /api/trpc/marketplaceNexus.<procedure>
 *
 *  - listEbooks (public): catálogo dos 132 ebooks
 *  - listPacks (public): catálogo dos 15 packs
 *  - getCart (protected): carrinho ativo do usuário
 *  - addToCart (protected): adicionar ebook ou pack ao carrinho
 *  - removeFromCart (protected): remover linha do carrinho
 *  - clearCart (protected): esvaziar carrinho
 *  - checkout (protected): cria pedido a partir do carrinho
 *  - markPaid (protected): marca como pago + entrega (uso temporário até webhook)
 *  - getLibrary (protected): biblioteca pessoal do usuário
 *  - getOrders (protected): pedidos do usuário
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../config/trpc";
import {
  listEbooks,
  listPacksPublic,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  createOrderFromCart,
  markOrderAsPaid,
  getUserLibrary,
  listUserOrders,
} from "../domains/marketplace/userLibraryService";

const ctxUserId = (ctx: { user?: { id?: number | string } }) => {
  const raw = ctx.user?.id;
  if (raw === undefined || raw === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Autenticação requerida" });
  }
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário inválido" });
  }
  return n;
};

export const marketplaceNexusRouter = router({
  listEbooks: publicProcedure
    // D17-redis-cache-wrap
    .input(z.object({ unlockPackSlug: z.string().optional() }).optional())
    .query(async ({ input }) => {
      // Sem filtro: cache compartilhado (200KB de payload). Com filtro: bypass.
      if (input?.unlockPackSlug) return listEbooks({ unlockPackSlug: input.unlockPackSlug });
      const hit = await __readEbookCacheRedis();
      if (hit) return hit;
      const fresh = await listEbooks({});
      await __writeEbookCacheRedis(fresh);
      return fresh;
    }),

  listPacks: publicProcedure.query(async () => listPacksPublic()),

  getCart: protectedProcedure.query(async ({ ctx }) => getCart(ctxUserId(ctx))),

  addToCart: protectedProcedure
    .input(
      z.object({
        itemType: z.enum(["ebook", "pack"]),
        itemSlug: z.string().min(1).max(180),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await addToCart(ctxUserId(ctx), input);
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: (e as Error).message });
      }
    }),

  removeFromCart: protectedProcedure
    .input(z.object({ cartItemId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await removeFromCart(ctxUserId(ctx), input.cartItemId);
      } catch (e) {
        throw new TRPCError({ code: "NOT_FOUND", message: (e as Error).message });
      }
    }),

  clearCart: protectedProcedure.mutation(async ({ ctx }) => clearCart(ctxUserId(ctx))),

  checkout: protectedProcedure
    .input(
      z
        .object({
          paymentMethod: z
            .enum(["pix", "mercado_pago", "credit_card", "boleto", "manual"])
            .default("pix"),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await createOrderFromCart(ctxUserId(ctx), input?.paymentMethod ?? "pix");
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: (e as Error).message });
      }
    }),

  markPaid: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        paymentId: z.string().optional(),
        paymentMethod: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await markOrderAsPaid(input.orderId, {
          paymentId: input.paymentId,
          paymentMethod: input.paymentMethod,
        });
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: (e as Error).message });
      }
    }),

  getLibrary: protectedProcedure.query(async ({ ctx }) => getUserLibrary(ctxUserId(ctx))),

  getOrders: protectedProcedure.query(async ({ ctx }) => listUserOrders(ctxUserId(ctx))),
});

export type MarketplaceNexusRouter = typeof marketplaceNexusRouter;
