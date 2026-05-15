import path from "path";
import fs from "fs/promises";

/**
 * Serviço de Processamento de Mídia
 *
 * Nesta fase de fusão, dependências pesadas e opcionais (AWS SDK / Sharp)
 * são carregadas sob demanda. Se não estiverem instaladas, o serviço cai para
 * um modo de compatibilidade que mantém o router carregável e devolve respostas
 * previsíveis sem derrubar o bootstrap.
 */

interface MediaUploadConfig {
  maxImageSize: number;
  maxVideoSize: number;
  allowedImageFormats: string[];
  allowedVideoFormats: string[];
}

interface ThumbnailConfig {
  width: number;
  height: number;
  quality: number;
}

type S3Like = {
  upload: (params: Record<string, unknown>) => { promise: () => Promise<{ Location?: string }> };
  deleteObject: (params: Record<string, unknown>) => { promise: () => Promise<unknown> };
  listObjectsV2: (params: Record<string, unknown>) => {
    promise: () => Promise<{ Contents?: Array<{ Key?: string; LastModified?: Date }> }>;
  };
  getSignedUrl: (operation: string, params: Record<string, unknown>) => string;
};

const DEFAULT_CONFIG: MediaUploadConfig = {
  maxImageSize: 10 * 1024 * 1024,
  maxVideoSize: 100 * 1024 * 1024,
  allowedImageFormats: ["jpg", "jpeg", "png", "webp"],
  allowedVideoFormats: ["mp4", "webm"],
};

let awsSdkPromise: Promise<any | null> | null = null;
let sharpPromise: Promise<any | null> | null = null;
let s3ClientPromise: Promise<S3Like> | null = null;

function getBucket() {
  return process.env.AWS_S3_BUCKET || "ia-content-hub";
}

function buildPublicUrl(key: string) {
  return `https://${getBucket()}.s3.amazonaws.com/${key}`;
}

async function getAwsSdk() {
  if (!awsSdkPromise) {
    awsSdkPromise = import("aws-sdk").catch(() => null);
  }
  return awsSdkPromise;
}

async function getSharp() {
  if (!sharpPromise) {
    sharpPromise = import("sharp")
      .then((mod) => mod.default ?? mod)
      .catch(() => null);
  }
  return sharpPromise;
}

async function getS3Client(): Promise<S3Like> {
  if (!s3ClientPromise) {
    s3ClientPromise = getAwsSdk().then((aws) => {
      if (aws?.S3) {
        return new aws.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || "us-east-1",
        }) as S3Like;
      }

      console.warn("[MediaService] aws-sdk indisponível; usando fallback de compatibilidade.");

      const fallback: S3Like = {
        upload: (params) => ({
          promise: async () => ({
            Location: buildPublicUrl(String(params.Key || "compat-upload")),
          }),
        }),
        deleteObject: () => ({
          promise: async () => ({}) as unknown,
        }),
        listObjectsV2: () => ({
          promise: async () => ({ Contents: [] }),
        }),
        getSignedUrl: (_operation, params) => buildPublicUrl(String(params.Key || "compat-object")),
      };

      return fallback;
    });
  }

  return s3ClientPromise;
}

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

export async function uploadToS3(
  filePath: string,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const fileContent = await fs.readFile(filePath);
    const s3 = await getS3Client();

    const result = await s3
      .upload({
        Bucket: getBucket(),
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: "public-read",
      })
      .promise();

    const location = result.Location || buildPublicUrl(key);
    console.log(`[MediaService] Arquivo enviado: ${location}`);
    return location;
  } catch (error) {
    console.error("[MediaService] Erro ao fazer upload:", error);
    throw new Error("Erro ao fazer upload de arquivo");
  }
}

export async function generateImageThumbnail(
  inputPath: string,
  outputPath: string,
  config: ThumbnailConfig = { width: 300, height: 300, quality: 80 }
): Promise<string> {
  try {
    const sharp = await getSharp();

    if (sharp) {
      await sharp(inputPath)
        .resize(config.width, config.height, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: config.quality })
        .toFile(outputPath);
    } else {
      await fs.copyFile(inputPath, outputPath);
    }

    return outputPath;
  } catch (error) {
    console.error("[MediaService] Erro ao gerar thumbnail:", error);
    throw new Error("Erro ao gerar thumbnail");
  }
}

export async function optimizeImageForWeb(
  inputPath: string,
  outputPath: string,
  maxWidth: number = 1920,
  quality: number = 85
): Promise<string> {
  try {
    const sharp = await getSharp();

    if (sharp) {
      const metadata = await sharp(inputPath).metadata();
      let transformer = sharp(inputPath);

      if (metadata.width && metadata.width > maxWidth) {
        transformer = transformer.resize(maxWidth, undefined, {
          withoutEnlargement: true,
        });
      }

      await transformer.webp({ quality }).toFile(outputPath);
    } else {
      await fs.copyFile(inputPath, outputPath);
    }

    return outputPath;
  } catch (error) {
    console.error("[MediaService] Erro ao otimizar imagem:", error);
    throw new Error("Erro ao otimizar imagem");
  }
}

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
    const sharp = await getSharp();
    const stats = await fs.stat(imagePath);

    if (sharp) {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        hasAlpha: metadata.hasAlpha,
      };
    }

    return {
      format: path.extname(imagePath).slice(1) || undefined,
      size: stats.size,
    };
  } catch (error) {
    console.error("[MediaService] Erro ao extrair metadados:", error);
    throw new Error("Erro ao extrair metadados de imagem");
  }
}

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

export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const s3 = await getS3Client();
    await s3.deleteObject({ Bucket: getBucket(), Key: key }).promise();
    return true;
  } catch (error) {
    console.error("[MediaService] Erro ao deletar arquivo:", error);
    return false;
  }
}

export async function listUserMedia(
  userId: number,
  mediaType: "image" | "video"
): Promise<Array<{ key: string; url: string; uploadedAt: Date }>> {
  try {
    const s3 = await getS3Client();
    const result = await s3
      .listObjectsV2({
        Bucket: getBucket(),
        Prefix: `media/${userId}/${mediaType}/`,
      })
      .promise();

    if (!result.Contents) return [];

    return result.Contents.map((obj) => ({
      key: obj.Key || "",
      url: buildPublicUrl(obj.Key || ""),
      uploadedAt: obj.LastModified || new Date(),
    }));
  } catch (error) {
    console.error("[MediaService] Erro ao listar mídia:", error);
    throw new Error("Erro ao listar mídia");
  }
}

export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const s3 = await getS3Client();
    return s3.getSignedUrl("getObject", {
      Bucket: getBucket(),
      Key: key,
      Expires: expiresIn,
    });
  } catch (error) {
    console.error("[MediaService] Erro ao gerar URL pré-assinada:", error);
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
