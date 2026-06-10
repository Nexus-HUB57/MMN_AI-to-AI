---
title: "Vector Databases - A Memória de Longo Prazo da IA Moderna"
author: "MMN AI-to-AI"
collection: "Coletânea Técnica Nexus Affil'IA'te MMN_IA"
year: 2026
version: "1.0.0"
primary_color: "#1F3864"
secondary_color: "#4472C4"
---

![Capa](images/35_cover.png)

# Vector Databases — A Memória de Longo Prazo da IA Moderna

## Sobre este ebook

LLMs sabem muito, mas não sabem nada sobre o SEU negócio. Esquecem o que conversaram ontem. Alucinam fatos. Não conseguem atualizar conhecimento sem retreinar. Para resolver isso, você precisa de uma camada de memória externa — e essa camada é, em 2026, um vector database.

Vector DBs são bancos de dados especializados em busca por similaridade em espaços de alta dimensão. Armazenam embeddings (representações vetoriais densas) e respondem queries do tipo "encontre os K vetores mais similares a este" em milissegundos, mesmo com bilhões de documentos. São o motor do RAG, de sistemas de recomendação, de busca semântica, e de agentes que precisam lembrar.

Este ebook é o manual técnico: como funcionam os algoritmos (HNSW, IVF, PQ), quais os trade-offs, como escolher entre Pinecone, Qdrant, Weaviate, Milvus, ChromaDB, pgvector, e como construir sistemas RAG que escalam para milhões de documentos com latência sub-100ms.

## Sumário

| Nº | Capítulo |
|---|---|
| 1 | A Revolução da Busca Vetorial |
| 2 | Embeddings: Do Texto ao Espaço Vetorial |
| 3 | Métricas de Distância e Similaridade |
| 4 | Algoritmos ANN: HNSW, IVF, PQ |
| 5 | Pinecone: O Padrão Gerenciado |
| 6 | Qdrant: Performance Open Source |
| 7 | Weaviate, Milvus e ChromaDB |
| 8 | pgvector: Quando Você Já Tem Postgres |
| 9 | RAG em Escala: Patterns Avançados |
| 10 | Operações, Custos e Futuro dos Vector DBs |

---

# 1. A Revolução da Busca Vetorial

Antes de vector DBs, busca era exata: SQL com WHERE, Elasticsearch com token matching, ou inverted index com TF-IDF. Funcionava para queries keywords, mas falhava em semântica.

"Carro vermelho" não encontrava "veículo rubro". "Como resetar senha?" não encontrava "esqueci meu login". A distância semântica era invisível para sistemas tradicionais.

Em 2013, word2vec mostrou que palavras podiam ser representadas como vetores onde distância = significado. Cinco anos depois, BERT e Sentence-BERT generalizaram para frases inteiras. O próximo passo foi óbvio: indexar esses vetores em escala, e buscar por similaridade.

Nasceu a indústria de vector DBs.

## O que é um vector database

Vector DB é um banco de dados que:
1. Armazena vetores de alta dimensão (geralmente 384-4096 floats).
2. Indexa para busca aproximada (ANN — Approximate Nearest Neighbors) rápida.
3. Suporta metadata filtering (filtra por campo antes ou depois da busca).
4. CRUD básico (insert, update, delete).
5. Escala horizontalmente (sharding, replicação).

É a infraestrutura que torna o RAG possível.

## Casos de uso

**Retrieval Augmented Generation (RAG)**: busca de contexto para LLM.
**Semantic search**: Google moderno, mas interno.
**Recommendation systems**: produtos similares, "quem viu X viu Y".
**Image search**: encontra imagens visualmente similares.
**Anomaly detection**: vetor que não se parece com nenhum outro é anomalia.
**Fraud detection**: padrões de transação como vetores.
**Long-term memory for agents**: agentes que lembram de interações passadas.
**Deduplication**: encontra documentos quase duplicados.

## O que procurar em um vector DB

- **Latência**: ms para queries. QPS sustentado.
- **Recall**: acurácia da busca. ANN é aproximada; medir trade-off.
- **Escala**: milhões ou bilhões de vetores?
- **Metadata filtering**: velocidade vs. flexibilidade.
- **Hospedagem**: managed (Pinecone) vs. self-hosted (Qdrant, Milvus).
- **Custo**: por GB e por QPS.
- **Updates**: tempo para reindexar, suporte a streaming.

> 💡 **INSIGHT**: A escolha do vector DB é a decisão arquitetural mais importante em um sistema RAG. Embedding model e chunking são ajustáveis; trocar vector DB em produção é doloroso. Escolha errado e você refaz pipeline; escolha certo e escala linear.

## O trade-off fundamental

ANN sacrifica recall por velocidade. Com 10M vetores, busca exata (k-NN) demora segundos. ANN responde em 10-50ms com 95-99% recall. Esse 1-5% perdido geralmente não importa — se o embedding é bom, o "vizinho errado" ainda é semanticamente similar.

---

# 2. Embeddings: Do Texto ao Espaço Vetorial

Embeddings são a ponte entre mundo simbólico e matemático. Vamos entender como funcionam e como escolher.

## Como embeddings são criados

Embeddings modernos vêm de modelos treinados em grandes corpora:

```python
from sentence_transformers import SentenceTransformer

# Modelo multilíngue, dim=768
model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")

embeddings = model.encode([
    "Como resetar minha senha?",
    "Esqueci meu login, o que fazer?",
    "Receita de bolo de chocolate",
])

# Cada texto vira vetor de 768 dimensões
print(embeddings.shape)  # (3, 768)
```

Modelos clássicos: word2vec, GloVe, FastText. Contextuais: BERT, RoBERTa, GPT. Sentence-level: Sentence-BERT, E5, BGE, GTE, Nomic Embed, Cohere embed, OpenAI text-embedding-3.

## Propriedades do espaço

```python
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# Vetores
v_rei = model.encode("O rei")
v_homem = model.encode("O homem")
v_mulher = model.encode("A mulher")
v_rainha = model.encode("A rainha")

# Rei - Homem + Mulher = Rainha (clássico!)
result = v_rei - v_homem + v_mulher
sim_rei_rainha = np.dot(result, v_rainha) / (
    np.linalg.norm(result) * np.linalg.norm(v_rainha)
)
print(f"Similaridade rei-homem+mulher com rainha: {sim_rei_rainha:.3f}")
# ~0.85
```

O espaço captura relações semânticas. Linearidade (analogias) é uma propriedade emergente.

## Modelos state-of-the-art (2026)

| Modelo | Dimensão | Tamanho | Multilingual | Notas |
|---|---|---|---|---|
| OpenAI text-embedding-3-small | 1536 | API | Sim | Caro, alta qualidade |
| OpenAI text-embedding-3-large | 3072 | API | Sim | Estado da arte em muitas tarefas |
| Voyage-2 | 1024 | API | Sim | Excelente em RAG |
| Cohere embed-v3 | 1024 | API | Sim | Bom para retrieval, multilingual |
| BGE-large-en-v1.5 | 1024 | Open | Não | Top open source EN |
| BGE-M3 | 1024 | Open | Sim (100+ línguas) | Multilingual forte |
| E5-large-v2 | 1024 | Open | Sim | Microsoft, robusto |
| Nomic Embed v1.5 | 768 | Open | Sim | Recente, promissor |
| GTE-Qwen2-7B-instruct | 3584 | Open | Sim | Estado da arte open source |
| Stella-1.5B | 1024-4096 | Open | Sim | Atual SOTA em MTEB |
| mxbai-embed-large | 1024 | Open | Sim | Bons resultados em benchmarks |
| Snowflake-arctic-embed | 1024 | Open | Sim | Otimizado para retrieval |

Escolha por:
- **Idioma**: precisa multilingual? Use BGE-M3, mxbai, ou OpenAI.
- **Custo**: open source local ou API?
- **Latência**: API tem overhead de rede.
- **Qualidade**: rode no seu dataset, meça recall@10.

## Embeddings de imagens, áudio, multimodal

```python
from transformers import AutoModel

# CLIP: texto e imagem no mesmo espaço
model = AutoModel.from_pretrained("openai/clip-vit-large-patch14")

text_emb = model.get_text_features(**tokenizer("a cat"))
image_emb = model.get_image_features(**image_processor(cat_image))

# Você pode buscar imagens por texto!
similarity = (text_emb @ image_emb.T)
```

CLIP, ImageBind, SigLIP, EVA-CLIP são os principais. Permitem busca cross-modal: texto → imagem, áudio → texto, etc.

> 🎯 **DICA PRO**: Sempre use o mesmo modelo de embedding no insert e no query. Trocar modelo sem reindexar é desastre. Se precisar trocar, reindexe tudo (paralelize, mas é caro).

---

# 3. Métricas de Distância e Similaridade

A escolha da métrica de distância afeta diretamente a qualidade do retrieval.

## Cosine similarity (padrão)

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Range: [-1, 1]
# 1 = idênticos
# 0 = ortogonais (não relacionados)
# -1 = opostos
```

Cosine mede o ângulo entre vetores, ignorando magnitude. Padrão em NLP porque embeddings são normalizados.

## Euclidean (L2)

```python
def euclidean_distance(a, b):
    return np.linalg.norm(a - b)

# Range: [0, ∞)
# 0 = idênticos
# Quanto menor, mais similar
```

Magnitude importa. Útil quando vetores não são normalizados (ex: embeddings de imagens com scale variável).

## Dot product (produto escalar)

```python
def dot_product(a, b):
    return np.dot(a, b)

# Range: [-∞, ∞)
# Sem normalização
# Mais rápido que cosine
```

Equivalente a cosine se vetores são normalizados (||a||=||b||=1). Use em produção quando embedding é normalizado.

## Manhattan (L1)

```python
def manhattan_distance(a, b):
    return np.sum(np.abs(a - b))
```

Menos comum, mas útil em alguns domínios.

## Hamming

```python
def hamming_distance(a, b):
    return np.sum(a != b)
```

Para vetores binários. Usado em alguns algoritmos de indexação (LSH).

## Qual escolher?

| Caso | Métrica |
|---|---|
| NLP embeddings (BERT, OpenAI) | Cosine |
| Vision embeddings (CLIP, ViT) | Cosine ou L2 |
| Recommender systems | Dot product (com bias) |
| Detecção de anomalia | L2 ou Mahalanobis |
| Audio fingerprinting | Cosine |
| Embeddings normalizados | Dot product (= cosine) |

> 💡 **INSIGHT**: A maioria dos vector DBs assume cosine por padrão. Se você usar OpenAI embeddings (já normalizados), dot product é equivalente e mais rápido. Configure explicitamente; nem todos os DBs detectam.

## Testando sua métrica

```python
# Avalie: dado um gold standard, qual métrica dá melhor recall?
queries = [...]
ground_truth = [...]  # IDs relevantes para cada query

for metric in ["cosine", "euclidean", "dot"]:
    correct = 0
    for q, gt in zip(queries, ground_truth):
        retrieved = vector_db.search(q, k=10, metric=metric)
        if any(r in gt for r in retrieved):
            correct += 1
    print(f"{metric}: recall@10 = {correct/len(queries):.3f}")
```

Não assuma. Meça no seu dataset.

---

# 4. Algoritmos ANN: HNSW, IVF, PQ

Como buscar em bilhões de vetores em milissegundos? Algoritmos ANN. Vamos dissecar os três principais.

## O problema da busca exata

Força bruta: comparar query com todos os N vetores. O(N × d) onde d é dimensão. Para 10M vetores, 768 dim, CPU: ~5 segundos por query. Lento demais.

ANN sacrifica 1-5% recall por 100-1000× speedup. Três famílias principais:

## HNSW (Hierarchical Navigable Small World)

```python
# Conceito: grafo multi-camada onde busca segue arestas
# para os vizinhos mais próximos. Cada nó tem
# conexões para pontos próximos. Top layer tem
# conexões longas (jump), bottom tem conexões curtas (refine).
```

Intuitivamente: imagine o metro de São Paulo. Estações se conectam a estações próximas. Você pode ir de qualquer lugar a qualquer lugar em poucos saltos.

Complexidade de busca: O(log N) em média.
Memória: alta (~3-5× do tamanho dos vetores).
Recall: excelente (>99% com parâmetros certos).
Atualização: suporta (com cuidado).

Implementação: hnswlib, FAISS, Qdrant, Milvus, Weaviate.

## IVF (Inverted File Index)

```python
# Conceito: agrupa vetores em k clusters (k-means).
# Na busca: encontra clusters próximos da query,
# busca apenas nesses clusters.
```

Trade-off: parâmetro `nprobe` controla quantos clusters visitar. Mais = mais recall, mais lento.

Complexidade de busca: O(N/k × nprobe).
Memória: baixa (~1.1× tamanho dos vetores).
Recall: depende de `nprobe`. 90-99% típico.
Atualização: fácil (clusters são re-treinados periodicamente).

Bom para: datasets muito grandes (>100M) onde HNSW é caro em RAM.

## PQ (Product Quantization)

```python
# Conceito: divide vetor em m sub-vetores.
# Cada sub-vetor é quantizado para um codebook
# (256 centroides típicos). Vetor vira m índices
# de 1 byte cada. Compressão 32×.
```

Compressão massiva: 768 dim × 4 bytes = 3KB por vetor. Com PQ, ~96 bytes.

Complexidade de busca: muito rápida (lookup tables).
Memória: baixíssima (~0.3× do tamanho original).
Recall: moderado (80-95%). Compressão afeta precisão.
Atualização: difícil (re-treinar codebook).

Combina com IVF: IVFPQ. É o padrão de produção em escala massiva.

## Comparação

| Algoritmo | Memória | Latência | Recall | Escala |
|---|---|---|---|---|
| Flat (exato) | 1× | Lenta | 100% | Qualquer |
| HNSW | 3-5× | Muito rápida | 99%+ | Até 100M |
| IVF | 1.1× | Rápida | 95-99% | Até 1B+ |
| PQ | 0.3× | Muito rápida | 80-95% | Até 10B+ |
| IVFPQ | 0.4× | Rápida | 90-99% | Até 10B+ |

## HNSW em detalhe (parâmetros)

```python
import hnswlib

index = hnswlib.Index(space="cosine", dim=768)
index.init_index(
    max_elements=10_000_000,
    ef_construction=200,  # Qualidade durante construção
    M=16,                  # Conexões por nó
)

index.add_items(vectors, ids)

index.set_ef(50)  # Qualidade durante busca
labels, distances = index.knn_query(query, k=10)
```

**M** (16-32 típico): conexões por nó. Maior = mais recall, mais memória.
**ef_construction** (100-200): candidatos durante construção. Maior = grafo melhor, mais lento.
**ef** (50-200): candidatos durante busca. Maior = mais recall, mais lento.

## IVFPQ em FAISS

```python
import faiss

# Coarse quantizer: 4096 clusters
quantizer = faiss.IndexFlatL2(768)

# PQ: 16 sub-quantizers, 8 bits cada
index = faiss.IndexIVFPQ(
    quantizer,
    d=768,
    nlist=4096,
    m=16,
    nbits=8,
)

# Treinar com dados representativos
index.train(vectors)
index.add(vectors)

# Search
index.nprobe = 32  # Quantos clusters visitar
distances, indices = index.search(query, k=10)
```

IVFPQ é o padrão de produção para >100M vetores.

## Filtragem híbrida

ANN + metadata. Duas estratégias:

**Pre-filter**: filtra metadata primeiro, depois ANN no subset.
**Post-filter**: ANN primeiro, depois filtra resultados.

Pre-filter é mais rápido se filtro é seletivo. Post-filter é mais robusto se filtro é amplo.

> ⚠️ **CUIDADO**: HNSW com filtro de metadata é traiçoeiro. Se você filtra por `date > X` e só 1% dos dados passa, o grafo pode estar otimizado para um caminho que não inclui os relevantes. Use pre-filter com cuidado; teste recall.

![Diagrama ANN](images/35_diagram_ann.png)
*Figura 4.1 — Arquitetura de vector DB: embeddings → index (HNSW/IVF/PQ) → query ANN → resultados.*

---

# 5. Pinecone: O Padrão Gerenciado

Pinecone foi a primeira plataforma de vector DB totalmente gerenciada. Em 2026, é sinônimo de "vector DB pronto para produção".

## Vantagens

- Zero ops: sem servidor para gerenciar.
- Escala automática: 0 a bilhões de vetores sem mudar código.
- Latência consistente: SLA de p99 < 100ms.
- Hybrid search: vetor + metadata + sparse (BM25) nativo.
- Namespaces: multi-tenancy fácil.
- Backup, restore, compliance: SOC2, HIPAA, GDPR.

## Desvantagens

- Preço: $$$ comparado a self-hosted.
- Vendor lock-in: API proprietária.
- Limite de customização.

## Setup

```bash
pip install pinecone-client
```

```python
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="pc-...")

# Cria índice
pc.create_index(
    name="meu-indice",
    dimension=1536,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)

index = pc.Index("meu-indice")
```

## Operações CRUD

```python
# Upsert
index.upsert(
    vectors=[
        {"id": "doc-1", "values": embedding_1, "metadata": {"titulo": "...", "ano": 2024}},
        {"id": "doc-2", "values": embedding_2, "metadata": {"titulo": "...", "ano": 2025}},
    ],
    namespace="prod",
)

# Query
results = index.query(
    vector=query_embedding,
    top_k=10,
    namespace="prod",
    filter={"ano": {"$gte": 2024}},
    include_metadata=True,
)

for match in results.matches:
    print(f"ID: {match.id}, Score: {match.score}, Metadata: {match.metadata}")
```

## Sparse-dense hybrid

```python
# Query com sparse vector (BM25-style)
results = index.query(
    vector=dense_embedding,
    sparse_vector={
        "indices": [123, 456, 789],  # Token IDs
        "values": [0.5, 0.3, 0.2],   # TF-IDF weights
    },
    top_k=10,
    alpha=0.5,  # Weight de dense vs sparse
)
```

Pinecone é o único com hybrid nativo production-grade. Combina ANN dense + sparse vector retrieval.

## Namespaces para multi-tenancy

```python
# Por cliente
index.upsert(vectors, namespace="cliente-acme")
index.upsert(vectors, namespace="cliente-globex")

# Query isolada
results = index.query(query, namespace="cliente-acme")
```

Isolamento de dados sem infra extra. Cada namespace tem seus próprios limites de quota.

## Serverless vs Pod-based

- **Serverless**: pay-per-query, escala a zero, ideal para workloads variáveis.
- **Pod-based**: capacidade dedicada, ideal para latência consistente e alto QPS.

```python
# Serverless
spec = ServerlessSpec(cloud="aws", region="us-east-1")

# Pod
spec = PodSpec(environment="us-east-1-aws", pod_type="p1.x1", pods=1)
```

## Pricing (2026)

Serverless: ~$0.30 por GB-mês de storage, $0.04 por 1M read units.
Pod-based: a partir de ~$50/mês por pod.

Para 10M vetores 1536-dim (~60GB), ~$18/mês serverless.

> 💡 **INSIGHT**: Pinecone é a escolha padrão para times que querem foco em produto, não em infra. Se sua startup quer ir rápido, comece com Pinecone. Migre depois se custo justificar.

---

# 6. Qdrant: Performance Open Source

Qdrant é o vector DB open source favorito de engenheiros. Escrito em Rust, performance impressionante, feature-rich.

## Vantagens

- Open source (Apache 2.0): self-host sem lock-in.
- Performance: comparável a Pinecone em muitos benchmarks.
- Filtering robusto: suporta nested filters, geo, payloads complexos.
- Cloud: Qdrant Cloud gerenciado também disponível.
- Rust: memory-safe, eficiente.

## Desvantagens

- Self-hosting: você gerencia (ou usa Qdrant Cloud, pago).
- Comunidade menor que Pinecone.

## Setup

```bash
docker run -p 6333:6333 qdrant/qdrant
```

```python
pip install qdrant-client
```

## Operações

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# Cria coleção
client.create_collection(
    collection_name="docs",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# Upsert
client.upsert(
    collection_name="docs",
    points=[
        PointStruct(id=1, vector=emb_1, payload={"titulo": "...", "ano": 2024}),
        PointStruct(id=2, vector=emb_2, payload={"titulo": "...", "ano": 2025}),
    ],
)

# Query
hits = client.search(
    collection_name="docs",
    query_vector=query_emb,
    limit=10,
    query_filter={
        "must": [{"key": "ano", "range": {"gte": 2024}}]
    },
)
```

## Filtering poderoso

```python
# Nested filters, multiple conditions
filter = {
    "must": [
        {"key": "ano", "range": {"gte": 2024}},
        {"key": "categoria", "match": {"value": "tech"}},
    ],
    "must_not": [
        {"key": "status", "match": {"value": "draft"}}
    ],
}

# Geo
{
    "must": [
        {"key": "location", "geo_radius": {
            "center": {"lat": 52.5, "lon": 13.4},
            "radius": 1000
        }}
    ]
}
```

Qdrant tem o melhor sistema de filtering entre os vector DBs.

## Snapshot e backup

```bash
# Cria snapshot
curl -X POST 'http://localhost:6333/collections/docs/snapshots'

# Lista
curl 'http://localhost:6333/collections/docs/snapshots'

# Restaura
curl -X PUT 'http://localhost:6333/collections/docs/snapshots/snapshot-name'
```

## Performance tuning

```python
# Configuração de HNSW
client.update_collection(
    collection_name="docs",
    hnsw_config={
        "m": 16,                  # Conexões por nó
        "ef_construct": 200,      # Qualidade na construção
    },
    optimizer_config={
        "indexing_threshold": 20000,  # Build index após N pontos
    },
)
```

Para 10M+ vetores, considere:
- Quantization: scalar ou product quantization
- Sharding: distribui entre nós
- Disk-based: HNSW com paginação (Qdrant suporta)

## Qdrant Cloud

```python
client = QdrantClient(
    url="https://xyz.eu.qdrant.io",
    api_key="...",
)
```

Mesma API, gerenciado. Free tier com 1GB.

> 🎯 **DICA PRO**: Qdrant é o melhor custo-benefício em 2026. Performance de Pinecone, flexibilidade de open source, filtering superior. Para times técnicos que querem controle, é a primeira escolha.

---

# 7. Weaviate, Milvus e ChromaDB

Três alternativas fortes. Vamos comparar.

## Weaviate: o "schema-first"

Weaviate se diferencia por ter schema de dados nativo e GraphQL API.

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Schema
schema = {
    "classes": [{
        "class": "Article",
        "vectorizer": "text2vec-openai",
        "properties": [
            {"name": "title", "dataType": ["string"]},
            {"name": "content", "dataType": ["text"]},
            {"name": "category", "dataType": ["string"]},
        ]
    }]
}
client.schema.create(schema)

# Query via GraphQL
result = client.query.get("Article", ["title", "content"]) \\
    .with_near_text({"concepts": ["AI safety"]}) \\
    .with_where({"path": ["category"], "operator": "Equal", "valueString": "tech"}) \\
    .with_limit(5) \\
    .do()
```

Vantagens:
- Schema-first: modelagem explícita.
- GraphQL: queries tipadas.
- Módulos: integrações com OpenAI, Cohere, Hugging Face, etc.
- Multi-tenancy nativo.

Desvantagens:
- Mais complexo de operar.
- Overhead de abstração.

## Milvus: o "escalável massivo"

Milvus (Linux Foundation) é focado em escala massiva.

```python
from pymilvus import (
    connections, Collection, CollectionSchema, FieldSchema, DataType
)

connections.connect("default", host="localhost", port="19530")

# Schema
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=100),
]
schema = CollectionSchema(fields=fields)
collection = Collection("docs", schema=schema)

# Cria índice
index_params = {
    "metric_type": "COSINE",
    "index_type": "IVF_FLAT",
    "params": {"nlist": 1024}
}
collection.create_index("embedding", index_params)

# Insert
collection.insert([[ids], [embeddings], [categories]])

# Search
collection.load()
results = collection.search(
    data=[query_emb],
    anns_field="embedding",
    param={"metric_type": "COSINE", "params": {"nprobe": 16}},
    limit=10,
    expr="category == 'tech'",
)
```

Vantagens:
- Escala: biliões de vetores, sharding nativo.
- Múltiplos algoritmos: IVF, HNSW, ANNOY, DiskANN.
- Cloud: Zilliz Cloud gerenciado.
- Maturidade: empresa comercial (Zilliz) por trás.

Desvantagens:
- Operacionalmente mais complexo.
- Memória alta.

## ChromaDB: o "developer-first"

ChromaDB é o mais simples de usar. Foco em dev experience.

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

# Cria coleção (com função de embedding automática)
collection = client.create_collection(
    name="docs",
    embedding_function=embedding_functions.OpenAIEmbeddingFunction(
        api_key="sk-..."
    )
)

# Add
collection.add(
    documents=["doc 1 content", "doc 2 content"],
    metadatas=[{"cat": "tech"}, {"cat": "science"}],
    ids=["1", "2"],
)

# Query
results = collection.query(
    query_texts=["search query"],
    n_results=10,
    where={"cat": "tech"},
)
```

Vantagens:
- API mais simples do mercado.
- Embedding functions built-in.
- SQLite-like persistência.
- Perfeito para protótipos e MVPs.

Desvantagens:
- Escala limitada (não para 100M+).
- Performance menor em escala.

## Quando usar cada um

| Caso | Escolha |
|---|---|
| MVP / protótipo / aprendizado | ChromaDB |
| Produção < 10M vetores, controle | Qdrant |
| Produção < 1B vetores, sem gerenciar | Pinecone |
| Schema complexo, GraphQL | Weaviate |
| Escala massiva (>1B) | Milvus |
| Já tem Postgres | pgvector |
| Hibrid dense+sparse nativo | Pinecone |

![Diagrama Algoritmos](images/35_diagram_algos.png)
*Figura 7.1 — Trade-off: latência × recall. Flat (lento, exato) vs HNSW vs IVF vs PQ.*

---

# 8. pgvector: Quando Você Já Tem Postgres

Muitos times já têm Postgres. Adicionar vector search lá é a forma mais pragmática.

## Setup

```sql
-- Instalar extensão
CREATE EXTENSION vector;

-- Criar tabela
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(1536)
);

-- Criar índice
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

## Operações

```sql
-- Insert
INSERT INTO documents (content, metadata, embedding)
VALUES ('Lorem ipsum', '{"cat": "tech"}', '[0.1, 0.2, ...]');

-- Query
SELECT id, content, metadata,
       embedding <=> '[0.1, 0.2, ...]' AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 10;

-- Com filter
SELECT * FROM documents
WHERE metadata->>'cat' = 'tech'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 10;
```

## Operadores

- `<=>`: cosine distance
- `<->`: L2 (Euclidean) distance
- `<#>: inner product (negativo)
- `<=>` e `<->` retornam distância (menor = melhor)

## Limites

- Escala: até ~10M vetores confortavelmente. Mais disso e a busca fica lenta.
- Performance: 5-10× mais lento que Qdrant/Pinecone em queries puras.
- Mas: vantagem de JOIN com tabelas relacionais nativamente.

```sql
-- JOIN com tabela de usuários
SELECT u.name, d.content, d.embedding <=> $1 AS distance
FROM documents d
JOIN users u ON d.user_id = u.id
WHERE u.plan = 'premium'
ORDER BY distance
LIMIT 10;
```

Não dá pra fazer isso tão elegantemente em vector DBs puros.

## pgvector em produção

```python
# LangChain + pgvector
from langchain_postgres.vectorstores import PGVector

vectorstore = PGVector(
    connection_string="postgresql://...",
    embedding_function=OpenAIEmbeddings(),
    collection_name="docs",
)

# Uso normal
docs = vectorstore.similarity_search("query", k=10)
```

## Quando usar pgvector

- Você já tem Postgres e não quer adicionar infra.
- Dataset pequeno-médio (<10M vetores).
- Você precisa de JOIN com dados relacionais.
- Volume de queries é moderado (<100 QPS).

Para escala, migre para Qdrant ou Pinecone.

> 💡 **INSIGHT**: pgvector é underrated. Para times pequenos com dados relacionais ricos (usuários, transações, produtos), a vantagem de manter tudo em um único banco é real. Latência extra de 5ms vs Qdrant raramente importa. Use até doer; migre quando doer.

---

# 9. RAG em Escala: Patterns Avançados

Vector DB sozinho é基础设施. RAG em produção exige patterns. Vamos ver os principais.

## RAG básico

```python
# 1. Retrieve
docs = vector_db.similarity_search(query, k=5)

# 2. Augment
context = "\n\n".join(doc.content for doc in docs)

# 3. Generate
prompt = f"""
Use o contexto para responder:

{context}

Pergunta: {query}
"""
response = llm.invoke(prompt)
```

Funciona. Mas sofre de:
- Queries keyword-heavy (embedding semântico perde keywords).
- Contexto irrelevante recuperado (LLM fica confuso).
- Janela de contexto limitada (trunca info).

## Reranking

```python
# 1. Retrieve top-50
candidates = vector_db.similarity_search(query, k=50)

# 2. Rerank para top-5
from cohere import Client
co = Client(api_key="...")
reranked = co.rerank(
    query=query,
    documents=[c.content for c in candidates],
    top_n=5,
    model="rerank-v3.5",
)

# 3. Use top-5
top_docs = [candidates[r.index] for r in reranked.results]
```

Reranking pode melhorar recall em 20-40%. Cross-encoder (Cohere, Jina, FlashRank) é mais preciso que bi-encoder (embedding).

## Hybrid search (dense + sparse)

```python
# Pinecone
results = pinecone.query(
    vector=dense_emb,
    sparse_vector={"indices": [...], "values": [...]},
    alpha=0.5,  # 0 = pure sparse, 1 = pure dense
    top_k=10,
)

# Ou BM25 manual
from rank_bm25 import BM25Okapi

tokenized_corpus = [doc.content.split() for doc in documents]
bm25 = BM25Okapi(tokenized_corpus)
bm25_scores = bm25.get_scores(query.split())

# Combinar scores
combined = 0.5 * bm25_scores + 0.5 * dense_scores
top_indices = np.argsort(combined)[-10:]
```

## Query expansion

```python
# LLM gera variações da query
expansions = llm.invoke(f"""
Gere 4 variações semânticas da query: "{query}"
Use sinônimos, perspectivas diferentes, e reformulações.
""").split("\n")

all_results = []
for q in [query] + expansions:
    all_results.extend(vector_db.similarity_search(q, k=20))

# Deduplica
seen = set()
unique = []
for r in all_results:
    if r.id not in seen:
        seen.add(r.id)
        unique.append(r)

# Top 5
top = sorted(unique, key=lambda x: -x.score)[:5]
```

## Self-RAG: modelo avalia relevância

```python
# 1. Retrieve
docs = vector_db.similarity_search(query, k=10)

# 2. LLM avalia cada doc
relevant = []
for doc in docs:
    score = llm.invoke(f"""
    A resposta para "{query}" está no contexto abaixo?
    Responda APENAS com "sim" ou "não".

    Contexto: {doc.content}
    """).strip().lower()

    if "sim" in score:
        relevant.append(doc)

# 3. Gera com docs relevantes
if relevant:
    answer = generate(query, relevant)
else:
    # Fallback: knowledge do próprio modelo
    answer = generate_no_rag(query)

# 4. Fact-check
if fact_check(answer, relevant):
    return answer
else:
    return "Não tenho certeza."
```

## Multi-vector: embedding de chunks diferentes

```python
# Em vez de embedding do chunk completo,
# embed cada sentença + título + sumário
chunks = ["chunk1 content", "chunk2 content", ...]

multi_vectors = []
for chunk in chunks:
    vectors = {
        "title": embed(chunk.title),
        "summary": embed(chunk.summary),
        "content": embed(chunk.content),
    }
    multi_vectors.append({"id": chunk.id, "vectors": vectors})

# Search
for query_emb in [title_emb, summary_emb, content_emb]:
    results.extend(vector_db.search(query_emb, k=10))

# Maximal marginal relevance para diversificar
final = mmr(query, all_results, k=5)
```

Embeddings múltiplos capturam diferentes facetas. Melhora recall em 10-20%.

## Hierarchical RAG

```python
# 1. Summary vectors (por documento)
doc_summaries = [embed(d.summary) for d in documents]

# 2. Chunk vectors (por chunk)
chunk_vectors = [embed(c.content) for c in chunks]

# 3. Query: primeiro encontra docs relevantes
relevant_docs = summary_search(query, top_k=5)

# 4. Depois busca chunks apenas nesses docs
relevant_chunks = chunk_search(
    query,
    filter={"doc_id": {"$in": [d.id for d in relevant_docs]}},
    top_k=20,
)
```

Reduz espaço de busca, melhora precisão. Bom para coleções grandes.

## Agentic RAG

```python
# Agent decide estratégia
agent = create_agent(
    tools=[
        vector_search_tool,  # RAG normal
        web_search_tool,      # Web
        sql_tool,            # Banco
        calculator_tool,     # Cálculos
    ],
    system_prompt="""
    Para responder perguntas, escolha a melhor estratégia:
    - Informação factual específica: use vector_search
    - Informação atual: use web_search
    - Dados numéricos: use sql
    - Cálculos: use calculator
    """,
)

response = agent.run(query)
```

LLM escolhe o retrieval certo. Mais flexível que RAG fixo.

## Streaming RAG

```python
def stream_rag(query):
    # Stream tokens à medida que contexto é preparado
    docs = vector_db.search(query, k=5)
    context = format(docs)

    # LLM stream
    for token in llm.stream(f"Context: {context}\n\nQ: {query}"):
        yield token
```

Latência percebida cai 50%. Usuário vê tokens chegando enquanto retrieval acontece.

> 🎯 **DICA PRO**: Não comece com RAG complexo. Comece com retrieve → augment → generate. Quando sentir dor (recall ruim, latência alta, alucinações), adicione reranking, hybrid, query expansion. RAG simples resolve 80% dos casos.

---

# 10. Operações, Custos e Futuro dos Vector DBs

Vector DBs em produção precisam de cuidado operacional. Vamos cobrir.

## Monitoramento

```python
# Métricas essenciais
metrics = {
    "qps": queries_per_second,
    "p50_latency_ms": ...,
    "p99_latency_ms": ...,
    "recall_at_k": ...,
    "index_size_gb": ...,
    "ram_usage_gb": ...,
    "cpu_usage": ...,
    "errors_per_minute": ...,
}

# W&B / Prometheus / Datadog
wandb.log(metrics)
```

Alertas quando:
- p99 > 200ms (degradação).
- QPS < esperado (instabilidade).
- Recall cai (qualidade do embedding modelo mudou).
- Erros de conexão.

## Custo: TCO real

**Pinecone (serverless)**: 1M vetores 1536-dim, 1M queries/mês.
Storage: 6GB × $0.30 = $1.80/mês.
Queries: 1M × $8.40/M reads = $8.40/mês.
Total: ~$10/mês.

**Qdrant Cloud (managed)**: 1M vetores 1536-dim, 1M queries/mês.
Cluster 1×2 vCPU, 4GB RAM: $30/mês.
Total: ~$30/mês.

**Self-hosted Qdrant**: 1M vetores, 1M queries/mês.
Instance: 4 vCPU, 8GB RAM, $50/mês (AWS).
Total: ~$50/mês + seu tempo.

**Milvus/Zilliz**: 1M vetores, 1M queries.
Cluster 2× CU: ~$100/mês.

**Conclusão**: Pinecone ganha em escala pequena-média. Self-hosted ganha em escala grande. Milvus/Zilliz para 100M+ vetores.

## Backup e disaster recovery

```python
# Qdrant snapshot
client.create_snapshot(collection_name="docs")

# Pinecone backup
# Automático em tier Pro+. Manual via API.

# Milvus
# Backup via milvus-backup tool
```

Regra: backup diário, retenção 30 dias, teste de restore mensal.

## Reindexação

Embeddings deprecam. Modelos mudam. Quando reindexar?

```python
# Quando modelo de embedding é atualizado
# Quando recall cai 10%+
# Quando schema de metadata muda
# Quando compliance exige (GDPR right to be forgotten)

# Plano de reindexação
# 1. Reindexar em batch (paralelo, em background)
# 2. Dual-write durante transição (old + new index)
# 3. Switch gradual: 1% → 10% → 50% → 100%
# 4. Decomissionar old index
```

Reindexar 10M vetores leva ~1-2 horas com embedding API. Local (BGE, E5) é mais rápido.

## Segurança

```python
# Encryption at rest
# - AWS KMS para Pinecone
# - Self-managed para Qdrant/Milvus

# Encryption in transit
# - TLS obrigatório em produção

# Access control
# - Pinecone: API keys + RBAC
# - Qdrant: API keys + collections com ACL
# - pgvector: padrão Postgres (roles, row-level security)

# Audit logs
# - W&B, Datadog, ou cloud-native (CloudTrail, etc)
```

Compliance: SOC2, HIPAA, GDPR. Pinecone e Qdrant Cloud são SOC2 Type II.

## O futuro dos vector DBs

**Tendência 1: Hybrid search nativo**. Pinecone já tem. Qdrant, Weaviate adicionando. Dense+sparse será padrão.

**Tendência 2: Embedded vector DBs**. Para edge: LanceDB, ChromaDB embedded, sqlite-vss. Vetores no dispositivo, sem servidor.

**Tendência 3: Serverless + GPU**. Pinecone serverless em GPU para embeddings mais rápidos.

**Tendência 4: Multimodal nativo**. Embeddings unificados para texto, imagem, áudio. Busca cross-modal.

**Tendência 5: Vector + LLM cache**. Cache de embeddings + respostas. Semantic cache (resposta cacheada se query similar já foi respondida).

```python
# Semantic cache
def query_with_cache(question):
    cache_key = embed(question)
    cached = vector_cache.search(cache_key, threshold=0.95)

    if cached:
        return cached[0].answer

    answer = llm.invoke(question)
    vector_cache.upsert(cache_key, {"question": question, "answer": answer})
    return answer
```

**Tendência 6: DiskANN**. Algoritmo da Microsoft Research. ANN em disco, escala para 100B+ com RAM limitada. Milvus, Weaviate integrando.

**Tendência 7: Vector databases para recomendação**. Odero, USearch, FAISS otimizado para similarity de itens.

## Checklist de produção

- [ ] Vector DB escolhido com base em escala, latência, custo.
- [ ] Index apropriado (HNSW, IVFPQ) com parâmetros tuned.
- [ ] Metadata schema definido e versionado.
- [ ] Backup automatizado.
- [ ] Monitoring: latência, QPS, recall, erros.
- [ ] Custo modelado: storage + queries + compute.
- [ ] Reindex playbook documentado.
- [ ] Security: encryption, RBAC, audit.
- [ ] Load testing antes de produção.
- [ ] Plan B: se vector DB ficar fora do ar, qual fallback?

> 📌 **MENSAGEM FINAL**: Vector DBs são a infraestrutura que torna a IA útil em produção. Sem eles, LLMs são genéricos e esquecidos. Com eles, têm memória de longo prazo, contexto personalizado, e conhecimento atualizado. Escolha com cuidado, opere com disciplina, e sua aplicação de IA vai escalar. O ecossistema está amadurecendo rápido; fique atento às novidades, mas não caia em hype. Pinecone, Qdrant, pgvector cobrem 95% dos casos. Escolha um, domine, e construa.

---

*Por MMN AI-to-AI • Nexus Affil'IA'te MMN_IA • 2026*
