import { TRPCError } from "@trpc/server";

/**
 * Database layer for Bonus and Materials module
 * In production, this would connect to actual database
 */

// Mock data store
const mockBonuses = [
  {
    id: 1,
    userId: 1,
    title: "Bônus de Início Rápido",
    description: "Atinja 5 novos afiliados diretos em 30 dias.",
    category: "achievement",
    progress: 60,
    reward: "R$ 500,00",
    requirements: ["5 afiliados diretos", "Dentro de 30 dias", "Status ativo"],
    expiresAt: "2024-06-05",
    status: "active",
  },
];

const mockSponsors = [
  {
    id: 1,
    name: "Carlos Silva",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    affiliateCode: "CARLOS001",
    level: 5,
    totalCommissions: "15.500,00",
    directReferrals: 12,
    networkSize: 145,
    status: "active",
    joinedDate: "2023-01-15",
  },
];

const mockMaterials = [
  {
    id: 1,
    title: "Banner Black Friday - 1200x628",
    description: "Banner promocional para Black Friday com design moderno",
    category: "promotional",
    type: "banner",
    url: "https://example.com/materials/banner-black-friday.zip",
    fileSize: "2.4 MB",
    downloadCount: 245,
    status: "active",
    createdAt: "2024-04-15",
    thumbnail: "https://via.placeholder.com/400x300?text=Black+Friday",
  },
];

// Bonus functions
export async function getBonusesByAffiliate(userId: number, limit: number, offset: number) {
  try {
    // In production: SELECT * FROM bonuses WHERE userId = ? LIMIT ? OFFSET ?
    return mockBonuses.slice(offset, offset + limit);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch bonuses",
    });
  }
}

export async function getBonusById(bonusId: number) {
  try {
    const bonus = mockBonuses.find((b) => b.id === bonusId);
    if (!bonus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Bonus not found",
      });
    }
    return bonus;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch bonus",
    });
  }
}

export async function getBonusProgress(userId: number, bonusId: number) {
  try {
    const bonus = mockBonuses.find((b) => b.id === bonusId);
    if (!bonus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Bonus not found",
      });
    }
    return {
      bonusId,
      progress: bonus.progress,
      requirements: bonus.requirements,
      status: bonus.status,
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch bonus progress",
    });
  }
}

export async function claimBonusReward(userId: number, bonusId: number) {
  try {
    // In production: UPDATE bonuses SET status = 'completed', claimedAt = NOW() WHERE id = ? AND userId = ?
    return { success: true, message: "Reward claimed successfully" };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to claim reward",
    });
  }
}

// Sponsor functions
export async function getTopSponsors(limit: number) {
  try {
    // In production: SELECT * FROM affiliates ORDER BY totalCommissions DESC LIMIT ?
    return mockSponsors.slice(0, limit);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch top sponsors",
    });
  }
}

export async function getSponsorById(sponsorId: number) {
  try {
    const sponsor = mockSponsors.find((s) => s.id === sponsorId);
    if (!sponsor) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sponsor not found",
      });
    }
    return sponsor;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch sponsor",
    });
  }
}

export async function getSponsorNetwork(sponsorId: number) {
  try {
    // In production: SELECT * FROM network WHERE sponsorId = ? ORDER BY level
    return [];
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch sponsor network",
    });
  }
}

// Banner functions
export async function getBanners(
  limit: number,
  offset: number,
  category?: string,
  status?: string
) {
  try {
    // In production: SELECT * FROM banners WHERE (category = ? OR ? IS NULL) AND (status = ? OR ? IS NULL) LIMIT ? OFFSET ?
    return [];
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch banners",
    });
  }
}

export async function getBannerById(bannerId: number) {
  try {
    // In production: SELECT * FROM banners WHERE id = ?
    return null;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch banner",
    });
  }
}

export async function createBanner(userId: number, data: any) {
  try {
    // In production: INSERT INTO banners (title, description, category, imageUrl, downloadUrl, status, createdAt)
    return { success: true, bannerId: Date.now() };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create banner",
    });
  }
}

export async function updateBannerStatus(userId: number, bannerId: number, status: string) {
  try {
    // In production: UPDATE banners SET status = ? WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update banner status",
    });
  }
}

export async function deleteBanner(userId: number, bannerId: number) {
  try {
    // In production: DELETE FROM banners WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete banner",
    });
  }
}

// E-book functions
export async function getEbooks(
  limit: number,
  offset: number,
  category?: string,
  accessLevel?: string
) {
  try {
    // In production: SELECT * FROM ebooks WHERE (category = ? OR ? IS NULL) AND (accessLevel = ? OR ? IS NULL) LIMIT ? OFFSET ?
    return [];
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch ebooks",
    });
  }
}

export async function getEbookById(ebookId: number) {
  try {
    // In production: SELECT * FROM ebooks WHERE id = ?
    return null;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch ebook",
    });
  }
}

export async function createEbook(userId: number, data: any) {
  try {
    // In production: INSERT INTO ebooks (title, author, description, category, accessLevel, fileUrl, pages, createdAt)
    return { success: true, ebookId: Date.now() };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create ebook",
    });
  }
}

export async function recordEbookDownload(userId: number, ebookId: number) {
  try {
    // In production: INSERT INTO ebook_downloads (ebookId, affiliateId, downloadedAt) VALUES (?, ?, NOW())
    // UPDATE ebooks SET downloadCount = downloadCount + 1 WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to record download",
    });
  }
}

export async function deleteEbook(userId: number, ebookId: number) {
  try {
    // In production: DELETE FROM ebooks WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete ebook",
    });
  }
}

// Material functions
export async function getMaterials(
  limit: number,
  offset: number,
  category?: string,
  type?: string,
  status?: string
) {
  try {
    // In production: SELECT * FROM materials WHERE ... LIMIT ? OFFSET ?
    return mockMaterials.slice(offset, offset + limit);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch materials",
    });
  }
}

export async function getMaterialById(materialId: number) {
  try {
    const material = mockMaterials.find((m) => m.id === materialId);
    if (!material) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Material not found",
      });
    }
    return material;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch material",
    });
  }
}

export async function getMaterialsByCategory(category: string) {
  try {
    // In production: SELECT * FROM materials WHERE category = ? AND status = 'active'
    return mockMaterials.filter((m) => m.category === category && m.status === "active");
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch materials by category",
    });
  }
}

export async function createMaterial(userId: number, data: any) {
  try {
    // In production: INSERT INTO materials (title, description, category, type, url, fileKey, status, createdAt)
    return { success: true, materialId: Date.now() };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create material",
    });
  }
}

export async function updateMaterialStatus(userId: number, materialId: number, status: string) {
  try {
    // In production: UPDATE materials SET status = ? WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update material status",
    });
  }
}

export async function recordMaterialDownload(userId: number, materialId: number) {
  try {
    // In production: INSERT INTO material_downloads (materialId, affiliateId, downloadedAt)
    // UPDATE materials SET downloadCount = downloadCount + 1 WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to record download",
    });
  }
}

export async function deleteMaterial(userId: number, materialId: number) {
  try {
    // In production: DELETE FROM materials WHERE id = ?
    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete material",
    });
  }
}

export async function getTopDownloadedMaterials(limit: number) {
  try {
    // In production: SELECT * FROM materials WHERE status = 'active' ORDER BY downloadCount DESC LIMIT ?
    return mockMaterials.slice(0, limit);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch top downloaded materials",
    });
  }
}
