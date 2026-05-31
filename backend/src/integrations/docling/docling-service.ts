/**
 * Docling Service Implementation
 *
 * Implementação do serviço de integração com Docling para processamento
 * inteligente de documentos no Nexus Partners Pack.
 *
 * @module integrations/docling/docling-service
 */

import { v4 as uuidv4 } from 'nanoid';
import {
  DoclingConfig,
  DocumentInput,
  DocumentResult,
  DocumentContent,
  DocumentMetadata,
  ProcessingStatus,
  ProcessingOptions,
  TableData,
  ImageData,
  DocumentStructure,
  ProcessingError,
  BatchResult,
  DoclingServiceInterface,
  TableExtractionOptions,
  TableExtractionResult,
  TableExtractionOptions as TableOpts,
} from './types';

export class DoclingService implements DoclingServiceInterface {
  private config: Required<DoclingConfig>;
  private baseUrl: string;

  constructor(config: DoclingConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:8080',
      apiKey: config.apiKey || '',
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3,
    };
    this.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  async processDocument(input: DocumentInput, options?: ProcessingOptions): Promise<DocumentResult> {
    const documentId = uuidv4();
    const startTime = Date.now();

    try {
      const format = input.format || await this.detectFormat(input.source);

      const processingResult = await this.callDoclingAPI(input, format, options);

      return {
        id: documentId,
        content: processingResult.content,
        metadata: {
          ...processingResult.metadata,
          pageCount: processingResult.content.structure.pages.length,
        },
        status: 'success' as ProcessingStatus,
        processedAt: new Date(),
      };
    } catch (error) {
      const errorInfo = this.handleError(error);

      return {
        id: documentId,
        content: {
          text: '',
          tables: [],
          images: [],
          structure: { headings: [], paragraphs: [], lists: [], pages: [] },
        },
        metadata: {
          pageCount: 0,
        },
        status: 'failed' as ProcessingStatus,
        errors: [errorInfo],
        processedAt: new Date(),
      };
    }
  }

  async processBatch(inputs: DocumentInput[], options?: ProcessingOptions): Promise<BatchResult> {
    const results: DocumentResult[] = [];
    let processed = 0;
    let failed = 0;

    for (const input of inputs) {
      const result = await this.processDocument(input, options);
      results.push(result);

      if (result.status === 'success') {
        processed++;
      } else {
        failed++;
      }
    }

    return {
      total: inputs.length,
      processed,
      failed,
      results,
    };
  }

  async extractTables(input: DocumentInput, options?: TableExtractionOptions): Promise<TableExtractionResult> {
    const startTime = Date.now();

    const result = await this.processDocument(input, { extractTables: true });

    let tables = result.content.tables;

    if (options?.minRows) {
      tables = tables.filter(t => t.data.length >= options.minRows!);
    }

    if (options?.maxRows) {
      tables = tables.map(t => ({
        ...t,
        data: t.data.slice(0, options.maxRows!),
      }));
    }

    return {
      tables,
      totalExtracted: tables.length,
      metadata: {
        sourceFile: typeof input.source === 'string' ? input.source : 'buffer',
        processingTime: Date.now() - startTime,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async detectFormat(source: string | Buffer): Promise<string> {
    if (Buffer.isBuffer(source)) {
      return this.detectFormatFromBuffer(source);
    }

    if (typeof source === 'string') {
      return this.detectFormatFromPath(source);
    }

    return 'pdf';
  }

  private detectFormatFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const formatMap: Record<string, string> = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'xlsx': 'xlsx',
      'xls': 'xlsx',
      'pptx': 'pptx',
      'ppt': 'pptx',
      'html': 'html',
      'htm': 'html',
      'md': 'markdown',
      'markdown': 'markdown',
      'txt': 'txt',
    };

    return formatMap[extension] || 'pdf';
  }

  private detectFormatFromBuffer(buffer: Buffer): string {
    const header = buffer.slice(0, 8);

    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      return 'pdf';
    }

    if (header[0] === 0x50 && header[1] === 0x4b) {
      return 'docx';
    }

    return 'txt';
  }

  private async callDoclingAPI(
    input: DocumentInput,
    format: string,
    options?: ProcessingOptions
  ): Promise<{ content: DocumentContent; metadata: Partial<DocumentMetadata> }> {
    const endpoint = `${this.baseUrl}/v1/document`;

    const formData = new FormData();

    if (typeof input.source === 'string') {
      const response = await fetch(input.source);
      const blob = await response.blob();
      formData.append('file', blob, `document.${format}`);
    } else {
      const blob = new Blob([input.source], { type: this.getMimeType(format) });
      formData.append('file', blob, `document.${format}`);
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    try {
      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`Docling API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: this.transformDoclingResponse(data, options),
        metadata: {
          title: data.metadata?.title,
          author: data.metadata?.author,
          pageCount: data.metadata?.pages?.length || 0,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Docling processing timeout');
      }
      throw error;
    }
  }

  private transformDoclingResponse(data: any, options?: ProcessingOptions): DocumentContent {
    const content: DocumentContent = {
      text: '',
      tables: [],
      images: [],
      structure: {
        headings: [],
        paragraphs: [],
        lists: [],
        pages: [],
      },
    };

    if (data.text || data.content) {
      content.text = data.text || data.content;
    }

    if (options?.extractTables !== false && data.tables) {
      content.tables = data.tables.map((t: any, index: number): TableData => ({
        data: t.rows || t.data || [],
        pageNumber: t.page || t.pageNumber || 1,
        bbox: t.bbox,
      }));
    }

    if (options?.extractImages !== false && data.images) {
      content.images = data.images.map((img: any): ImageData => ({
        base64: img.base64 || img.data,
        pageNumber: img.page || img.pageNumber || 1,
        bbox: img.bbox,
        mimeType: img.mimeType || 'image/png',
      }));
    }

    if (options?.extractStructure !== false && data.structure) {
      content.structure = {
        headings: data.structure.headings || [],
        paragraphs: data.structure.paragraphs || [],
        lists: data.structure.lists || [],
        pages: data.structure.pages || [],
      };
    }

    content.structure.pages = data.metadata?.pages?.map((p: any, i: number) => ({
      number: i + 1,
      width: p.width || 0,
      height: p.height || 0,
      rotation: p.rotation,
    })) || [];

    return content;
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      html: 'text/html',
      markdown: 'text/markdown',
      txt: 'text/plain',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private handleError(error: any): ProcessingError {
    if (error instanceof Error) {
      return {
        code: error.name || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.stack,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Erro desconhecido durante processamento',
      details: error,
    };
  }
}

export async function createDoclingService(config?: DoclingConfig): Promise<DoclingService> {
  const service = new DoclingService(config);

  const isHealthy = await service.healthCheck();
  if (!isHealthy && !config?.baseUrl) {
    console.warn('[DoclingService] Docling service não está disponível. Processamento retornará dados mock.');
  }

  return service;
}

export default DoclingService;