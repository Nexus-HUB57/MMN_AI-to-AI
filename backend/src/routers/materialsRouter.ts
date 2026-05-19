import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, like, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Tipos de materiais
const MATERIAL_TYPES = ["banner", "ebook", "video", "presentation", "social_media", "email_template", "other"] as const;
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
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      type: z.enum(MATERIAL_TYPES).optional(),
      status: z.enum(MATERIAL_STATUSES).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Para desenvolvimento, retornamos dados mock
      // Em produção, isso viria de uma tabela materials no banco
      const mockMaterials = [
        {
          id: 1,
          title: "Banner Principal - Black Friday",
          type: "banner",
          status: "active",
          url: "https://example.com/banners/bf2026.png",
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
          url: "https://example.com/ebooks/guia-afiliado.pdf",
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
          url: "https://example.com/social/post-premium.jpg",
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
          url: "https://example.com/presentations/oportunidade.pptx",
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
          url: "https://example.com/emails/novo-produto.html",
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
        filtered = filtered.filter(m => m.type === input.type);
      }
      if (input.status) {
        filtered = filtered.filter(m => m.status === input.status);
      }
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(m =>
          m.title.toLowerCase().includes(searchLower) ||
          m.categories.some(c => c.includes(searchLower))
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
        url: "https://example.com/banners/bf2026.png",
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
    .input(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      type: z.enum(MATERIAL_TYPES),
      url: z.string().url().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      categories: z.array(z.string()).default([]),
      status: z.enum(MATERIAL_STATUSES).default("draft"),
    }))
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
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      type: z.enum(MATERIAL_TYPES).optional(),
      url: z.string().url().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      categories: z.array(z.string()).optional(),
      status: z.enum(MATERIAL_STATUSES).optional(),
    }))
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
    .input(z.object({
      id: z.number(),
      status: z.enum(MATERIAL_STATUSES),
    }))
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