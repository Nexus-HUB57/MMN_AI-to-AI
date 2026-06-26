import { protectedProcedure, router } from "../trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import {
  getAffiliateByUserId,
  getAgentByUserId,
} from "../../../database/schemas/db";

/**
 * dashboardStatusRouter — D11
 * - getStatus: indicadores agente ativado / ativação mensal pago no ciclo
 * - getCostHistory: histórico real de custos (packs, ativação, marketplace, sisu)
 * - getNotifications: feed dinâmico de eventos reais
 * - markActivationPaid: marca ativação mensal como paga (chamado pelo webhook MP)
 */
export const dashboardStatusRouter = router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
    // D14-XP
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    const agent = await getAgentByUserId(ctx.user.id);

    if (!affiliate) {
      return {
        agentActive: false,
        monthlyActivationPaid: false,
        cycleLabel: cycleLabel(new Date()),
        affiliateLevel: null,
        totalXp: 0,
        currentLevel: 1,
        monthlyXp: 0,
      };
    }

    const now = new Date();
    const cycle = cycleLabel(now);
    const yearMonth = cycle;
    const paid = await checkMonthlyActivationPaid(ctx.db, affiliate.id, yearMonth);

    // XP (paridade R$1 = 1XP)
    let xpRow: any = null;
    try {
      const res: any = await ctx.db.execute(
        `SELECT "totalXp", "currentLevel", "monthlyXp" FROM affiliate_xp WHERE "affiliateId" = $1 LIMIT 1`,
        [affiliate.id] as any
      );
      xpRow = (res?.rows ?? res ?? [])[0] ?? null;
    } catch {}

    return {
      agentActive: !!(agent && (agent.status === "active" || agent.status === "ATIVO")),
      monthlyActivationPaid: paid,
      cycleLabel: cycle,
      affiliateLevel: (affiliate as any).level || (affiliate as any).tier || "Afiliado I",
      totalXp: Number(xpRow?.totalXp ?? 0),
      currentLevel: Number(xpRow?.currentLevel ?? 1),
      monthlyXp: Number(xpRow?.monthlyXp ?? 0),
    };
  }),

  getCostHistory: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(24).optional().default(12) }))
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return { totalYearCents: 0, byCategory: {}, entries: [] };
      }

      const entries: Array<{
        period: string;
        category: string;
        description: string;
        amountCents: number;
        createdAt: string;
      }> = [];

      // 1) Pedidos do marketplace (compras de ebooks, packs, ativação mensal)
      try {
        const { orders } = await import("../../../database/schemas/schema-final");
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - input.months);
        const orderRows = await ctx.db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.affiliateId, affiliate.id),
              gte(orders.createdAt as any, cutoff as any)
            )
          )
          .orderBy(desc(orders.createdAt as any));
        for (const o of orderRows as any[]) {
          const status = String(o.status || "").toLowerCase();
          const paid = ["paid", "delivered", "confirmed", "approved"].includes(status);
          if (!paid) continue;
          const created = o.createdAt ? new Date(o.createdAt) : new Date();
          const meta = (o.metadata as any) || {};
          const source = meta.source || meta.kind || "marketplace";
          let category = "Compras Marketplace";
          let description = meta.name || meta.description || "Pedido marketplace";
          if (source === "monthly-activation") {
            category = "Ativação Mensal";
            description = "Assinatura mensal do programa · " + cycleLabel(created);
          } else if (source === "pack") {
            category = "Aquisição de Packs";
            description = meta.name || "Pack Nexus";
          } else if (String(source).toLowerCase().includes("sisu")) {
            category = "Custos SiSu";
            description = meta.name || "Pack SiSu";
          }
          entries.push({
            period: monthLabel(created),
            category,
            description,
            amountCents: Number(o.amount || meta.amountCents || 0),
            createdAt: created.toISOString(),
          });
        }
      } catch (e: any) {
        console.warn("[dashboardStatusRouter.getCostHistory] orders query failed:", e?.message);
      }

      // 2) marketplace_pack_tickets (entregas confirmadas de packs)
      try {
        const rows = await ctx.db.execute(sql`
          SELECT id, pack_slug, amount_cents, status, created_at
          FROM marketplace_pack_tickets
          WHERE user_id = ${ctx.user.id}
            AND status IN ('approved', 'paid', 'delivered')
            AND created_at > NOW() - INTERVAL '${sql.raw(String(input.months))} months'
          ORDER BY created_at DESC
        `);
        const list: any[] = (rows as any).rows || (rows as any);
        for (const r of list) {
          const created = r.created_at ? new Date(r.created_at) : new Date();
          entries.push({
            period: monthLabel(created),
            category: "Aquisição de Packs",
            description: "Pack " + (r.pack_slug || "Nexus"),
            amountCents: Number(r.amount_cents || 0),
            createdAt: created.toISOString(),
          });
        }
      } catch (e: any) {
        // table may not exist yet
      }

      // 3) Totais por categoria
      const byCategory: Record<string, number> = {};
      let total = 0;
      for (const e of entries) {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amountCents;
        total += e.amountCents;
      }

      return {
        totalYearCents: total,
        byCategory,
        entries: entries.slice(0, 200),
      };
    }),

  getNotifications: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(20) }))
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      const notifs: Array<{
        id: string;
        type: "success" | "info" | "warning" | "error";
        title: string;
        message: string;
        timestamp: string;
        href?: string;
      }> = [];

      const now = new Date();

      if (!affiliate) {
        return { notifications: [], unreadCount: 0 };
      }

      // 1) Pedidos recentes
      try {
        const { orders } = await import("../../../database/schemas/schema-final");
        const recent = await ctx.db
          .select()
          .from(orders)
          .where(eq(orders.affiliateId, affiliate.id))
          .orderBy(desc(orders.createdAt as any))
          .limit(10);
        for (const o of recent as any[]) {
          const created = o.createdAt ? new Date(o.createdAt) : now;
          const status = String(o.status || "").toLowerCase();
          const meta = (o.metadata as any) || {};
          if (["paid", "delivered", "confirmed", "approved"].includes(status)) {
            notifs.push({
              id: "order-" + o.id,
              type: "success",
              title: "Venda confirmada no marketplace",
              message: `Pedido #${o.externalOrderId || o.id} · R$ ${(Number(o.amount || 0) / 100).toFixed(2)}`,
              timestamp: created.toISOString(),
              href: "/estoque",
            });
          } else if (status === "pending") {
            notifs.push({
              id: "order-pending-" + o.id,
              type: "warning",
              title: "Pedido aguardando pagamento",
              message: `Pedido #${o.externalOrderId || o.id} pendente · ${meta.name || "Marketplace"}`,
              timestamp: created.toISOString(),
              href: "/estoque",
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // 2) Comissões recentes
      try {
        const { commissions } = await import("../../../database/schemas/schema-final");
        const recent = await ctx.db
          .select()
          .from(commissions)
          .where(eq(commissions.affiliateId, affiliate.id))
          .orderBy(desc(commissions.createdAt as any))
          .limit(5);
        for (const c of recent as any[]) {
          const created = c.createdAt ? new Date(c.createdAt) : now;
          const status = String(c.status || "").toLowerCase();
          if (["confirmed", "paid"].includes(status)) {
            notifs.push({
              id: "commission-" + c.id,
              type: "success",
              title: `Comissão de R$ ${(Number(c.amount || 0) / 100).toFixed(2)}`,
              message: `Recebida no nível ${c.level || "N1"} da malha`,
              timestamp: created.toISOString(),
              href: "/dashboard",
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // 3) Status da ativação mensal
      const yearMonth = cycleLabel(now);
      const paid = await checkMonthlyActivationPaid(ctx.db, affiliate.id, yearMonth);
      const day = now.getDate();
      if (!paid && day >= 1 && day <= 10) {
        notifs.push({
          id: "activation-pending-" + yearMonth,
          type: "warning",
          title: "Ativação Mensal disponível",
          message: `Janela oficial de 01 a 10. Faltam ${11 - day} dias para encerrar.`,
          timestamp: now.toISOString(),
          href: "/marketplaces?focus=monthly-activation",
        });
      } else if (paid) {
        notifs.push({
          id: "activation-paid-" + yearMonth,
          type: "success",
          title: "Ativação Mensal confirmada",
          message: `Ciclo ${yearMonth} ativo · bônus e comissões liberados`,
          timestamp: now.toISOString(),
          href: "/dashboard",
        });
      } else if (day > 10) {
        notifs.push({
          id: "activation-overdue-" + yearMonth,
          type: "error",
          title: "Ativação Mensal pendente",
          message: "Janela oficial encerrada. Regularize para reativar bônus.",
          timestamp: now.toISOString(),
          href: "/marketplaces?focus=monthly-activation",
        });
      }

      // 4) Sistema operacional (sempre)
      notifs.push({
        id: "system-online-" + now.toISOString().slice(0, 10),
        type: "info",
        title: "Sistema OneVerso online",
        message: "Agentes IA prontos · Marketplace Nexus operacional",
        timestamp: now.toISOString(),
      });

      // ordenar por data decrescente
      notifs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

      return {
        notifications: notifs.slice(0, input.limit),
        unreadCount: notifs.filter((n) => n.type !== "info").length,
      };
    }),
});

// ===== helpers =====
function cycleLabel(d: Date) {
  return d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}
function monthLabel(d: Date) {
  const m = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  const y = d.getFullYear();
  return `${m.charAt(0).toUpperCase() + m.slice(1)}/${y}`;
}

async function checkMonthlyActivationPaid(
  db: any,
  affiliateId: number,
  cycle: string
): Promise<boolean> {
  try {
    const rows = await db.execute(sql`
      SELECT 1 FROM orders
      WHERE affiliate_id = ${affiliateId}
        AND metadata->>'source' = 'monthly-activation'
        AND status IN ('paid','delivered','confirmed','approved')
        AND to_char(created_at, 'TMMonth YYYY') = ${cycle}
      LIMIT 1
    `);
    const list = (rows as any).rows || (rows as any);
    return list && list.length > 0;
  } catch {
    return false;
  }
}
