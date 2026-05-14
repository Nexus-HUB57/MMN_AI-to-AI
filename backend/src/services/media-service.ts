import AWS from "aws-sdk";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

/**
 * Serviço de Processamento de Mídia
 * Suporta upload, processamento e armazenamento de imagens e vídeos em S3
 */

interface MediaUploadConfig {
  maxImageSize: number; // bytes
  maxVideoSize: number; // bytes
  allowedImageFormats: string[];
  allowedVideoFormats: string[];
}

interface ThumbnailConfig {
  width: number;
  height: number;
  quality: number;
}

interface VideoPreviewConfig {
  timestamp: number; // segundos
  width: number;
  height: number;
}

// Configuração padrão
const DEFAULT_CONFIG: MediaUploadConfig = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  allowedImageFormats: ["jpg", "jpeg", "png", "webp"],
  allowedVideoFormats: ["mp4", "webm"],
};

// Inicializar cliente S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

/**
 * Validar arquivo de mídia
 */
export async function validateMediaFile(
  filePath: string,
  fileSize: number,
  isImage: boolean = true
): Promise<{ valid: boolean; error?: string }> {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const config = DEFAULT_CONFIG;

  if (isImage) {
    if (!config.allowedImageFormats.includes(ext)) {
      return {
        valid: false,
        error: `Formato de imagem não suportado. Formatos aceitos: ${config.allowedImageFormats.join(", ")}`,
      };
    }
    if (fileSize > config.maxImageSize) {
      return {
        valid: false,
        error: `Tamanho de imagem excede o limite de ${config.maxImageSize / 1024 / 1024}MB`,
      };
    }
  } else {
    if (!config.allowedVideoFormats.includes(ext)) {
      return {
        valid: false,
        error: `Formato de vídeo não suportado. Formatos aceitos: ${config.allowedVideoFormats.join(", ")}`,
      };
    }
    if (fileSize > config.maxVideoSize) {
      return {
        valid: false,
        error: `Tamanho de vídeo excede o limite de ${config.maxVideoSize / 1024 / 1024}MB`,
      };
    }
  }

  return { valid: true };
}

/**
 * Fazer upload de arquivo para S3
 */
export async function uploadToS3(
  filePath: string,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const fileContent = await fs.readFile(filePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "ia-content-hub",
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ACL: "public-read",
    };

    const result = await s3.upload(params).promise();
    console.log(`[MediaService] Arquivo enviado para S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error(`[MediaService] Erro ao fazer upload para S3:`, error);
    throw new Error("Erro ao fazer upload de arquivo");
  }
}

/**
 * Gerar thumbnail de imagem
 */
export async function generateImageThumbnail(
  inputPath: string,
  outputPath: string,
  config: ThumbnailConfig = { width: 300, height: 300, quality: 80 }
): Promise<string> {
  try {
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: config.quality })
      .toFile(outputPath);

    console.log(`[MediaService] Thumbnail gerado: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`[MediaService] Erro ao gerar thumbnail:`, error);
    throw new Error("Erro ao gerar thumbnail");
  }
}

/**
 * Otimizar imagem para web
 */
export async function optimizeImageForWeb(
  inputPath: string,
  outputPath: string,
  maxWidth: number = 1920,
  quality: number = 85
): Promise<string> {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    let transformer = sharp(inputPath);

    // Redimensionar se necessário
    if (metadata.width && metadata.width > maxWidth) {
      transformer = transformer.resize(maxWidth, undefined, {
        withoutEnlargement: true,
      });
    }

    // Converter para WebP (mais eficiente)
    await transformer
      .webp({ quality })
      .toFile(outputPath);

    console.log(`[MediaService] Imagem otimizada: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`[MediaService] Erro ao otimizar imagem:`, error);
    throw new Error("Erro ao otimizar imagem");
  }
}

/**
 * Extrair metadados de imagem
 */
export async function getImageMetadata(
  imagePath: string
): Promise<{
  width?: number;
  height?: number;
  format?: string;
  size: number;
  hasAlpha?: boolean;
}> {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      hasAlpha: metadata.hasAlpha,
    };
  } catch (error) {
    console.error(`[MediaService] Erro ao extrair metadados:`, error);
    throw new Error("Erro ao extrair metadados de imagem");
  }
}

/**
 * Gerar chave S3 única para arquivo
 */
export function generateS3Key(
  userId: number,
  mediaType: "image" | "video",
  fileName: string
): string {
  const timestamp = Date.now();
  const ext = path.extname(fileName);
  const cleanName = path.basename(fileName, ext).replace(/[^a-z0-9]/gi, "_");
  
  return `media/${userId}/${mediaType}/${timestamp}_${cleanName}${ext}`;
}

/**
 * Deletar arquivo do S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "ia-content-hub",
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log(`[MediaService] Arquivo deletado do S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`[MediaService] Erro ao deletar arquivo do S3:`, error);
    return false;
  }
}

/**
 * Listar arquivos de mídia do usuário
 */
export async function listUserMedia(
  userId: number,
  mediaType: "image" | "video"
): Promise<Array<{ key: string; url: string; uploadedAt: Date }>> {
  try {
    const prefix = `media/${userId}/${mediaType}/`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "ia-content-hub",
      Prefix: prefix,
    };

    const result = await s3.listObjectsV2(params).promise();
    
    if (!result.Contents) return [];

    return result.Contents.map((obj) => ({
      key: obj.Key || "",
      url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${obj.Key}`,
      uploadedAt: obj.LastModified || new Date(),
    }));
  } catch (error) {
    console.error(`[MediaService] Erro ao listar mídia do usuário:`, error);
    throw new Error("Erro ao listar mídia");
  }
}

/**
 * Gerar URL pré-assinada para acesso temporário
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "ia-content-hub",
      Key: key,
      Expires: expiresIn,
    };

    const url = s3.getSignedUrl("getObject", params);
    console.log(`[MediaService] URL pré-assinada gerada: ${key}`);
    return url;
  } catch (error) {
    console.error(`[MediaService] Erro ao gerar URL pré-assinada:`, error);
    throw new Error("Erro ao gerar URL pré-assinada");
  }
}

export default {
  validateMediaFile,
  uploadToS3,
  generateImageThumbnail,
  optimizeImageForWeb,
  getImageMetadata,
  generateS3Key,
  deleteFromS3,
  listUserMedia,
  generatePresignedUrl,
};
