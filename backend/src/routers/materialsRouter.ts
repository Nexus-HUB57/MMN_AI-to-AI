import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, like, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        type: z.enum(MATERIAL_TYPES).optional(),
        status: z.enum(MATERIAL_STATUSES).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Para desenvolvimento, retornamos dados mock
      // Em produção, isso viria de uma tabela materials no banco
      const mockMaterials = [
        {
          id: 1,
          title: "Banner Principal - Black Friday",
          type: "banner",
          status: "active",
          url: "https://oneverso.com.br/ebooks/01-fundamentos-da-ia.html",
          thumbnail: "https://example.com/banners/bf2026-thumb.png",
          createdAt: new Date("2026-05-10"),
          createdBy: "admin",
          downloads: 156,
          categories: ["black-friday", "promocao"],
        },
        {
          id: 2,
          title: "E-book: Guia do Afiliado Iniciante",
          type: "ebook",
          status: "active",
          url: "https://oneverso.com.br/ebooks/pdf/01-fundamentos-da-ia.pdf",
          thumbnail: "https://example.com/ebooks/guia-afiliado-cover.jpg",
          createdAt: new Date("2026-04-20"),
          createdBy: "admin",
          downloads: 423,
          categories: ["educacao", "guias"],
        },
        {
          id: 3,
          title: "Post Instagram - Produto Premium",
          type: "social_media",
          status: "active",
          url: "https://oneverso.com.br/ebooks/pdf/02-modelos-de-linguagem.pdf",
          thumbnail: "https://example.com/social/post-premium-thumb.jpg",
          createdAt: new Date("2026-05-15"),
          createdBy: "admin",
          downloads: 89,
          categories: ["instagram", "produto"],
        },
        {
          id: 4,
          title: "Apresentação: Oportunidade de Negócio",
          type: "presentation",
          status: "active",
          url: "https://oneverso.com.br/ebooks/pdf/03-visao-computacional.pdf",
          thumbnail: "https://example.com/presentations/oportunidade-cover.jpg",
          createdAt: new Date("2026-03-05"),
          createdBy: "admin",
          downloads: 234,
          categories: ["apresentacao", "negocio"],
        },
        {
          id: 5,
          title: "Template Email - Novo Produto",
          type: "email_template",
          status: "draft",
          url: "https://oneverso.com.br/ebooks/04-ia-generativa-criativa.html",
          thumbnail: null,
          createdAt: new Date("2026-05-18"),
          createdBy: "admin",
          downloads: 0,
          categories: ["email", "produto"],
        },
      ];

      // Filtrar mock data
      let filtered = mockMaterials;
      if (input.type) {
        filtered = filtered.filter((m) => m.type === input.type);
      }
      if (input.status) {
        filtered = filtered.filter((m) => m.status === input.status);
      }
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.title.toLowerCase().includes(searchLower) ||
            m.categories.some((c) => c.includes(searchLower)),
        );
      }

      return {
        materials: filtered,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / input.limit),
        },
      };
    }),

  /**
   * Buscar material por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Mock data - em produção buscaria do banco
      const mockMaterial = {
        id: input.id,
        title: "Banner Principal - Black Friday",
        type: "banner",
        status: "active",
        url: "https://oneverso.com.br/ebooks/01-fundamentos-da-ia.html",
        thumbnail: "https://example.com/banners/bf2026-thumb.png",
        description: "Banner para Black Friday 2026 com design moderno",
        content: null,
        createdAt: new Date("2026-05-10"),
        createdBy: "admin",
        updatedAt: new Date("2026-05-10"),
        downloads: 156,
        categories: ["black-friday", "promocao"],
        metadata: {
          dimensions: "1920x1080",
          format: "PNG",
          size: "2.4MB",
        },
      };

      return mockMaterial;
    }),

  /**
   * Criar novo material (admin)
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Título é obrigatório"),
        type: z.enum(MATERIAL_TYPES),
        url: z.string().url().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        categories: z.array(z.string()).default([]),
        status: z.enum(MATERIAL_STATUSES).default("draft"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Em produção, salvaria no banco
      const newMaterial = {
        id: Date.now(), // Mock ID
        ...input,
        createdAt: new Date(),
        createdBy: ctx.user.id.toString(),
        updatedAt: new Date(),
        downloads: 0,
      };

      return {
        success: true,
        material: newMaterial,
        message: "Material criado com sucesso",
      };
    }),

  /**
   * Atualizar material (admin)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        type: z.enum(MATERIAL_TYPES).optional(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        categories: z.array(z.string()).optional(),
        status: z.enum(MATERIAL_STATUSES).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Mock update - em produção atualizaria no banco
      return {
        success: true,
        message: "Material atualizado com sucesso",
      };
    }),

  /**
   * Atualizar status do material (admin)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(MATERIAL_STATUSES),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Status atualizado para ${input.status}`,
      };
    }),

  /**
   * Deletar material (admin)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Material deletado com sucesso",
      };
    }),

  /**
   * Listar categorias disponíveis
   */
  getCategories: publicProcedure.query(async () => {
    return {
      categories: [
        { id: "promocao", name: "Promoções", count: 12 },
        { id: "educacao", name: "Educacional", count: 8 },
        { id: "produto", name: "Produtos", count: 25 },
        { id: "negocio", name: "Negócio", count: 15 },
        { id: "rede", name: "Rede", count: 6 },
        { id: "black-friday", name: "Black Friday", count: 3 },
        { id: "instagram", name: "Instagram", count: 10 },
        { id: "email", name: "Email", count: 5 },
        { id: "guias", name: "Guias", count: 4 },
        { id: "apresentacao", name: "Apresentações", count: 7 },
      ],
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
          author: "Fernanda Lima",
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
    return {
      total: 156,
      byType: {
        banner: 45,
        ebook: 23,
        video: 18,
        presentation: 12,
        social_media: 35,
        email_template: 15,
        other: 8,
      },
      byStatus: {
        active: 120,
        draft: 28,
        archived: 8,
      },
      totalDownloads: 4567,
    };
  }),
});
