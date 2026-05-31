/**
 * Unstructured.io Integration Types
 *
 * Tipos TypeScript para integração com Unstructured.io no Nexus Partners Pack.
 * Unstructured.io oferece processamento inteligente de documentos com suporte
 * a mais de 20 formatos diferentes.
 *
 * @module integrations/unstructured/types
 */

/**
 * Formatos de documento suportados pelo Unstructured.io
 */
export type DocumentFormat =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'xlsx'
  | 'xls'
  | 'pptx'
  | 'ppt'
  | 'txt'
  | 'md'
  | 'html'
  | 'eml'
  | 'msg'
  | 'json'
  | 'csv'
  | 'png'
  | 'jpg'
  | 'jpeg';

/**
 * Estratégia de chunking para documentos
 */
export type ChunkingStrategy =
  | 'basic'
  | 'by_title'
  | 'by_author'
  | 'by_speaker'
  | 'character'
  | 'function'
  | 'consecutive';

export interface UnstructuredConfig {
  /** URL base da API Unstructured (default: localhost) */
  baseUrl?: string;
  /** API Key para autenticação */
  apiKey?: string;
  /** Timeout em ms (default: 60000) */
  timeout?: number;
  /** Número máximo de retries (default: 3) */
  maxRetries?: number;
  /** Usar API cloud ou self-hosted */
  useCloud?: boolean;
}

export interface DocumentInput {
  /** Fonte do documento: URL, path ou Buffer */
  source: string | Buffer;
  /** Formato do documento (opcional, auto-detecta) */
  format?: DocumentFormat;
  /** Nome do arquivo (para metadados) */
  filename?: string;
  /** Metadados personalizados */
  metadata?: Record<string, string>;
}

export interface DocumentElement {
  /** Tipo do elemento */
  type: 'Title' | 'NarrativeText' | 'ListItem' | 'Table' | 'Image' | 'Header' | 'Footer' | 'PageBreak' | 'Formula';
  /** Conteúdo text do elemento */
  text: string;
  /** Posição no documento */
  elementId: string;
  /** Página de origem */
  pageNumber?: number;
  /** Coordenadas do elemento */
  coordinates?: {
    coordinates: number[][];
    type: 'point' | 'polygon';
  };
  /** Metadados específicos do tipo */
  metadata?: {
    linkText?: string;
    linkUrls?: string[];
    sentFrom?: string[];
    sentTo?: string[];
    subject?: string;
    emails?: string[];
    phones?: string[];
    parentId?: string;
    tableAsHtml?: string;
  };
}

export interface ProcessedDocument {
  /** ID único do documento processado */
  id: string;
  /** Elementos extraídos */
  elements: DocumentElement[];
  /** Metadados do documento */
  metadata: {
    filename?: string;
    fileType?: string;
    pageCount?: number;
    languages?: string[];
    date?: string;
    routeTo?: string[];
    author?: string;
  };
}

export interface ChunkResult {
  /** Texto do chunk */
  text: string;
  /** Nome do chunk */
  chunkId: string;
  /** Página de origem */
  pageNumber?: number;
  /** Distância do início do documento */
  offset?: number;
}

export interface UnstructuredProcessingOptions {
  /** Habilitar extração de tabelas */
  extractTables?: boolean;
  /** Habilitar extração de imagens */
  extractImages?: boolean;
  /** Habilitar inferência de caracteres */
  ocrEnabled?: boolean;
  /** Idiomas do documento */
  languages?: string[];
  /** Estratégia de chunking */
  chunkingStrategy?: ChunkingStrategy;
  /** Tamanho máximo de chunk */
  chunkMaxCharacters?: number;
  /** Sobreposição entre chunks */
  chunkOverlap?: number;
  /** Output em formato HTML (para tabelas) */
  outputFormat?: 'json' | 'text' | 'html';
}

export interface UnstructuredResult {
  /** ID do documento */
  id: string;
  /** Elementos processados */
  elements: DocumentElement[];
  /** Status do processamento */
  status: 'success' | 'failed' | 'partial';
  /** Timestamp do processamento */
  processedAt: Date;
  /** Erros encontrados (se houver) */
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
}

export interface BatchProcessingResult {
  /** Total de documentos */
  total: number;
  /** Processados com sucesso */
  successful: number;
  /** Falhas */
  failed: number;
  /** Resultados individuais */
  results: UnstructuredResult[];
}

export interface UnstructuredServiceInterface {
  /** Processa um documento */
  processDocument(input: DocumentInput, options?: UnstructuredProcessingOptions): Promise<UnstructuredResult>;
  /** Processa múltiplos documentos */
  processBatch(inputs: DocumentInput[], options?: UnstructuredProcessingOptions): Promise<BatchProcessingResult>;
  /** Chunkifica documento para embeddings */
  chunkDocument(input: DocumentInput, options?: UnstructuredProcessingOptions): Promise<ChunkResult[]>;
  /** Verifica saúde do serviço */
  healthCheck(): Promise<boolean>;
}

export interface PartitionOptions {
  /** Arquivo ou URL para processar */
  file?: string;
  /** Formato do arquivo */
  fileType?: DocumentFormat;
  /** Chunking strategy */
  chunkingStrategy?: ChunkingStrategy;
  /** Idioma(s) do documento */
  languages?: string[];
  /** Inferência OCR */
  ocrLanguages?: string[];
  /** Extrair coordenadas */
  coordinates?: boolean;
  /** Parâmetros HiRes (para PDFs complexos) */
  hiResModelName?: string;
  /** Table extraction */
  extractTableBlock?: boolean;
  /** Encoding */
  encoding?: string;
}

export interface PartitionerResponse {
  elements: DocumentElement[];
  metadata: {
    filename: string;
    fileType: string;
    date: string;
    pageCount: number;
  };
}