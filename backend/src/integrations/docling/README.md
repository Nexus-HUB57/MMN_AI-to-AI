# Módulo de Integração Docling

Este módulo implementa a integração com Docling para processamento inteligente de documentos no Nexus Partners Pack.

## Visão Geral

O Docling é uma biblioteca de processamento de documentos desenvolvida pela IBM Research que oferece parsing de alta qualidade para uma variedade de formatos de documentos, incluindo PDFs, documentos Microsoft Office, e outros formatos comuns em contextos empresariais.

## Arquitetura

A integração Docling no Nexus Partners Pack segue a arquitetura de worker assíncrono, permitindo processamento de documentos sem bloquear a thread principal da aplicação.

### Estrutura de Diretórios

```
docling/
├── index.ts              # Exportações do módulo
├── types.ts              # Definições de tipos TypeScript
├── docling-service.ts    # Serviço principal de processamento
└── README.md             # Este arquivo
```

## Tipos Principais

### DoclingConfig

```typescript
interface DoclingConfig {
  baseUrl?: string;           // URL base do serviço Docling (default: local)
  apiKey?: string;            // Chave API para serviços cloud
  timeout?: number;           // Timeout em milissegundos (default: 60000)
  maxRetries?: number;        // Número máximo de tentativas (default: 3)
}
```

### DocumentInput

```typescript
interface DocumentInput {
  source: string | Buffer;     // Path do arquivo ou buffer
  format: DocumentFormat;      // Formato do documento
  metadata?: Record<string, any>; // Metadados opcionais
}

type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'markdown';
```

### DocumentResult

```typescript
interface DocumentResult {
  id: string;                  // ID único do documento processado
  content: DocumentContent;    // Conteúdo extraído
  metadata: DocumentMetadata; // Metadados do documento
  status: ProcessingStatus;   // Status do processamento
  errors?: ProcessingError[];  // Erros encontrados (se houver)
}

interface DocumentContent {
  text: string;                // Texto extraído
  tables: TableData[];         // Tabelas extraídas
  images: ImageData[];         // Imagens extraídas
  structure: DocumentStructure; // Estrutura do documento
}

interface DocumentMetadata {
  title?: string;              // Título do documento
  author?: string;             // Autor
  createdAt?: Date;            // Data de criação
  pageCount: number;           // Número de páginas
  language?: string;           // Idioma principal detectado
}
```

## Uso

### Processamento Básico

```typescript
import { DoclingService } from './docling-service';
import { createDoclingService } from './index';

// Criar instância do serviço
const docling = await createDoclingService({
  baseUrl: process.env.DOCLING_API_URL,
  timeout: 120000,
});

// Processar um documento PDF
const result = await docling.processDocument({
  source: '/path/to/document.pdf',
  format: 'pdf',
  metadata: { category: 'contract' }
});

if (result.status === 'success') {
  console.log('Texto extraído:', result.content.text);
  console.log('Tabelas:', result.content.tables.length);
}
```

### Processamento em Batch

```typescript
const documents: DocumentInput[] = [
  { source: '/docs/report.pdf', format: 'pdf' },
  { source: '/docs/invoice.docx', format: 'docx' },
  { source: '/docs/data.xlsx', format: 'xlsx' },
];

const results = await docling.processBatch(documents);
console.log(`Processados ${results.success.length}/${documents.length} documentos`);
```

### Extração de Tabelas

```typescript
const tableResult = await docling.extractTables({
  source: '/path/to/spreadsheet.xlsx',
  format: 'xlsx',
  options: {
    minRows: 2,
    includeHeaders: true,
    format: 'json', // ou 'csv'
  }
});

tableResult.tables.forEach((table, index) => {
  console.log(`Tabela ${index + 1}:`);
  console.table(table.data);
});
```

## Integração com BullMQ

Para processamento assíncrono, utilize o worker BullMQ:

```typescript
import { Queue, Worker } from 'bullmq';
import { DoclingService } from './docling-service';

const doclingQueue = new Queue('docling-processing', {
  connection: redisConnection,
});

const doclingWorker = new Worker(
  'docling-processing',
  async (job) => {
    const docling = await createDoclingService();
    const result = await docling.processDocument(job.data);
    return result;
  },
  { connection: redisConnection }
);

// Adicionar job à fila
await doclingQueue.add('process-document', {
  filePath: '/tmp/uploaded-document.pdf',
  userId: 'user-123',
  category: 'contract',
});
```

## API Endpoints

### POST /api/docling/process

Processa um documento enviado via multipart form data.

**Request**:
- `file`: Arquivo (multipart)
- `format`: Formato do documento (opcional, detectado automaticamente)
- `options`: Opções de processamento (JSON stringificado)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "content": { ... },
    "metadata": { ... }
  }
}
```

### POST /api/docling/batch

Processa múltiplos documentos em batch.

**Request**:
```json
{
  "documents": [
    { "source": "url-ou-base64", "format": "pdf" },
    { "source": "url-ou-base64", "format": "docx" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 2,
    "processed": 2,
    "results": [ ... ]
  }
}
```

## Configuração de Ambiente

```env
# Docling Service Configuration
DOCLING_API_URL=http://localhost:8080
DOCLING_API_KEY=your-api-key
DOCLING_TIMEOUT=60000
DOCLING_MAX_RETRIES=3

# Redis for BullMQ (se usar processamento assíncrono)
REDIS_URL=redis://localhost:6379
```

## Limitações e Considerações

### Limitações Atuais

1. **Suporte a Imagens**: A extração de imagens requer processamento adicional
2. **Documentos Escaneados**: Necessita OCR habilitado para documentos sem texto selecionável
3. **Performance**: Documentos grandes podem requerer timeout estendido

### Boas Práticas

1. **Validação de Input**: Sempre valide formato e tamanho do arquivo antes de enviar
2. **Timeout Adequado**: Configure timeouts baseados no tamanho esperado dos documentos
3. **Retry Logic**: Implemente retry com backoff exponencial para falhas transitórias
4. **Cache de Resultados**: Considere caching para documentos processados anteriormente

## Roadmap de Funcionalidades

- [ ] Suporte a OCR para documentos escaneados
- [ ] Extração de gráficos e visualizações
- [ ] Detecção de idioma automática
- [ ] Suporte a documentos protegidos por senha
- [ ] Integração com vector stores para RAG

## Referências

- [Docling GitHub](https://github.com/DS4SD/docling)
- [IBM Research Docling](https://research.ibm.com/projects/docling)
- [Documentação da API](https://docling-project.github.io/docling/)

---

**Autor**: MiniMax Agent
**Data**: 2026-06-01
**Versão**: 1.0.0