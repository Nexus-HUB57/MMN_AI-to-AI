# Unstructured.io Integration

## Overview

This module provides integration with [Unstructured.io](https://unstructured.io) for intelligent document processing in the Nexus Partners Pack.

## Features

- **Multi-format Support**: Processes 20+ document types including PDF, DOCX, XLSX, PPTX, HTML, and more
- **OCR Capability**: Extract text from images and scanned documents
- **Table Extraction**: Structured table data extraction with HTML output
- **Intelligent Chunking**: Multiple strategies for RAG and embedding workflows
- **Flexible Deployment**: Local self-hosted or cloud API options

## Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| PDF | .pdf | Portable Document Format |
| Word | .docx, .doc | Microsoft Word documents |
| Excel | .xlsx, .xls | Microsoft Excel spreadsheets |
| PowerPoint | .pptx, .ppt | Microsoft PowerPoint presentations |
| Text | .txt | Plain text files |
| Markdown | .md | Markdown documents |
| HTML | .html, .htm | HTML web pages |
| Email | .eml, .msg | Email messages |
| CSV | .csv | Comma-separated values |
| JSON | .json | JavaScript Object Notation |
| Images | .png, .jpg, .jpeg | Images with OCR support |

## Installation

### Local Deployment (Recommended for Production)

```bash
# Using Docker
docker run -p 8000:8000 \
  -e UNSTRUCTURED_API_KEY="your-api-key" \
  ghcr.io/unstructured-io/unstructured-api:latest
```

### Cloud API

Set `useCloud: true` in configuration and provide your API key.

## Usage

### Basic Document Processing

```typescript
import { createUnstructuredService } from './integrations/unstructured';

const service = await createUnstructuredService({
  baseUrl: 'http://localhost:8000',
  apiKey: process.env.UNSTRUCTURED_API_KEY,
});

// Process a document from URL
const result = await service.processDocument({
  source: 'https://example.com/document.pdf',
  filename: 'document.pdf',
});

console.log(`Processed ${result.elements.length} elements`);
```

### Batch Processing

```typescript
const batchResult = await service.processBatch([
  { source: 'document1.pdf', filename: 'doc1.pdf' },
  { source: 'document2.docx', filename: 'doc2.docx' },
  { source: 'https://example.com/report.xlsx' },
]);

console.log(`Success: ${batchResult.successful}, Failed: ${batchResult.failed}`);
```

### RAG Chunking

```typescript
const chunks = await service.chunkDocument(
  { source: 'path/to/document.pdf' },
  {
    chunkingStrategy: 'by_title',
    chunkMaxCharacters: 512,
    chunkOverlap: 50,
  }
);

for (const chunk of chunks) {
  // Generate embeddings for each chunk
  await embedDocument(chunk.text);
}
```

### OCR for Images

```typescript
const result = await service.processDocument(
  { source: 'image-with-text.png' },
  {
    ocrEnabled: true,
    languages: ['eng', 'por'],
    extractImages: true,
  }
);
```

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseUrl` | string | `http://localhost:8000` | Unstructured API URL |
| `apiKey` | string | `''` | API key for authentication |
| `timeout` | number | `120000` | Request timeout in ms |
| `maxRetries` | number | `3` | Maximum retry attempts |
| `useCloud` | boolean | `false` | Use cloud API vs local |

## Processing Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `extractTables` | boolean | `true` | Extract table structures |
| `extractImages` | boolean | `false` | Extract image blocks |
| `ocrEnabled` | boolean | `false` | Enable OCR for images |
| `languages` | string[] | `['eng']` | Document languages |
| `chunkingStrategy` | string | `'by_title'` | Text chunking approach |
| `chunkMaxCharacters` | number | `512` | Max chars per chunk |
| `chunkOverlap` | number | `50` | Overlap between chunks |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nexus Partners Pack                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   tRPC API  │───▶│ Unstructured.io  │───▶│  BullMQ       │  │
│  │   Router    │    │   Integration    │    │  Worker       │  │
│  └─────────────┘    └──────────────────┘    └───────────────┘  │
│                           │                                       │
│         ┌────────────────┼────────────────┐                   │
│         ▼                ▼                ▼                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Chunking  │  │  Table      │  │   OCR       │             │
│  │   Strategy  │  │  Extraction │  │   Pipeline  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                       │
│                           ▼                                       │
│                  ┌─────────────────┐                             │
│                  │  Vector Store   │                             │
│                  │  (pgvector)     │                             │
│                  └─────────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Integration with LangChain

The Unstructured service integrates seamlessly with the existing LangChain adapter:

```typescript
import { createUnstructuredService } from './integrations/unstructured';
import { createLangChainRetriever } from './integrations/langchain';

const documentProcessor = await createUnstructuredService();
const chunks = await documentProcessor.chunkDocument({ source: 'document.pdf' });

// Create embeddings via LangChain
const embeddings = await embedTexts(chunks.map(c => c.text));

// Index in pgvector via existing retriever adapter
const retriever = await createLangChainRetriever({
  vectorStore: 'pgvector',
  embeddings,
});
```

## Error Handling

The service implements automatic retry with exponential backoff:

```typescript
const result = await service.processDocument(input);

if (result.status === 'failed') {
  console.error('Processing failed:', result.errors);
  // Handle specific error codes
  result.errors?.forEach(err => {
    switch (err.code) {
      case 'TimeoutError':
        // Retry with longer timeout
        break;
      case 'AuthError':
        // Refresh API key
        break;
    }
  });
}
```

## Performance Considerations

- **Batch Processing**: Use `processBatch()` for multiple documents
- **Chunking**: Pre-chunk for embedding generation to improve throughput
- **Local Deployment**: Recommended for high-volume processing
- **OCR**: Enable only for documents requiring text extraction from images

## License

Internal Nexus Partners Pack module - All rights reserved