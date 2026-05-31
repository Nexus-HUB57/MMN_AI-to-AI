/**
 * Unstructured.io Integration Module
 *
 * Exportação pública do módulo de integração com Unstructured.io
 * para processamento inteligente de documentos no Nexus Partners Pack.
 *
 * @module integrations/unstructured
 */

export { UnstructuredService, createUnstructuredService } from './unstructured-service';
export type {
  UnstructuredConfig,
  UnstructuredServiceInterface,
  DocumentInput,
  DocumentElement,
  UnstructuredResult,
  UnstructuredProcessingOptions,
  ChunkResult,
  BatchProcessingResult,
  DocumentFormat,
  ChunkingStrategy,
  PartitionOptions,
  PartitionerResponse,
} from './types';

import { UnstructuredService, createUnstructuredService } from './unstructured-service';

export const unstructured = {
  /**
   * Cria uma instância do serviço Unstructured.io
   */
  create: createUnstructuredService,

  /**
   * Serviço padrão (local)
   */
  default: new UnstructuredService(),

  /**
   * Supported document formats
   */
  supportedFormats: [
    'pdf',
    'docx',
    'doc',
    'xlsx',
    'xls',
    'pptx',
    'ppt',
    'txt',
    'md',
    'html',
    'eml',
    'msg',
    'json',
    'csv',
    'png',
    'jpg',
    'jpeg',
  ] as const,
};

export default UnstructuredService;