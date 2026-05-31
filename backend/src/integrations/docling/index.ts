/**
 * Nexus Partners Pack - Docling Integration Module
 *
 * Módulo de integração Docling para processamento inteligente de documentos.
 * Fornece capacidades de parsing de alta qualidade para PDFs, documentos Office
 * e outros formatos comuns em contextos empresariais.
 *
 * @module integrations/docling
 * @author MiniMax Agent
 * @date 2026-06-01
 */

export * from './types';
export * from './docling-service';
export { DoclingService, createDoclingService } from './docling-service';