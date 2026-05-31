/**
 * Unstructured.io Service Implementation
 *
 * Implementação do serviço de integração com Unstructured.io para
 * processamento inteligente de documentos no Nexus Partners Pack.
 *
 * Unstructured.io suporta mais de 20 tipos de documentos incluindo:
 * PDFs, documentos Office, emails, páginas web, imagens com OCR, etc.
 *
 * @module integrations/unstructured/unstructured-service
 */

import { v4 as uuidv4 } from 'nanoid';
import {
  UnstructuredConfig,
  UnstructuredProcessingOptions,
  DocumentInput,
  UnstructuredResult,
  DocumentElement,
  ChunkResult,
  BatchProcessingResult,
  PartitionOptions,
  UnstructuredServiceInterface,
} from './types';

export class UnstructuredService implements UnstructuredServiceInterface {
  private config: Required<UnstructuredConfig>;
  private baseUrl: string;

  constructor(config: UnstructuredConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:8000',
      apiKey: config.apiKey || '',
      timeout: config.timeout || 120000,
      maxRetries: config.maxRetries || 3,
      useCloud: config.useCloud || false,
    };
    this.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  /**
   * Processa um documento com Unstructured.io
   */
  async processDocument(
    input: DocumentInput,
    options?: UnstructuredProcessingOptions
  ): Promise<UnstructuredResult> {
    const documentId = uuidv4();
    const startTime = Date.now();

    try {
      const format = input.format || await this.detectFormat(input.source);

      if (this.config.useCloud) {
        return await this.processViaCloudAPI(input, options, documentId);
      }

      return await this.processViaLocalAPI(input, options, documentId, format);
    } catch (error) {
      return this.handleError(error, documentId);
    }
  }

  /**
   * Processa múltiplos documentos em batch
   */
  async processBatch(
    inputs: DocumentInput[],
    options?: UnstructuredProcessingOptions
  ): Promise<BatchProcessingResult> {
    const results: UnstructuredResult[] = [];
    let successful = 0;
    let failed = 0;

    const processPromises = inputs.map(async (input) => {
      const result = await this.processDocument(input, options);
      results.push(result);

      if (result.status === 'success') {
        successful++;
      } else {
        failed++;
      }

      return result;
    });

    await Promise.all(processPromises);

    return {
      total: inputs.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Chunkifica documento para uso com embeddings/RAG
   */
  async chunkDocument(
    input: DocumentInput,
    options?: UnstructuredProcessingOptions
  ): Promise<ChunkResult[]> {
    const result = await this.processDocument(input, {
      ...options,
      chunkingStrategy: options?.chunkingStrategy || 'by_title',
      chunkMaxCharacters: options?.chunkMaxCharacters || 512,
      chunkOverlap: options?.chunkOverlap || 50,
    });

    if (result.status !== 'success' || !result.elements) {
      return [];
    }

    return this.createChunks(result.elements, options);
  }

  /**
   * Verifica disponibilidade do serviço
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async processViaLocalAPI(
    input: DocumentInput,
    options: UnstructuredProcessingOptions | undefined,
    documentId: string,
    format: string
  ): Promise<UnstructuredResult> {
    const endpoint = `${this.baseUrl}/general/v0/general`;

    const formData = new FormData();

    if (typeof input.source === 'string') {
      if (input.source.startsWith('http')) {
        formData.append('url', input.source);
      } else {
        const response = await fetch(`file://${input.source}`);
        const blob = await response.blob();
        formData.append('files', blob, input.filename || `document.${format}`);
      }
    } else {
      const blob = new Blob([input.source], { type: this.getMimeType(format) });
      formData.append('files', blob, input.filename || `document.${format}`);
    }

    const partitionOptions = this.buildPartitionOptions(options);
    Object.entries(partitionOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await this.executeWithRetry(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Unstructured API error: ${response.status} ${response.statusText}`);
    }

    const elements: DocumentElement[] = await response.json();

    return {
      id: documentId,
      elements: elements.map(this.transformElement),
      status: 'success',
      processedAt: new Date(),
    };
  }

  private async processViaCloudAPI(
    input: DocumentInput,
    options: UnstructuredProcessingOptions | undefined,
    documentId: string
  ): Promise<UnstructuredResult> {
    const endpoint = 'https://api.unstructured.io/general/v0/general';

    const formData = new FormData();

    if (typeof input.source === 'string') {
      if (input.source.startsWith('http')) {
        formData.append('url', input.source);
      } else {
        const response = await fetch(`file://${input.source}`);
        const blob = await response.blob();
        formData.append('files', blob, input.filename || 'document');
      }
    } else {
      const blob = new Blob([input.source]);
      formData.append('files', blob, input.filename || 'document');
    }

    const partitionOptions = this.buildPartitionOptions(options);
    Object.entries(partitionOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await this.executeWithRetry(endpoint, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Unstructured Cloud API error: ${response.status} ${response.statusText}`);
    }

    const elements: DocumentElement[] = await response.json();

    return {
      id: documentId,
      elements: elements.map(this.transformElement),
      status: 'success',
      processedAt: new Date(),
    };
  }

  private buildPartitionOptions(options?: UnstructuredProcessingOptions): Record<string, any> {
    const params: Record<string, any> = {};

    if (options?.languages && options.languages.length > 0) {
      params.languages = options.languages.join(',');
    }

    if (options?.chunkingStrategy) {
      params.chunking_strategy = options.chunkingStrategy;
    }

    if (options?.chunkMaxCharacters) {
      params.chunk_max_characters = options.chunkMaxCharacters;
    }

    if (options?.chunkOverlap) {
      params.chunk_overlap = options.chunkOverlap;
    }

    if (options?.extractTables !== false) {
      params.extract_tables = true;
    }

    if (options?.extractImages) {
      params.extract_image_block_types = ['Image', 'Table'];
    }

    if (options?.ocrEnabled) {
      params.ocr_languages = options.languages?.join(',') || 'eng';
    }

    params.coordinates = options?.outputFormat === 'html' ? true : false;

    return params;
  }

  private transformElement(element: any): DocumentElement {
    return {
      type: element.type || 'NarrativeText',
      text: element.text || '',
      elementId: element.element_id || uuidv4(),
      pageNumber: element.metadata?.page_number || element.page_number,
      coordinates: element.metadata?.coordinates,
      metadata: {
        linkText: element.metadata?.link_text,
        linkUrls: element.metadata?.link_urls,
        sentFrom: element.metadata?.sent_from,
        sentTo: element.metadata?.sent_to,
        subject: element.metadata?.subject,
        emails: element.metadata?.emails,
        phones: element.metadata?.phones,
        parentId: element.metadata?.parent_id,
        tableAsHtml: element.metadata?.text_as_html,
      },
    };
  }

  private createChunks(elements: DocumentElement[], options?: UnstructuredProcessingOptions): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    const maxChars = options?.chunkMaxCharacters || 512;
    const overlap = options?.chunkOverlap || 50;

    let currentChunk = '';
    let currentChunkId = uuidv4();

    for (const element of elements) {
      const text = element.text + '\n\n';

      if (currentChunk.length + text.length <= maxChars) {
        currentChunk += text;
      } else {
        if (currentChunk.trim()) {
          chunks.push({
            text: currentChunk.trim(),
            chunkId: currentChunkId,
            pageNumber: element.pageNumber,
          });
        }

        currentChunk = currentChunk.slice(-overlap) + text;
        currentChunkId = uuidv4();
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        chunkId: currentChunkId,
        pageNumber: elements[elements.length - 1]?.pageNumber,
      });
    }

    return chunks;
  }

  private async executeWithRetry(endpoint: string, options: RequestInit, attempt = 0): Promise<Response> {
    try {
      const response = await fetch(endpoint, options);

      if (!response.ok && attempt < this.config.maxRetries) {
        await this.delay(Math.pow(2, attempt) * 1000);
        return this.executeWithRetry(endpoint, options, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        await this.delay(Math.pow(2, attempt) * 1000);
        return this.executeWithRetry(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      pdf: 'pdf',
      docx: 'docx',
      doc: 'doc',
      xlsx: 'xlsx',
      xls: 'xls',
      pptx: 'pptx',
      ppt: 'ppt',
      html: 'html',
      htm: 'html',
      md: 'markdown',
      txt: 'text',
      eml: 'eml',
      msg: 'msg',
      json: 'json',
      csv: 'csv',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
    };

    return formatMap[extension] || 'unknown';
  }

  private detectFormatFromBuffer(buffer: Buffer): string {
    const header = buffer.slice(0, 8);

    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      return 'pdf';
    }

    if (header[0] === 0x50 && header[1] === 0x4b) {
      return 'zip';
    }

    return 'unknown';
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      html: 'text/html',
      txt: 'text/plain',
      json: 'application/json',
      csv: 'text/csv',
      image: 'image/png',
    };

    return mimeTypes[format] || 'application/octet-stream';
  }

  private getHeaders(cloud = false): HeadersInit {
    const headers: Record<string, string> = {};

    if (cloud && this.config.apiKey) {
      headers['UNSTRUCTURED-API-KEY'] = this.config.apiKey;
    } else if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private handleError(error: any, documentId: string): UnstructuredResult {
    if (error instanceof Error) {
      return {
        id: documentId,
        elements: [],
        status: 'failed',
        processedAt: new Date(),
        errors: [{
          code: error.name || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.stack,
        }],
      };
    }

    return {
      id: documentId,
      elements: [],
      status: 'failed',
      processedAt: new Date(),
      errors: [{
        code: 'UNKNOWN_ERROR',
        message: 'Erro desconhecido durante processamento',
        details: JSON.stringify(error),
      }],
    };
  }
}

export async function createUnstructuredService(config?: UnstructuredConfig): Promise<UnstructuredService> {
  const service = new UnstructuredService(config);

  const isHealthy = await service.healthCheck();
  if (!isHealthy && !config?.useCloud) {
    console.warn('[UnstructuredService] Unstructured local não disponível. Use useCloud=true para API cloud.');
  }

  return service;
}

export default UnstructuredService;