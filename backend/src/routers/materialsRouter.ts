import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, like, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Tipos de materiais
const MATERIAL_TYPES = [
  "banner",
  "ebook",
  "video",
  "presentation",
  "social_media",
  "email_template",
  "other",
] as const;
const MATERIAL_STATUSES = ["draft", "active", "archived"] as const;

/**
 * Materials Router - Gestão de materiais de marketing
 *
 * Endpoints para listagem, criação e gerenciamento de materiais
 */
export const materialsRouter = router({
  /**
   * Listar materiais com filtros
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // pool provided at module level
      const where: string[] = ["1=1"];
      const params: any[] = [];
      let pi = 1;

      if (input.type) {
        where.push(`type = $${pi++}`);
        params.push(input.type);
      }
      if (input.status) {
        where.push(`status = $${pi++}`);
        params.push(input.status);
      }
      if (input.search) {
        where.push(`(LOWER(title) LIKE $${pi} OR LOWER(name) LIKE $${pi})`);
        params.push(`%${input.search.toLowerCase()}%`);
        pi++;
      }

      const whereSql = where.join(" AND ");
      const offset = (input.page - 1) * input.limit;

      const totalRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM materials WHERE ${whereSql}`,
        params,
      );
      const total = totalRes.rows[0]?.c ?? 0;

      const rowsRes = await pool.query(
        `SELECT id, COALESCE(title, name) AS title, type, status,
                "fileUrl" AS url, "fileUrl" AS "fileUrl",
                downloads, "createdAt" AS "createdAt",
                description
         FROM materials
         WHERE ${whereSql}
         ORDER BY "createdAt" DESC
         LIMIT $${pi} OFFSET $${pi + 1}`,
        [...params, input.limit, offset],
      );

      const materials = rowsRes.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
        url: r.url,
        thumbnail: null,
        createdAt: r.createdAt,
        createdBy: "admin",
        downloads: r.downloads,
        categories: [r.type],
        description: r.description,
      }));

      return {
        materials,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        },
      };
    }),

  /**
   * Listar banners com filtros e métricas dedicadas
   */
  listBanners: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(24),
        status: z.enum(["active", "inactive", "archived"]).optional(),
        category: z.string().optional(),
        dimensions: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const banners = [
        {
          id: 1,
          title: "Banner Black Friday 2026",
          description:
            "Banner principal promocional com gradiente neon e CTA destacado.",
          category: "promocao",
          imageUrl:
            "https://images.unsplash.com/photo-1605902711622-cfb43c4437d4?w=1200&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/black-friday-2026.zip",
          dimensions: "1200x628",
          size: "2.4 MB",
          downloads: 245,
          status: "active",
          createdAt: "2026-04-15",
          updatedAt: "2026-05-20",
        },
        {
          id: 2,
          title: "Banner Cyber Monday",
          description:
            "Peça para campanhas de Cyber Monday com layout mobile-first.",
          category: "sazonal",
          imageUrl:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/cyber-monday.zip",
          dimensions: "1080x1080",
          size: "1.8 MB",
          downloads: 156,
          status: "active",
          createdAt: "2026-04-10",
          updatedAt: "2026-05-18",
        },
        {
          id: 3,
          title: "Banner Produto Premium",
          description:
            "Banner de produto premium com foco em conversão por upgrade.",
          category: "produto",
          imageUrl:
            "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/produto-premium.zip",
          dimensions: "1200x628",
          size: "3.1 MB",
          downloads: 189,
          status: "active",
          createdAt: "2026-04-08",
          updatedAt: "2026-05-19",
        },
        {
          id: 4,
          title: "Banner Evento Lançamento",
          description:
            "Convite visual para o evento de lançamento da nova trilha de skills.",
          category: "evento",
          imageUrl:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/evento-lancamento.zip",
          dimensions: "1920x1080",
          size: "4.7 MB",
          downloads: 92,
          status: "inactive",
          createdAt: "2026-03-20",
          updatedAt: "2026-04-05",
        },
        {
          id: 5,
          title: "Banner Instagram Stories",
          description:
            "Story vertical otimizado para campanhas pagas no Instagram.",
          category: "redes-sociais",
          imageUrl:
            "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1080&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/instagram-stories.zip",
          dimensions: "1080x1920",
          size: "1.5 MB",
          downloads: 312,
          status: "active",
          createdAt: "2026-04-01",
          updatedAt: "2026-05-21",
        },
        {
          id: 6,
          title: "Banner Webinar AI Sync",
          description:
            "Banner promocional do webinar de sincronização de agentes.",
          category: "evento",
          imageUrl:
            "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/banners/webinar-ai-sync.zip",
          dimensions: "1200x628",
          size: "2.9 MB",
          downloads: 134,
          status: "active",
          createdAt: "2026-05-02",
          updatedAt: "2026-05-22",
        },
      ];

      let filtered = banners;
      if (input.status)
        filtered = filtered.filter((b) => b.status === input.status);
      if (input.category)
        filtered = filtered.filter((b) => b.category === input.category);
      if (input.dimensions)
        filtered = filtered.filter((b) => b.dimensions === input.dimensions);
      if (input.search) {
        const term = input.search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(term) ||
            b.description.toLowerCase().includes(term) ||
            b.category.toLowerCase().includes(term),
        );
      }

      const totalDownloads = filtered.reduce(
        (sum, b) => sum + Number(b.downloads ?? 0),
        0,
      );
      const dimensionsCount = filtered.reduce<Record<string, number>>(
        (acc, b) => {
          acc[b.dimensions] = (acc[b.dimensions] ?? 0) + 1;
          return acc;
        },
        {},
      );

      return {
        banners: filtered,
        summary: {
          totalBanners: filtered.length,
          activeBanners: filtered.filter((b) => b.status === "active").length,
          totalDownloads,
          dimensionsCount,
        },
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / input.limit)),
        },
      };
    }),

  /**
   * Listar ebooks com filtros e métricas dedicadas
   */
  listEbooks: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(24),
        status: z.enum(["active", "inactive", "archived"]).optional(),
        category: z.string().optional(),
        accessLevel: z.enum(["public", "premium", "exclusive"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const ebooks = [
        {
          id: 1,
          title: "Guia Completo de Marketing Digital 2026",
          author: "Carlos Silva",
          description:
            "Estratégias atualizadas de marketing digital para acelerar vendas e indicações.",
          category: "marketing",
          pages: 156,
          fileSize: "4.2 MB",
          coverImage:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/ebooks/marketing-digital-2026.pdf",
          downloads: 1245,
          accessLevel: "public",
          status: "active",
          rating: 4.7,
          createdAt: "2026-01-15",
          updatedAt: "2026-04-20",
        },
        {
          id: 2,
          title: "Técnicas Avançadas de Vendas Consultivas",
          author: "Marina Costa",
          description:
            "Aprenda a vender com consultoria, criar autoridade e fechar tickets maiores.",
          category: "vendas",
          pages: 203,
          fileSize: "5.8 MB",
          coverImage:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/ebooks/vendas-consultivas.pdf",
          downloads: 856,
          accessLevel: "premium",
          status: "active",
          rating: 4.8,
          createdAt: "2026-02-10",
          updatedAt: "2026-04-18",
        },
        {
          id: 3,
          title: "Segredos do Empreendedorismo em IA",
          author: "João Santos",
          description:
            "Guia executivo para empreendedores acelerados por inteligência artificial.",
          category: "negocio",
          pages: 287,
          fileSize: "6.5 MB",
          coverImage:
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/ebooks/empreendedorismo-ia.pdf",
          downloads: 634,
          accessLevel: "exclusive",
          status: "active",
          rating: 4.9,
          createdAt: "2026-03-05",
          updatedAt: "2026-04-19",
        },
        {
          id: 4,
          title: "Treinamento em Liderança Distribuída",
          author: "",  // Onda 9: mock removido
          description:
            "Desenvolva sua rede com lideranças autônomas, OKRs e cadência operacional.",
          category: "lideranca",
          pages: 198,
          fileSize: "4.9 MB",
          coverImage:
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/ebooks/lideranca-distribuida.pdf",
          downloads: 521,
          accessLevel: "premium",
          status: "active",
          rating: 4.6,
          createdAt: "2026-03-20",
          updatedAt: "2026-04-17",
        },
        {
          id: 5,
          title: "Playbook de Produtividade Operacional",
          author: "Ricardo Oliveira",
          description:
            "Sistema operacional pessoal de alta performance para gestores de rede.",
          category: "guias",
          pages: 142,
          fileSize: "3.7 MB",
          coverImage:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=70&auto=format&fit=crop",
          downloadUrl: "https://example.com/ebooks/playbook-produtividade.pdf",
          downloads: 1089,
          accessLevel: "public",
          status: "active",
          rating: 4.5,
          createdAt: "2026-04-01",
          updatedAt: "2026-05-21",
        },
        {
          id: 6,
          title: "Manual do Dropshipping Inteligente",
          author: "Beatriz Alves",
          description:
            "Implemente operações de dropshipping com automações orientadas por IA.",
          category: "vendas",
          pages: 174,
          fileSize: "5.1 MB",
          coverImage:
            "https://images.unsplash.com/photo-1556740772-1a741367b93e?w=600&q=70&auto=format&fit=crop",
          downloadUrl:
            "https://example.com/ebooks/dropshipping-inteligente.pdf",
          downloads: 412,
          accessLevel: "premium",
          status: "active",
          rating: 4.7,
          createdAt: "2026-04-22",
          updatedAt: "2026-05-15",
        },
      ];

      let filtered = ebooks;
      if (input.status)
        filtered = filtered.filter((e) => e.status === input.status);
      if (input.category)
        filtered = filtered.filter((e) => e.category === input.category);
      if (input.accessLevel)
        filtered = filtered.filter((e) => e.accessLevel === input.accessLevel);
      if (input.search) {
        const term = input.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(term) ||
            e.author.toLowerCase().includes(term) ||
            e.description.toLowerCase().includes(term) ||
            e.category.toLowerCase().includes(term),
        );
      }

      const totalDownloads = filtered.reduce(
        (sum, e) => sum + Number(e.downloads ?? 0),
        0,
      );
      const totalPages = filtered.reduce(
        (sum, e) => sum + Number(e.pages ?? 0),
        0,
      );
      const averageRating = filtered.length
        ? filtered.reduce((sum, e) => sum + Number(e.rating ?? 0), 0) /
          filtered.length
        : 0;
      const accessLevelCount = filtered.reduce<Record<string, number>>(
        (acc, e) => {
          acc[e.accessLevel] = (acc[e.accessLevel] ?? 0) + 1;
          return acc;
        },
        {},
      );

      return {
        ebooks: filtered,
        summary: {
          totalEbooks: filtered.length,
          activeEbooks: filtered.filter((e) => e.status === "active").length,
          totalDownloads,
          totalPages,
          averageRating: Number(averageRating.toFixed(2)),
          accessLevelCount,
        },
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / input.limit)),
        },
      };
    }),

  /**
   * Estatísticas de materiais
   */
  getStats: publicProcedure.query(async () => {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE type='banner')::int AS banner,
          COUNT(*) FILTER (WHERE type='ebook')::int AS ebook,
          COUNT(*) FILTER (WHERE type='video')::int AS video,
          COUNT(*) FILTER (WHERE type='presentation')::int AS presentation,
          COUNT(*) FILTER (WHERE type='social_media')::int AS social_media,
          COUNT(*) FILTER (WHERE type='email_template')::int AS email_template,
          COUNT(*) FILTER (WHERE type='other')::int AS other,
          COUNT(*) FILTER (WHERE status='active')::int AS active,
          COUNT(*) FILTER (WHERE status='draft')::int AS draft,
          COUNT(*) FILTER (WHERE status='archived')::int AS archived,
          COALESCE(SUM(downloads)::int, 0) AS total_downloads
        FROM materials
      `);
      const s = res.rows[0];
      return {
        total: s.total,
        byType: {
          banner: s.banner, ebook: s.ebook, video: s.video,
          presentation: s.presentation, social_media: s.social_media,
          email_template: s.email_template, other: s.other,
        },
        byStatus: { active: s.active, draft: s.draft, archived: s.archived },
        totalDownloads: s.total_downloads,
      };
    } finally {
      client.release();
      await pool.end();
    }
  }),
});
