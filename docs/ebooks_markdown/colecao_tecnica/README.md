# Coletânea Técnica — Nexus Affil'IA'te MMN_IA

> **"O Shakespeare da atualidade, PHD nível Harvard do Universo AI"**
> Versão Markdown (.md) da coletânea técnica escrita por uma IA para outra IA.

## Sobre a Coletânea

Esta coletânea reúne **10 ebooks técnicos densos** sobre o estado da arte em IA e engenharia de ML. Cada ebook foi escrito em formato Markdown portável, com diagramas originais, snippets de código funcionais, e uma mentalidade prática de engenharia de produção.

| # | Ebook | Foco |
|---|---|---|
| 26 | [Obsidian: O Cérebro Digital do Desenvolvedor IA](../ebooks/26_Obsidian_O_Cerebro_Digital_do_Desenvolvedor_IA.docx) | Second brain + RAG sobre vault |
| 27 | [LlamaIndex: Engenharia de RAG e Conhecimento para LLMs](../ebooks/27_LlamaIndex_Engenharia_de_RAG_e_Conhecimento_para_LLMs.docx) | RAG, agents, evaluation |
| 28 | [Transformers: A Arquitetura que Mudou a IA para Sempre](../ebooks/28_Transformers_A_Arquitetura_que_Mudou_a_IA_para_Sempre.docx) | Self-attention do zero |
| 29 | [PyTorch: Engenharia de Deep Learning na Prática](../ebooks/29_PyTorch_Engenharia_de_Deep_Learning_na_Pratica.docx) | Framework de pesquisa e produção |
| 30 | [TensorFlow & Keras: Deep Learning em Escala de Produção](../ebooks/30_TensorFlow_Keras_Deep_Learning_em_Escala_de_Producao.docx) | Stack enterprise e TFX |
| 31 | [LangChain: Orquestração de Agentes e Chains para LLMs](31_LangChain_Orquestracao_de_Agentes_e_Chains_para_LLMs.md) | LCEL, ReAct, LangGraph |
| 32 | [Hugging Face: O Ecossistema que Democratizou a IA](32_Hugging_Face_O_Ecossistema_que_Democratizou_a_IA.md) | Hub, transformers, diffusers |
| 33 | [Prompt Engineering Avançado: A Arte e a Ciência de Falar com a Máquina](33_Prompt_Engineering_Avancado_A_Arte_e_a_Ciencia_de_Falar_com_a_Maquina.md) | CoT, ToT, ReAct, structured |
| 34 | [Weights & Biases: MLOps, Experimentação e Observabilidade](34_Weights_Biases_MLOps_Experimentacao_e_Observabilidade.md) | Tracking, sweeps, artifacts |
| 35 | [Vector Databases: A Memória de Longo Prazo da IA Moderna](35_Vector_Databases_A_Memoria_de_Longo_Prazo_da_IA_Moderna.md) | HNSW, Pinecone, Qdrant, pgvector |

## Estrutura dos Arquivos

```
colecao_tecnica/
├── README.md                                          # Este arquivo
├── 31_LangChain_...md                                  # LangChain
├── 32_Hugging_Face_...md                              # Hugging Face
├── 33_Prompt_Engineering_Avancado_...md               # Prompt Engineering
├── 34_Weights_Biases_...md                            # W&B
├── 35_Vector_Databases_...md                          # Vector DBs
└── images/                                            # Capas e diagramas
    ├── 31_cover.png
    ├── 31_diagram_rag.png
    ├── 31_diagram_react.png
    ├── 32_cover.png
    ├── 32_diagram_hub.png
    ├── 32_diagram_pipeline.png
    ├── 33_cover.png
    ├── 33_diagram_anatomy.png
    ├── 33_diagram_pyramid.png
    ├── 34_cover.png
    ├── 34_diagram_sweep.png
    ├── 34_diagram_tracking.png
    ├── 35_cover.png
    ├── 35_diagram_algos.png
    └── 35_diagram_ann.png
```

## Padrão Visual Nexus

Todos os ebooks seguem o padrão Nexus Affil'IA'te MMN_IA:

- **Fonte**: Calibri (em DOCX) / system-ui sans-serif (em MD)
- **Cor primária**: `#1F3864` (azul escuro)
- **Cor secundária**: `#4472C4` (azul médio)
- **Cor de destaque**: `#2E75B6` (azul claro)
- **Estrutura**: 10 capítulos por ebook + sumário + sobre + mensagem final
- **Linguagem**: técnica, direta, com humor sutil
- **Código**: snippets funcionais em Python/bash/YAML/JSON
- **Diagramas**: gerados por IA, otimizados para impressão digital

## Como Usar

### Leitura

Os arquivos `.md` podem ser lidos em qualquer visualizador Markdown:
- GitHub (renderização nativa)
- VS Code / Cursor
- Obsidian
- Typora
- Notion (import)

### Conversão para outros formatos

```bash
# Markdown → PDF
pandoc 31_LangChain_*.md -o langchain.pdf --pdf-engine=xelatex

# Markdown → DOCX
pandoc 31_LangChain_*.md -o langchain.docx

# Markdown → HTML
pandoc 31_LangChain_*.md -o langchain.html --standalone
```

### Imagens

As imagens estão em `images/` e referenciadas relativamente. Para usar em outros contextos, basta copiar o diretório junto.

## Filosofia Editorial

Cada ebook é escrito com a mentalidade **"IA para IA"**: assume leitor técnico que entende os conceitos básicos e quer profundidade real, não introdução. Onde há controvérsia, apresentamos múltiplas perspectivas. Onde há hype, tratamos com ceticismo. Onde há prática, mostramos código.

> *"O Shakespeare da atualidade, PHD nível Harvard do Universo AI"*
> — Nexus Affil'IA'te MMN_IA

## Estatísticas da Coletânea

| Métrica | Valor |
|---|---|
| Total de ebooks | 10 |
| Total de capítulos | 100 |
| Páginas estimadas (DOCX) | ~360 |
| Palavras (Markdown) | ~270.000 |
| Snippets de código | 250+ |
| Diagramas originais | 30+ |
| Idiomas | Português brasileiro |

## Próximas Coletâneas

Roadmap de coletâneas futuras (subject to change):

- **Coletânea Avançada de MLOps**: BentoML, MLflow, Seldon, Tecton, Featureform
- **Coletânea de MLOps para LLMs**: LangSmith, Helicone, PromptLayer, Humanloop
- **Coletânea de Segurança em IA**: Adversarial ML, prompt injection, guardrails
- **Coletânea de IA Generativa**: Stable Diffusion, FLUX, Sora, Veo, Suno
- **Coletânea de Otimização**: vLLM, TensorRT, ONNX, quantization, pruning

---

*Por MMN AI-to-AI • Nexus Affil'IA'te MMN_IA • 2026*
