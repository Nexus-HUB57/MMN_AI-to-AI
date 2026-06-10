---
title: "Hugging Face - O Ecossistema que Democratizou a IA"
author: "MMN AI-to-AI"
collection: "Coletânea Técnica Nexus Affil'IA'te MMN_IA"
year: 2026
version: "1.0.0"
primary_color: "#1F3864"
secondary_color: "#4472C4"
---

![Capa](images/32_cover.png)

# Hugging Face — O Ecossistema que Democratizou a IA

## Sobre este ebook

Antes do Hugging Face, usar um modelo de IA de ponta exigia clonar repositórios aleatórios no GitHub, decifrar READMEs, instalar dependências obscuras e torcer. Depois, você tem `pip install transformers`, três linhas de código, e qualquer modelo do planeta roda na sua máquina. Isso é Hugging Face.

Mas a empresa francesa-americana vai muito além da biblioteca `transformers`. Construiu um ecossistema completo: hub com 1M+ modelos, datasets, Spaces, Inference API, Enterprise Hub, e ferramentas de treinamento, avaliação e deploy. Em 2026, Hugging Face é a "GitHub da IA" — o lugar onde a comunidade cria, compartilha, versiona e consome inteligência artificial.

Este ebook é o manual técnico do ecossistema. Você vai dominar transformers, diffusers, datasets, tokenizers, accelerate, e construir pipelines production-grade com a stack HF.

## Sumário

| Nº | Capítulo |
|---|---|
| 1 | A História e a Filosofia do Hugging Face |
| 2 | Transformers: A Biblioteca que Mudou Tudo |
| 3 | Model Hub: O Catálogo Universal de IA |
| 4 | Datasets: O Lado dos Dados |
| 5 | Tokenizers: A Arte de Converter Texto em Números |
| 6 | Pipelines: Inferência em 3 Linhas |
| 7 | Treinamento e Fine-Tuning com Transformers Trainer |
| 8 | Accelerate: Treinamento Distribuído Sem Código Extra |
| 9 | Diffusers: Geração de Imagens e Áudio |
| 10 | Spaces, Inference API e o Ecossistema Open Source |

---

# 1. A História e a Filosofia do Hugging Face

A empresa nasceu em 2016 como um chatbot para adolescentes (mesmo nome do emoji 🤗), fundada por Clément Delangue, Julien Chaumond e Thomas Wolf. O pivô veio em 2018 com o lançamento da biblioteca `transformers` — e o mundo nunca mais foi o mesmo.

## A missão

A missão declarada é: "democratizar o bom machine learning". Concretamente:
- Modelos state-of-the-art acessíveis a qualquer pessoa.
- Open source first, com licenças permissivas.
- Infraestrutura compartilhada via Hub.
- Educação como prioridade (curso, documentação, comunidade).

## A escala do Hub

Números atualizados (2026):
- **1.2M+ modelos** publicados.
- **250k+ datasets** públicos.
- **500k+ Spaces** (apps demo).
- **5M+ usuários** ativos.

Modelos grandes como Llama 3, Mistral, Stable Diffusion, Whisper, BERT, BLOOM estão todos no Hub. Qualquer pessoa com conta pode baixar, modificar, publicar.

## Os pilares do ecossistema

- **transformers**: biblioteca de modelos (NLP, vision, audio, multimodal).
- **datasets**: pipeline de dados otimizado.
- **tokenizers**: implementação rápida de qualquer tokenizer.
- **diffusers**: modelos de difusão para imagem/áudio/vídeo.
- **accelerate**: treinamento distribuído simplificado.
- **peft**: parameter-efficient fine-tuning (LoRA, prefix tuning, etc).
- **trl**: reinforcement learning (RLHF, DPO).
- **evaluate**: métricas de avaliação.
- **huggingface_hub**: CLI e API para interagir com o Hub.
- **text-generation-inference**: servidor de produção.
- **spaces**: plataforma de demos Gradio/Streamlit.

> 💡 **INSIGHT**: Hugging Face não é uma empresa de IA no sentido tradicional. É uma empresa de infraestrutura. Não treina seus próprios modelos frontier; constrói as ferramentas que a comunidade usa para treinar, compartilhar, e servir. O modelo de negócio: Hub Enterprise, Inference API, Spaces Pro, e compute (AutoTrain, Endpoints).

## A posição estratégica

Em 2026, Hugging Face é o "sistema operacional" do open source AI. Quando uma empresa quer adotar LLMs, pergunta: "como faço com Hugging Face?". Quando uma startup quer treinar modelo, vai para o Hub. Quando um pesquisador quer publicar, sobe para o Hub. O ciclo virtuoso se retroalimenta.

---

# 2. Transformers: A Biblioteca que Mudou Tudo

A biblioteca `transformers` é o coração do ecossistema. Começou com NLP puro, hoje cobre praticamente qualquer tarefa de ML.

## Instalação

```bash
pip install transformers torch
# ou
pip install transformers tensorflow
```

GPU é detectada automaticamente se CUDA estiver instalado.

## Estrutura básica

```python
from transformers import AutoTokenizer, AutoModel

# Carrega tokenizer e modelo
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

# Tokeniza texto
inputs = tokenizer("Hello, world!", return_tensors="pt")
# {'input_ids': tensor([[101, 7592, 1010, 2088, 999, 102]]),
#  'attention_mask': tensor([[1, 1, 1, 1, 1, 1]])}

# Forward pass
outputs = model(**inputs)
last_hidden = outputs.last_hidden_state  # (1, 6, 768)
```

A classe `Auto*` detecta automaticamente a arquitetura certa. Funciona para BERT, RoBERTa, GPT, T5, LLaMA, Mistral, e centenas de outras.

## As classes principais

| Classe | Função |
|---|---|
| `AutoTokenizer` | Carrega tokenizer correto |
| `AutoModel` | Carrega modelo base (sem head) |
| `AutoModelForSequenceClassification` | Modelo + head de classificação |
| `AutoModelForCausalLM` | Modelo generativo (decoder) |
| `AutoModelForSeq2SeqLM` | Encoder-decoder (tradução, sumarização) |
| `AutoModelForTokenClassification` | NER, POS tagging |
| `AutoModelForQuestionAnswering` | Q&A extrativa |
| `AutoModelForMaskedLM` | Masked language modeling |
| `AutoModelForImageClassification` | Vision transformers |
| `AutoModelForObjectDetection` | DETR, YOLOS |
| `AutoModelForSpeechSeq2Seq` | Whisper |

Cada `AutoModelFor*` é uma `AutoModel` + um head específico para a tarefa.

## Salvando e compartilhando

```python
# Salvar local
model.save_pretrained("./meu-modelo")
tokenizer.save_pretrained("./meu-modelo")

# Publicar no Hub
model.push_to_hub("meu-usuario/meu-modelo")
tokenizer.push_to_hub("meu-usuario/meu-modelo")
```

```python
# Qualquer pessoa baixa
model = AutoModel.from_pretrained("meu-usuario/meu-modelo")
```

Versionamento, métricas de uso, discussions, tudo no Hub.

## Modelos grandes: sharding e offload

```python
from transformers import AutoModel

model = AutoModel.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    device_map="auto",          # Distribui em GPU/CPU/disco
    torch_dtype=torch.float16,  # Meia precisão
    offload_folder="./offload", # Spillover para disco
    offload_state_dict=True,
)
```

Carrega modelos de 70B+ em hardware limitado. Inteligente, mas lento.

> ⚠️ **CUIDADO**: `device_map="auto"` pode colocar layers em locais subótimos. Use `accelerate` para inspeção e ajuste fino do placement.

## Config: a alma do modelo

```python
from transformers import AutoConfig

config = AutoConfig.from_pretrained("gpt2-medium")
print(config.vocab_size)        # 50257
print(config.n_embd)            # 1024
print(config.n_layer)           # 24
print(config.n_head)            # 16

# Modificar antes de criar
config.num_labels = 5
model = AutoModelForSequenceClassification.from_config(config)
```

Configurar a arquitetura do zero, sem pré-treino. Útil para ablation e arquitetura custom.

---

# 3. Model Hub: O Catálogo Universal de IA

O Hub é onde os modelos vivem. É a parte mais visível do Hugging Face, e a que mais gera valor de plataforma.

## Estrutura de um repositório

```
user/mini-llama/
├── README.md              # Card do modelo (gerado automaticamente)
├── config.json            # Arquitetura
├── model.safetensors      # Pesos (formato seguro, rápido)
├── tokenizer.json         # Tokenizer
├── tokenizer_config.json
├── special_tokens_map.json
├── generation_config.json
├── training_args.bin      # Args de treino (se fine-tune)
└── .gitattributes         # Git LFS
```

Tudo versionado com Git LFS. Você pode clonar, branch, PR, como qualquer repo.

## Pesquisando modelos

```python
from huggingface_hub import HfApi

api = HfApi()
# Filtrar por tarefa, framework, licença
models = api.list_models(
    filter="text-generation",
    sort="downloads",
    direction=-1,
    limit=10,
)
for m in models:
    print(m.id, m.downloads)
```

Filtros comuns: `text-classification`, `text2text-generation`, `fill-mask`, `text-generation`, `image-classification`, `object-detection`, `automatic-speech-recognition`, `text-to-image`.

## Model card: a documentação viva

```markdown
---
language: en
license: apache-2.0
tags:
- text-generation
- pytorch
datasets:
- wikipedia
metrics:
- perplexity
---

# MiniLLama-7B

A 7B parameter language model trained on Wikipedia and BookCorpus.

## Model Description
...

## Intended Uses
- Text generation
- Question answering
- ...

## Limitations
- May generate biased content
- Limited to English
- Knowledge cutoff: 2025-12

## Training
- Data: 100B tokens from Wikipedia + BookCorpus
- Hardware: 8x A100 80GB
- Duration: 14 days
- ...

## Evaluation
| Model | Perplexity | HellaSwag | MMLU |
|-------|-----------|-----------|------|
| MiniLLama-7B | 6.5 | 76.2 | 64.1 |
| ... | ... | ... | ... |

## Citation
@misc{...}
```

Model card é metadado + documentação. É o "README" do modelo. Inclui limitações, usos pretendidos, dados de treino, métricas. Crítico para uso responsável.

## Licenças e governança

O Hub respeita licenças rigorosamente:
- Modelos restritos (gated): você precisa aceitar termos (Llama, GPT-2, Stable Diffusion).
- Licenças permissivas (MIT, Apache 2.0): uso livre.
- Licenças copyleft (GPL): derivadas devem abrir código.
- Research-only: proibido comercial.

```python
# Para modelos gated
from huggingface_hub import login
login(token="hf_...")  # Token de acesso pessoal

model = AutoModel.from_pretrained("meta-llama/Llama-2-7b-hf")
```

> 💡 **INSIGHT**: A escolha de modelo não é só "qual é o melhor". É "qual é o melhor que posso usar dentro das minhas restrições". Llama 3.1 70B é excelente, mas se sua empresa tem política contra Meta, vai de Mistral ou Qwen.

---

# 4. Datasets: O Lado dos Dados

Modelos vivem do que comem. `datasets` é a biblioteca oficial para carregar, processar e servir dados em escala.

## Instalação

```bash
pip install datasets
```

## Carregando do Hub

```python
from datasets import load_dataset

# Carrega dataset do Hub
ds = load_dataset("squad", split="train")
print(ds[0])
# {'id': '5733be284776f41900661182',
#  'title': 'University_of_Notre_Dame',
#  'context': 'Architecturally, ...',
#  'question': 'To whom did the Virgin Mary ...',
#  'answers': {'text': ['Saint Bernadette Soubirous'], 'answer_start': [515]}}

# Múltiplos splits
ds = load_dataset("imdb")  # train, test
print(ds.keys())  # dict_keys(['train', 'test'])
```

Centenas de datasets públicos prontos: GLUE, SuperGLUE, SQuAD, IMDB, COCO, Common Voice, Wikipedia, C4, The Pile, etc.

## Processamento com map

```python
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=512,
    )

tokenized = ds.map(tokenize_function, batched=True, num_proc=4)
```

`map` aplica função em paralelo. `batched=True` processa em batches, muito mais rápido.

## Streaming: datasets que não cabem em RAM

```python
ds = load_dataset(
    "wikipedia",
    "20220301.en",
    split="train",
    streaming=True,
)

for example in ds:
    process(example)
    # não materializa 20GB na RAM
```

Para datasets enormes (Common Crawl, Wikipedia, The Pile), streaming é obrigatório.

## Custom dataset

```python
from datasets import Dataset
import pandas as pd

# De pandas
df = pd.read_csv("meus_dados.csv")
ds = Dataset.from_pandas(df)

# De dicionário
ds = Dataset.from_dict({
    "text": ["hello", "world"],
    "label": [0, 1],
})

# Salvar e compartilhar
ds.push_to_hub("meu-usuario/meu-dataset")
```

Ou usar `load_dataset` com script custom.

## Manipulação

```python
# Filtra
filtered = ds.filter(lambda x: len(x["text"]) > 100)

# Mapeia
mapped = ds.map(transform_fn, remove_columns=["old_col"])

# Shuffle
shuffled = ds.shuffle(seed=42)

# Select
selected = ds.select(range(1000))

# Sort
sorted_ds = ds.sort("length")

# Train/test split
splits = ds.train_test_split(test_size=0.2)
```

## Otimização de performance

```python
# Apache Arrow subjacente: columnar, in-memory, compressed
print(ds.features)  # Schema
print(ds.num_bytes)  # Tamanho em bytes
print(ds.num_rows)  # Número de linhas

# Conversão para PyTorch/TensorFlow
ds.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])
```

Datasets são armazenados em Apache Arrow, formato columnar de alta performance. Acesso a colunas é O(1), não precisa carregar tudo.

> 🎯 **DICA PRO**: Em pipelines de treinamento, use `ds.with_format("torch")` no final do preprocessing. O Trainer consome diretamente, sem conversão a cada batch.

---

# 5. Tokenizers: A Arte de Converter Texto em Números

LLMs processam números, não texto. Tokenizer é a ponte.

## Carregando

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokens = tokenizer("Hello, world!")
# {'input_ids': [15496, 11, 995, 0],
#  'attention_mask': [1, 1, 1, 1]}
```

Cada modelo tem seu próprio tokenizer. GPT-2 usa BPE, BERT usa WordPiece, LLaMA usa SentencePiece BPE. Não são intercambiáveis.

## Operações fundamentais

```python
# Encode
ids = tokenizer.encode("Hello, world!")  # [15496, 11, 995, 0]

# Decode
text = tokenizer.decode(ids)  # "Hello, world!"

# Batch
batch = tokenizer(
    ["Hello", "World"],
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt",
)
# {'input_ids': tensor([[15496, 0, ...], [15496, 278, ...]]),
#  'attention_mask': tensor([[1, 1, 0], [1, 1, 1]])}
```

## Tipos de tokenização

**BPE (Byte-Pair Encoding)**: usado em GPT-2, RoBERTa. Merge de pares mais frequentes.
**WordPiece**: usado em BERT. Similar a BPE, mas usa likelihood para escolher merges.
**Unigram**: usado em XLNet, ALBERT. Modelo probabilístico reverso.
**SentencePiece**: framework genérico que pode implementar BPE ou Unigram. Usado em LLaMA, Mistral, T5.

## Características avançadas

```python
# Special tokens
print(tokenizer.special_tokens_map)
# {'bos_token': '<s>', 'eos_token': '</s>', 'unk_token': '<unk>', ...}

# Vocabulário
print(tokenizer.vocab_size)  # 50257 para GPT-2
print(tokenizer.get_vocab())  # dict: token → id

# Adicionar tokens custom
new_tokens = ["<|system|>", "<|user|>", "<|assistant|>"]
tokenizer.add_special_tokens({"additional_special_tokens": new_tokens})

# E o modelo precisa ser redimensionado
model.resize_token_embeddings(len(tokenizer))
```

## Chat templates

Para modelos conversacionais (LLaMA 3, Mistral, Qwen, etc):

```python
messages = [
    {"role": "system", "content": "Você é um assistente."},
    {"role": "user", "content": "Olá!"},
    {"role": "assistant", "content": "Oi, como posso ajudar?"},
]

# Aplica template do modelo
input_ids = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
)
# Cada modelo tem seu próprio formato. Llama 3:
# <|begin_of_text|><|start_header_id|>system<|end_header_id|>
# Você é um assistente.<|eot_id|>
# <|start_header_id|>user<|end_header_id|>Olá!<|eot_id|>
# <|start_header_id|>assistant<|end_header_id|>
```

Sempre use `apply_chat_template` em vez de concatenar strings manualmente. O template é parte do modelo.

## Encoding de imagens, áudio, multimodal

```python
# Vision
from transformers import AutoProcessor

processor = AutoProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")
inputs = processor(images=image, text="O que tem na imagem?", return_tensors="pt")

# Áudio
from transformers import AutoProcessor
processor = AutoProcessor.from_pretrained("openai/whisper-large-v3")
inputs = processor(audio=audio_array, sampling_rate=16000, return_tensors="pt")
```

Processors unificam tokenizer + feature extractor (imagem) + feature extractor (áudio) numa API só.

> ⚠️ **CUIDADO**: Tokenizer é o detalhe mais subestimado em produção. Um token extra que não foi treinado (unk_token) degrada performance. Sempre use o tokenizer oficial do modelo. Fine-tune? Use o mesmo tokenizer.

![Diagrama Pipeline](images/32_diagram_pipeline.png)
*Figura 5.1 — Pipeline transformers: tokenizer → model → postprocessor.*

---

# 6. Pipelines: Inferência em 3 Linhas

Para 90% dos casos de uso, `pipeline` é tudo que você precisa.

## API básica

```python
from transformers import pipeline

# Criar pipeline
classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device="cuda",  # ou "cpu", 0, "mps"
)

# Inferência
result = classifier("I love this movie!")
# [{'label': 'POSITIVE', 'score': 0.9998}]
```

Três linhas, modelo carregado, inferência feita, GPU detectada.

## Tarefas suportadas

```python
# Geração de texto
generator = pipeline("text-generation", model="gpt2")
generator("Once upon a time", max_length=50)

# Q&A
qa = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
qa(question="What is AI?", context="AI is artificial intelligence...")

# Resumo
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summarizer("Long article here...")

# Tradução
translator = pipeline("translation_en_to_pt", model="Helsinki-NLP/opus-mt-en-pt")
translator("Hello world")

# NER
ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)
ner("Apple was founded by Steve Jobs in California.")

# Classificação de imagem
image_classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
image_classifier("cat.jpg")

# Detecção de objetos
detector = pipeline("object-detection", model="facebook/detr-resnet-50")
detector("people.jpg")

# Reconhecimento de fala
asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3")
asr("audio.mp3")

# Text-to-speech
tts = pipeline("text-to-speech", model="microsoft/speecht5_tts")
tts("Hello, this is a test")
```

Dezenas de tarefas. Veja a lista completa em `pipeline.task_list()`.

## Batch

```python
texts = ["Great product!", "Terrible experience", "It's okay"]
results = classifier(texts)
# Lista de dicts, um por texto
```

## Geração com modelos grandes

```python
from transformers import pipeline, AutoTokenizer

# Para LLMs, use device_map e torch_dtype
pipe = pipeline(
    "text-generation",
    model="meta-llama/Llama-2-7b-chat-hf",
    torch_dtype=torch.float16,
    device_map="auto",
    model_kwargs={
        "load_in_4bit": True,  # QLoRA
    },
)

messages = [{"role": "user", "content": "O que é RAG?"}]
output = pipe(messages, max_new_tokens=512, do_sample=True, temperature=0.7)
```

## Streaming

```python
# Stream token por token
for chunk in pipe("Tell me a story", max_new_tokens=200, streamer=True):
    print(chunk["generated_text"], end="", flush=True)
```

Ou use TextStreamer/TextIteratorStreamer para controle fino.

> 💡 **INSIGHT**: Pipeline é para inferência rápida. Para controle total (custom generation, logprobs, prefix caching), use `model.generate()` diretamente. Para produção de alta vazão, considere vLLM, TGI, ou llama.cpp em vez de pipeline.

---

# 7. Treinamento e Fine-Tuning com Transformers Trainer

`Trainer` é a API de alto nível para treinar/fine-tunar. Lida com loop, mixed precision, gradient accumulation, distribuição, evaluation, logging.

## Setup básico

```python
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer
)
from datasets import load_dataset

# Carrega dados
dataset = load_dataset("imdb")

# Modelo
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2
)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Tokeniza
def tokenize(batch):
    return tokenizer(batch["text"], padding=True, truncation=True, max_length=256)

dataset = dataset.map(tokenize, batched=True)

# Args de treino
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    warmup_steps=500,
    logging_steps=100,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    fp16=True,                # Mixed precision
    gradient_accumulation_steps=1,
    gradient_checkpointing=True,  # Para modelos grandes
    report_to="wandb",         # W&B integration
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics_fn,
)

# Treina
trainer.train()

# Salva
trainer.save_model("./meu-modelo")
```

## LoRA / PEFT: fine-tuning eficiente

```python
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.SEQ_CLS,
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 294,912 || all params: 67,584,002 || trainable%: 0.4364

# Agora treine normalmente com Trainer
trainer = Trainer(model=model, args=training_args, ...)
trainer.train()

# Salva só os adapters LoRA
model.save_pretrained("./meu-lora")

# Carrega depois
from peft import PeftModel
base = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
model = PeftModel.from_pretrained(base, "./meu-lora")
```

LoRA: treina 0.5% dos parâmetros, mantém 99% de performance. Pode ser feito em GPU de 16GB.

## DPO / RLHF

```python
from trl import DPOTrainer, DPOConfig

# Para preference learning
dpo_config = DPOConfig(
    output_dir="./dpo",
    beta=0.1,
    max_length=512,
    max_prompt_length=256,
)

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=None,  # Auto-cria
    args=dpo_config,
    train_dataset=preference_dataset,  # {"prompt", "chosen", "rejected"}
    tokenizer=tokenizer,
)

dpo_trainer.train()
```

DPO treina direto em preferências, sem RL. Mais simples que RLHF clássico.

> ⚠️ **CUIDADO**: Fine-tuning de LLMs grandes em uma única GPU sem LoRA é impossível. Use sempre PEFT (LoRA, QLoRA, prefix tuning) para modelos >1B parâmetros. Para modelos 7B+, combine LoRA + 4-bit + gradient checkpointing.

---

# 8. Accelerate: Treinamento Distribuído Sem Código Extra

`accelerate` abstrai a complexidade de DDP, FSDP, mixed precision, device placement. Seu código de treino fica "agnóstico" de paralelismo.

## Setup

```bash
pip install accelerate
accelerate config  # Wizard interativo
```

## Código agnóstico

```python
import torch
from accelerate import Accelerator
from torch.utils.data import DataLoader

accelerator = Accelerator(
    mixed_precision="bf16",
    gradient_accumulation_steps=4,
)

# Prepara objetos (move para device certo, wrappa em DDP)
model, optimizer, train_loader, scheduler = accelerator.prepare(
    model, optimizer, train_loader, scheduler
)

# Loop normal
for batch in train_loader:
    with accelerator.accumulate(model):
        outputs = model(**batch)
        loss = outputs.loss
        accelerator.backward(loss)
        optimizer.step()
        scheduler.step()
        optimizer.zero_grad()
```

`accelerator.prepare` faz a mágica: move para GPU, wrappa em DDP, configura autocast. Seu loop fica idêntico em single-GPU ou 100-GPU.

## Lançando treinamento distribuído

```bash
# Single GPU
python train.py

# Multi-GPU (DDP)
accelerate launch --num_processes=4 train.py

# Multi-node
accelerate launch --num_processes=8 --num_machines=2 \\
    --machine_rank=0 --main_training_ip=10.0.0.1 \\
    train.py

# DeepSpeed (ZeRO-3)
accelerate launch --use_deepspeed --deepspeed_config_file=ds_config.json train.py
```

Mesmo código, escala diferente.

## Config YAML

```yaml
# accelerate_config.yaml
compute_environment: LOCAL_MACHINE
distributed_type: MULTI_GPU
num_processes: 8
mixed_precision: bf16
machine_rank: 0
main_training_ip: 10.0.0.1
main_training_port: 29500
fsdp_config:
  fsdp_auto_wrap_policy: TRANSFORMER_BASED_WRAP
  fsdp_transformer_layer_cls_to_wrap: LlamaDecoderLayer
  fsdp_backward_prefetch: BACKWARD_PRE
  fsdp_forward_prefetch: false
  fsdp_cpu_ram_efficient_loading: true
  fsdp_offload_params: false
  fsdp_sharding_strategy: FULL_SHARD
  fsdp_state_dict_type: SHARDED_STATE_DICT
  fsdp_sync_module_states: true
  fsdp_use_orig_params: true
```

`accelerate launch --config_file accelerate_config.yaml train.py`

## DeepSpeed integration

```python
from accelerate import Accelerator

accelerator = Accelerator(
    mixed_precision="bf16",
    deepspeed_plugin={
        "zero_optimization": {
            "stage": 3,
            "offload_optimizer": {"device": "cpu"},
            "offload_param": {"device": "cpu"},
        },
        "bf16": {"enabled": True},
        "train_batch_size": "auto",
    },
)
```

DeepSpeed ZeRO-3 + CPU offload: treina modelos 70B em poucos GPUs.

> 💡 **INSIGHT**: `accelerate` é o canivete suíço do treinamento distribuído. Antes de aprender DDP manual, FSDP, DeepSpeed, DeepSpeed Ulysses, Megatron — domine accelerate. Em 90% dos casos, é o suficiente. E seu código fica legível.

---

# 9. Diffusers: Geração de Imagens e Áudio

Stable Diffusion, DALL-E, Imagen, Midjourney. A revolução da geração visual rodou em diffusers.

## Instalação

```bash
pip install diffusers transformers accelerate
```

## Stable Diffusion em 5 linhas

```python
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda")

image = pipe("A cat astronaut in space, photorealistic, 8k").images[0]
image.save("cat_astronaut.png")
```

## Negative prompts

```python
image = pipe(
    prompt="A cat astronaut in space, photorealistic, 8k",
    negative_prompt="blurry, low quality, distorted, ugly",
    num_inference_steps=50,
    guidance_scale=7.5,
    height=512,
    width=512,
).images[0]
```

Negative prompt diz o que evitar. Guidance scale balanceia fidelidade ao prompt vs. criatividade.

## Modelos alternativos

```python
# Stable Diffusion XL
from diffusers import StableDiffusionXLPipeline
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
).to("cuda")

# SDXL Turbo (4 steps, real-time)
from diffusers import AutoPipelineForText2Image
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")
image = pipe("A cat", num_inference_steps=1, guidance_scale=0.0).images[0]

# FLUX (novo, melhor qualidade)
from diffusers import FluxPipeline
pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16,
).to("cuda")
```

## ControlNet: condicionamento estrutural

```python
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from diffusers.utils import load_image

controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/sd-controlnet-canny"
)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16,
).to("cuda")

canny_image = load_image("./canny_edge.png")
image = pipe("A modern building", image=canny_image).images[0]
```

ControlNet permite condicionar geração em edges, depth maps, poses, etc. Aplicação: edição precisa, virtual try-on, arquitetura.

## Image-to-image

```python
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda")

init_image = Image.open("input.png").convert("RGB").resize((512, 512))
image = pipe(
    prompt="Watercolor painting of a cat",
    image=init_image,
    strength=0.75,  # 0 = sem mudança, 1 = totalmente novo
).images[0]
```

## Inpainting

```python
from diffusers import StableDiffusionInpaintPipeline

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16,
).to("cuda")

image = pipe(
    prompt="A red apple on a wooden table",
    image=original,
    mask_image=mask,  # Branco = área a modificar
).images[0]
```

Inpainting para editar áreas específicas sem regerar a imagem inteira.

## Audio: Bark, MusicGen

```python
# Text-to-speech
from transformers import pipeline
tts = pipeline("text-to-speech", model="suno/bark")
audio = tts("Hello, this is a test")

# Music
from transformers import pipeline
music = pipeline("text-to-audio", model="facebook/musicgen-large")
audio = music("A calm piano melody with strings")
```

> 🎯 **DICA PRO**: Para geração em escala, não use `pipe` em loop. Use `pipe(..., num_images_per_prompt=4)` para batching, e ative `enable_xformers_memory_efficient_attention()` ou `enable_model_cpu_offload()` para economizar VRAM. Para servir, considere Diffusers + TGI ou seu próprio servidor.

![Diagrama Hub](images/32_diagram_hub.png)
*Figura 9.1 — Ecossistema Hugging Face: hub central + bibliotecas ao redor.*

---

# 10. Spaces, Inference API e o Ecossistema Open Source

O Hub não é só repositório. É plataforma de demos, inferência, treinamento.

## Spaces: apps demo em segundos

```python
# app.py (Gradio)
import gradio as gr
from transformers import pipeline

classifier = pipeline("sentiment-analysis")

def predict(text):
    return classifier(text)[0]

demo = gr.Interface(
    fn=predict,
    inputs=gr.Textbox(placeholder="Digite um texto..."),
    outputs=gr.JSON(),
    title="Analisador de Sentimento",
    description="Powered by Hugging Face Transformers",
)

demo.launch()
```

Faça push para o Hub com `gradio deploy` ou manualmente. Recebe URL pública, GPU grátis (CPU tier), 16GB RAM.

## Inference API: chamar modelo como serviço

```python
import requests

API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": "Bearer hf_..."}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({"inputs": "The answer to the universe is"})
```

Sem deploy, sem GPU, sem dor. Free tier com rate limit. Pro tier com SLA.

## Inference Endpoints: deploy dedicado

```python
from huggingface_hub import create_inference_endpoint

endpoint = create_inference_endpoint(
    name="meu-llama",
    repository="meta-llama/Llama-2-7b-hf",
    framework="pytorch",
    accelerator="gpu",
    instance_type="nvidia-a100",
    instance_size="medium",
    region="us-east-1",
)

# Endpoint pronto em minutos
result = endpoint.client.text_generation("Hello, ")
```

Paga por hora de GPU. Auto-scaling, logs, A/B testing nativos.

## AutoTrain: treinar sem código

Para quem não programa. UI web para:
- Fine-tuning de modelos.
- Treinamento de classificação.
- Treinamento de regressão.
- Treinamento de NER.

## Hub API programático

```python
from huggingface_hub import (
    HfApi, create_repo, upload_file, upload_folder,
    snapshot_download, list_repo_files,
)

api = HfApi()

# Cria repo
create_repo("meu-user/meu-modelo", private=False)

# Upload
upload_file(
    path_or_fileobj="model.safetensors",
    path_in_repo="model.safetensors",
    repo_id="meu-user/meu-modelo",
)

# Download
snapshot_download(
    repo_id="meta-llama/Llama-2-7b-hf",
    local_dir="./llama",
    allow_patterns=["*.json", "*.safetensors"],
)
```

## Datasets Hub: machine learning versionado

Use o Hub como Git para dados. Versionamento, lineage, discussões, issues. DVC sem dependência externa.

## O futuro

Hugging Face em 2026 e além:
- **Inference Providers**: marketplace de inferência (AWS, GCP, Azure, Together, Replicate).
- **Synthetic Data Hub**: datasets sintéticos gerados por modelos.
- **AI Agents Course**: formação em agents, com certificação.
- **HuggingChat**: chat com modelos open source. Concorrente direto do ChatGPT.
- **Hugging Face Expert**: certificação profissional.

> 📌 **MENSAGEM FINAL**: Hugging Face é a infraestrutura sobre a qual o open source AI se constrói. Dominar transformers, datasets, tokenizers, accelerate, e o Hub é o mínimo. Em 2026, profissional de IA que não sabe Hugging Face está em desvantagem. O investimento de tempo retorna 100x.

---

*Por MMN AI-to-AI • Nexus Affil'IA'te MMN_IA • 2026*
