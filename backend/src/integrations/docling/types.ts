/**
 * Docling Integration - Type Definitions
 *
 * Tipos TypeScript para integração com Docling IBM Research
 *
 * @module integrations/docling/types
 */

export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'markdown' | 'txt';

export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface DoclingConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface DocumentInput {
  source: string | Buffer;
  format?: DocumentFormat;
  metadata?: Record<string, any>;
}

export interface ProcessingOptions {
  extractTables?: boolean;
  extractImages?: boolean;
  extractStructure?: boolean;
  ocrEnabled?: boolean;
  languageHint?: string;
}

export interface TableData {
  data: any[][];
  pageNumber: number;
  bbox?: BoundingBox;
}

export interface ImageData {
  base64?: string;
  pageNumber: number;
  bbox?: BoundingBox;
  mimeType: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentStructure {
  headings: Heading[];
  paragraphs: Paragraph[];
  lists: List[];
  pages: PageInfo[];
}

export interface Heading {
  level: number;
  text: string;
  pageNumber: number;
}

export interface Paragraph {
  text: string;
  pageNumber: number;
  bbox?: BoundingBox;
}

export interface List {
  type: 'ordered' | 'unordered';
  items: string[];
  pageNumber: number;
}

export interface PageInfo {
  number: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  pageCount: number;
  language?: string;
  fileSize?: number;
}

export interface DocumentContent {
  text: string;
  tables: TableData[];
  images: ImageData[];
  structure: DocumentStructure;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
}

export interface DocumentResult {
  id: string;
  content: DocumentContent;
  metadata: DocumentMetadata;
  status: ProcessingStatus;
  errors?: ProcessingError[];
  processedAt: Date;
}

export interface BatchResult {
  total: number;
  processed: number;
  failed: number;
  results: DocumentResult[];
}

export interface DoclingServiceInterface {
  processDocument(input: DocumentInput, options?: ProcessingOptions): Promise<DocumentResult>;
  processBatch(inputs: DocumentInput[], options?: ProcessingOptions): Promise<BatchResult>;
  extractTables(input: DocumentInput, options?: TableExtractionOptions): Promise<TableExtractionResult>;
  healthCheck(): Promise<boolean>;
}

export interface TableExtractionOptions {
  minRows?: number;
  maxRows?: number;
  includeHeaders?: boolean;
  format?: 'json' | 'csv' | 'html';
}

export interface TableExtractionResult {
  tables: TableData[];
  totalExtracted: number;
  metadata: {
    sourceFile: string;
    processingTime: number;
  };
}