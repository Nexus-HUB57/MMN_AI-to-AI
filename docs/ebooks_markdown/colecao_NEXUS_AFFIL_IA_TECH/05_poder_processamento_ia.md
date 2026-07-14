---
collection: "NEXUS AFFIL'IA'TE TECH — Coletânea Técnica"
volume: 5
roman: "V"
title: "Poder de Processamento IA"
subtitle: "GPU, TPU, NPU, memória, KV cache, inferência, throughput, latência, e o custo oculto — em energia, água e carbono — de cada token gerado."
edition: "Edição Canônica 1.0.0"
issued: "2026-07-14"
authors:
  - "MMN AI-to-AI"
  - "Nexus HUB57"
language: pt-BR
canonical_edition: true
canonical_id: NEXUS_AFFIL_IA_TECH_VOL_05
---

# **NEXUS AFFIL'IA'TE TECH — Coletânea Técnica**

![Capa](../../../assets/ebook_covers/nexus_affil_ia_tech_05_poder_processamento_ia.webp)

## Volume V — Poder de Processamento IA

**GPU, TPU, NPU, memória, KV cache, inferência, throughput, latência, e o custo oculto — em energia, água e carbono — de cada token gerado.**

*Edição Canônica 1.0.0 · 2026-07-14 · MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*

> **Pergunta-âncora:** O que determina, em última instância, o custo, a latência, a viabilidade e a sustentabilidade de um sistema agêntico — e como engenheiros podem otimizar sem cair em ilusões de "GPU mais rápido = sistema melhor"?

---

## Sumário

> 1. A anatomia física: GPU, TPU, NPU e a corrida por FLOPS
> 2. Memória: o gargalo real da inferência moderna
> 3. Inferência em transformers: pré-fill, decode, KV cache
> 4. Throughput, latência e o trade-off fundamental
> 5. Quantização, destilação e o que cada técnica custa em qualidade
> 6. Batching, paralelismo e a lei de Amdahl aplicada a LLMs
> 7. Hardware especializado: o que está mudando em 2026
> 8. O custo escondido: energia, água, carbono e a pegada por token
> 9. Estratégias de provisionamento: comprar, alugar, spot, self-host
> 10. Manifesto: o poder de processamento como decisão de produto, não de TI
>
> Checklist Canônico, Glossário do Volume, Referências e Fechamento Editorial.

---

![Figura 16 — GPU vs TPU vs NPU: arquiteturas em paralelo](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_05_poder_processamento_ia.webp)
*Figura 16 — Três arquiteturas. GPU: milhares de cores generalistas (CUDA), paralelismo massivo. TPU: systolic array, otimizado para matmul, latência determinística. NPU: on-device AI, baixa potência, modelos pequenos. Cada uma tem perfil de uso.*

## 1. A anatomia física: GPU, TPU, NPU e a corrida por FLOPS

A primeira metade da história da IA foi dominada por CPUs. A segunda, por GPUs. A terceira, que vivemos em 2026, é uma conversa de três vozes — **GPU, TPU, NPU** — com **ASICs customizados** subindo como quarta voz. Conhecer a anatomia de cada uma é o que separa engenheiro de "comprador de hardware".

### 1.1 GPU: a máquina de paralelismo de propósito geral

A **Graphics Processing Unit** foi originalmente desenhada para renderizar pixels em paralelo. A virada para IA aconteceu em 2007 com o lançamento do **CUDA** pela NVIDIA, que transformou a GPU em uma plataforma de computação de propósito geral sobre hardware massivamente paralelo.

Anatomia canônica de uma GPU moderna (ex.: NVIDIA H100, B200):

- **Núcleos CUDA** — unidades de execução, milhares por chip. Cada uma faz operações de ponto flutuante em paralelo.
- **Núcleos Tensor** — unidades especializadas em **matmul** (multiplicação de matrizes), a operação que domina o forward pass de um transformer.
- **HBM (High Bandwidth Memory)** — memória de alta带宽 soldada ao chip. 80–192 GB por GPU em 2026.
- **NVLink / NVSwitch** — interconexão entre GPUs, com bandwidth de 600–900 GB/s em 2026.
- **TDP (Thermal Design Power)** — 700–1200 W por GPU em workloads intensos.

Por que GPU venceu IA: **matmul é a operação dominante** em redes neurais, e GPUs são otimizadas para ela. CPU é otimizada para latência de instrução sequencial. A diferença é a diferença entre "1 cavalo forte correndo 1000 metros" e "1000 cavalos fracos correndo 1 metro cada".

### 1.2 TPU: a systolic array do Google

A **Tensor Processing Unit** (Google, 2015+) é desenhada especificamente para **matmul em escala**, com uma arquitetura chamada **systolic array**: dados fluem por uma grade de processadores em ondas, com cada processador multiplicando e acumulando em ritmo, sem precisar ler/escrever memória a cada ciclo.

Vantagens da TPU:

- **Eficiência energética superior à GPU** em workloads puros de matmul (até 2× FLOPs/W).
- **Latência determinística** — ideal para SLA agressivo.
- **Escala via Pods** — interconexão proprietária de alta带宽 para treinar modelos gigantes.

Desvantagens:

- **Ecossistema fechado** — TensorFlow/JAX, com suporte a PyTorch crescendo.
- **Disponibilidade limitada** — Google Cloud, com alocação por região.
- **Menos flexível** — fora de workloads de matmul, TPU perde para GPU.

### 1.3 NPU: a IA no dispositivo

A **Neural Processing Unit** é o nome genérico para chips desenhados para **inferência on-device**: Apple Neural Engine, Qualcomm Hexagon, Google Edge TPU, Intel Movidius, AMD XDNA.

Características canônicas:

- **Baixo TDP** — 5–50 W. Pode operar em bateria.
- **Modelo de tamanho limitado** — 1B–13B parâmetros tipicamente, com quantização agressiva.
- **Latência ultrabaixa** — 10–50 ms para inferência de modelo pequeno.
- **Privacidade por design** — dados não saem do dispositivo.

Caso de uso em 2026: **siri-like, autocomplete, on-device summarization, vision, audio enhancement**. A NPU é **complementar** à GPU/TPU, não substituta. A pergunta "NPU ou GPU?" é categórica errada — a resposta é "**ambos, em camadas**".

### 1.4 ASICs customizados: a quarta voz

A partir de 2024, **vários hyperscalers e startups começaram a desenhar ASICs próprios** para workloads específicos:

- **Trainium 2 / Inferentia 2** (AWS) — Treinamento e inferência, custom ARM + matmul engine.
- **MAIA** (Microsoft) — Inferência, otimizada para transformer.
- **TPU v6 / v7** (Google) — Próxima geração com foco em mixture-of-experts.
- **Groq LPU** — Inferência com latência determinística extrema, sem batches.
- **Cerebras** — Wafer-scale chip, 850k cores, modelo inteiro cabe em um chip.
- **SambaNova** — RDU (Reconfigurable Dataflow Unit), otimizada para transformer com sparsity.

A mensagem de 2026: **GPU não é mais a única opção**; o engenheiro responsável avalia pelo workload, não pelo fornecedor.

### 1.5 FLOPS, memória e bandwidth: o que realmente importa

Três números definem a viabilidade de um workload em um hardware:

- **FLOPS (FLoating-point Operations Per Second).** Capacidade computacional bruta. Determina se o modelo "roda" em tempo hábil.
- **Memória (HBM, DRAM).** Determina se o modelo **cabe** no hardware. Um modelo de 70B em FP16 precisa de ~140 GB só para os pesos; com KV cache e ativações, 200–300 GB. Em 2026, uma única GPU B200 tem 192 GB. Logo, inferência de 70B **cabe**, mas sem folga.
- **Bandwidth (HBM bandwidth, NVLink).** Determina a **velocidade com que dados chegam à unidade de computação**. Em workloads memory-bound (típicos em decode), bandwidth é o gargalo, não FLOPS.

A regra de ferro: **não compre GPU pelo FLOPS. Compre pela memória e bandwidth que seu workload exige**.

---

## 2. Memória: o gargalo real da inferência moderna

A **escassez de memória** é, em 2026, o gargalo dominante da inferência de LLMs. Não FLOPS — memória. E não memória total — **bandwidth** (a velocidade com que dados trafegam entre memória e computação).

### 2.1 A hierarquia de memória

```
Registers      →  ~1 KB  por core, latência 1 ciclo
L1/L2 cache    →  ~64-128 MB por GPU, latência 10-100 ciclos
HBM (GPU)      →  80-192 GB por GPU, bandwidth 3-8 TB/s
DRAM (host)    →  ~1 TB, bandwidth 100-200 GB/s
NVMe storage   →  ~10 TB, bandwidth 10-50 GB/s
```

Em decode de transformer, **cada token gerado precisa acessar todos os pesos do modelo** (matmul). Para um modelo 70B em FP16, são 140 GB lidos por token. Em HBM com 5 TB/s, isso dá **28 ms por token** (teórico, sem overlap). É a parede que define latência de decode.

### 2.2 KV cache: a otimização que define a arquitetura

Em transformer auto-regressivo, cada token gerado precisa carregar a **key** e **value** de todos os tokens anteriores. Para um contexto de 8k tokens, isso é **2 × num_layers × num_heads × head_dim × seq_len** valores — dezenas de GB para modelos grandes.

A **KV cache** armazena esses valores em HBM, evitando recomputação. É o que torna decode rápido. É também o que **limita o comprimento de contexto**: prompt de 1M tokens em modelo 70B pode exigir 100+ GB de KV cache, estourando a HBM de uma única GPU.

### 2.3 As técnicas de redução de memória

Quatro técnicas canônicas, em ordem de impacto e risco:

- **Quantização** — Reduz precisão de FP16 → INT8 → INT4 → INT2. 70B em INT4 ocupa 35 GB, cabe em uma única B200. Custo: pequena perda de qualidade em tarefas difíceis.
- **PagedAttention (vLLM)** — Gerencia KV cache como páginas de memória virtual, evitando fragmentação. Aumenta utilization de 30% para 90%+.
- **Flash Attention** — Reorganiza o cálculo de atenção para minimizar I/O de HBM. 2–4× speedup sem perda de qualidade.
- **Speculative decoding** — Modelo pequeno (draft) propõe tokens; modelo grande verifica em batch. 2–3× speedup de decode com mesma qualidade.

### 2.4 O trade-off memória × throughput

Em inferência, **memória limita batch size**, e **batch size determina throughput**. Em sistemas reais, há um **ponto ótimo** entre latência por request e throughput agregado. Esse ponto depende do workload e do hardware; não há regra universal.

A heurística 2026: **maximizar utilization de HBM em 80–90%**, deixando 10–20% para picos. Utilization < 50% indica mal-ajuste; utilization > 95% indica risco de OOM.

---

## 3. Inferência em transformers: pré-fill, latência e o paradoxo do streaming

Inferência de transformer tem **duas fases** com perfis muito diferentes: **pré-fill** e **decode**.

### 3.1 Pré-fill: computação paralela pesada

O pré-fill processa o **prompt inteiro** em uma única passada. Todos os tokens do prompt são processados em paralelo (matmul densa). É a fase **compute-bound**: dominada por FLOPS, não por memória.

Latência típica de pré-fill (70B em B200, prompt 1k tokens): 100–300 ms. Prompt 8k: 800 ms–2s. Prompt 100k: 10–30s. **Cresce linearmente com comprimento**.

### 3.2 Decode: geração auto-regressiva

O decode gera tokens um por vez. Cada token depende do anterior; não há paralelismo intra-token. É a fase **memory-bound**: dominada por bandwidth, não por FLOPS.

Latência típica de decode (70B em B200): 30–60 ms por token. Para 500 tokens de output, são 15–30s. **Cresce linearmente com comprimento de output**.

### 3.3 O paradoxo do streaming

**Streaming** (enviar tokens à medida que são gerados) reduz a **latência percebida** (Time to First Token, TTFT, fica em 200–500 ms; o usuário vê resposta "imediata"). Mas a **latência total** (Time to Last Token, TTLT) é a mesma. O usuário vê a resposta chegando, mas a resposta leva o mesmo tempo para terminar.

A regra: **streaming é UX; latência total é SLA**. Não confunda.

### 3.4 O cálculo de SLA

Para um sistema com SLA "p95 < 8s para tarefa de 500 tokens de output":

- TTFT alvo: < 1s
- Decode 500 tokens a 50 ms/token: 25s
- **Não fecha SLA**

Solução: **modelo menor** (Haiku 4.5: 15 ms/token) ou **batching maior** (paralelismo entre requests). Ou **aceitar SLA mais fraco** e ser transparente.

### 3.5 O impacto do comprimento de contexto

Contexto longo mata performance. Em 2026, o estado da arte é:

- 8k tokens: **default** da indústria, latência saudável.
- 32k tokens: **aceitável** com Flash Attention, mas latência p95 dobra.
- 128k tokens: **pesado**, requer multi-GPU e KV cache esparsa.
- 1M tokens: **experimental**, latência p99 inaceitável para SLA humano.

A regra: **ofereça contexto longo, mas não finja que é barato**. Em pricing, **cobre por contexto** — tier de preço cresce com janela de contexto.

---

![Figura 17 — Hierarquia de memória e KV cache](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_05_poder_processamento_ia.webp)
*Figura 17 — Hierarquia de memória: registers → L1/L2 → HBM → DRAM → NVMe. KV cache mora em HBM; Flash Attention minimiza seu I/O. O gargalo é bandwidth, não FLOPS.*

## 4. Throughput, latência e o trade-off fundamental

Existe um **trade-off fundamental** em inferência: **throughput vs latência**. Não dá para maximizar ambos. A escolha define arquitetura.

### 4.1 O trade-off em forma de equação

Para um sistema com **batch size B** e **decode latency L_per_token**:

- **Latência por request** ≈ L_per_token (não muda muito com B em regime memory-bound)
- **Throughput** ≈ B / L_per_token (cresce com B, até saturar memória)

Logo: **dobrar B dobra throughput, mas não piora latência** (até B crítico). Acima de B crítico, latência degrada por contenção de memória.

### 4.2 O ponto ótimo na prática

Em produção:

- **Latency-sensitive** (chat, search, completion): batch pequeno (1–8), latência baixa, throughput modesto.
- **Throughput-sensitive** (batch transcription, summary, embeddings): batch grande (32–256), latência alta, throughput alto.
- **Balanced** (SaaS genérico): batch médio (8–32), tuning por SLA.

Otimizadores modernos (vLLM, TGI, TensorRT-LLM) ajustam batch **dinamicamente**: cresce quando há fila, decresce quando há request de baixa latência.

### 4.3 Continuous batching

A **continuous batching** substitui o batching estático (espera N requests, processa juntos, devolve juntos) por **batching dinâmico** (a cada step de decode, o sistema monta batch com os requests ainda em processamento). Resultado: **utilization sobe de 30% para 80%+**, throughput agregado dobra, latência por request cai.

### 4.4 TTFT e TTLT como métricas separadas

- **TTFT (Time to First Token)** — depende de pré-fill e fila. Otimize: prompt curto, modelo pequeno para classificar, fast-path para queries simples.
- **TTLT (Time to Last Token)** — depende de decode e batch. Otimize: speculative decoding, modelo menor, batch maior, KV cache eficiente.

SLA deve distinguir os dois. "Latência p95 < 8s" é ambíguo — p95 do quê?

### 4.5 A regra de ouro do provisionamento

> **Provisione para o pico de SLA aceitável, não para a média.** O p99 dita a infraestrutura. A média é história; o pico é o que derruba o sistema.

Em números: se SLA é p95 < 8s e há 10% de requests que exigem contexto longo, provisione para esses 10% em pico. Não otimize para os 90% que rodam fácil.

---

## 5. Quantização, destilação e o que cada técnica custa em qualidade

Quatro técnicas canônicas de redução de modelo. Cada uma troca **qualidade** por **eficiência**. O engenheiro responsável conhece o preço.

### 5.1 Quantização

Reduz a precisão numérica dos pesos (e, opcionalmente, ativações) do modelo.

- **FP16 → INT8.** Redução de 2× em memória. Perda de qualidade tipicamente < 1% em benchmarks.
- **FP16 → INT4.** Redução de 4×. Perda 1–5% em benchmarks, mais visível em raciocínio e código.
- **FP16 → INT2 (ou binário).** Redução de 8×. Perda 10–20% — modelo útil apenas para tarefas específicas.

Ferramentas canônicas: GPTQ, AWQ, BitsAndBytes, SmoothQuant.

### 5.2 Destilação

Treina um modelo menor (student) para imitar o comportamento de um modelo maior (teacher). O student herda **capacidade**, não só outputs.

- **Distilação de logits** — student aprende a prever a distribuição do teacher, não só a classe final.
- **Distilação de comportamento** — student aprende com traces de raciocínio do teacher.
- **Distilação de traços** — student aprende estilo, não capacidade.

Modelos destilados (ex.: Claude Haiku destilado de Sonnet) podem reter 80–95% da capacidade do teacher com 5–20% do custo.

### 5.3 Pruning (poda)

Remove pesos, atenção heads, ou camadas inteiras que contribuem pouco para a saída.

- **Structured pruning** — remove blocos inteiros (heads, layers). Resultado: modelo menor nativamente. Mais fácil de otimizar.
- **Unstructured pruning** — remove pesos individuais. Resultado: modelo esparso; requer hardware/software com suporte a sparsity.

Em 2026, structured pruning vence em produção; unstructured é pesquisa.

### 5.4 Sparsity

Modelos esparsos têm uma fração de pesos zero, permitindo computação skipada. Sparsity 2:4 (50% zero, estruturado) é suportado por NVIDIA Ampere/Hopper. Sparsity total é research.

### 5.5 Tabela comparativa

| Técnica | Redução memória | Speedup | Perda qualidade | Custo de implementação |
|---|---|---|---|---|
| INT8 | 2× | 1,5–2× | < 1% | Baixo |
| INT4 | 4× | 2–3× | 1–5% | Médio |
| Destilação | 5–20× | 5–20× | 5–20% | Alto (treino) |
| Pruning estruturado | 2–4× | 1,5–3× | 1–5% | Médio |
| Sparsity 2:4 | 2× | 1,5–2× | < 1% | Baixo |
| Combinação | 10–40× | 10–40× | 5–30% | Alto |

A regra: **combinar técnicas**, mas medir o impacto em eval suite a cada passo. Cada técnica degrada algo; a soma das degradações pode ser catastrófica.

---

## 6. Batching, paralelismo e a lei de Amdahl aplicada a LLMs

A **lei de Amdahl** (1967) é o framework canônico para entender paralelismo: o speedup máximo é limitado pela fração serial do sistema.

```
speedup = 1 / (S + (1 - S) / N)
```

onde S é a fração serial e N é o número de processadores paralelos.

### 6.1 Onde está a parte serial em inferência LLM?

- **Setup, tokenização, detokenização, I/O.** ~5% do tempo em workloads otimizados.
- **Sincronização entre estágios.** Em pipelines de decode, o próximo token depende do anterior — serial por natureza.
- **Contenção de memória.** Quando batch é grande, a contenção de HBM cresce, e essa contenção é serial.
- **Overhead de comunicação.** Em multi-GPU, latência de NVLink adiciona overhead serial.

Em 2026, a fração serial de inferência de LLM é **10–30%**. Logo, mesmo com 8 GPUs, speedup máximo é **2,5–6×**. **Amdahl é cruel**.

### 6.2 As formas de paralelismo

Quatro formas canônicas:

- **Data parallelism** — cada GPU processa um batch diferente. Funciona bem em pré-fill; mal em decode.
- **Tensor parallelism** — divide cada peso do modelo entre GPUs. Requer comunicação a cada camada. Bom para pré-fill.
- **Pipeline parallelism** — divide camadas do modelo entre GPUs. Requer pipeline de batches. Bom para decode.
- **Expert parallelism** (para MoE) — divide experts entre GPUs, ativa só os necessários por token. Eficiente para modelos MoE.

A maioria dos sistemas reais combina **tensor + pipeline** (Megatron-style). 2026 vê **expert parallelism** crescendo com popularização de MoE.

### 6.3 O gargalo da comunicação

Em paralelismo multi-GPU, **a comunicação entre GPUs pode dominar a latência**. Em NVLink (900 GB/s, intra-node), overhead é ~5%. Em InfiniBand (400 Gb/s, inter-node), overhead é 15–25%. Em rede Ethernet (100 Gb/s, multi-region), overhead é 40–60%.

A regra: **minimize paralelismo inter-node**. Mantenha o modelo em um único node (8 GPUs), só faça paralelismo inter-node se o modelo não couber.

### 6.4 A ilusão do "8 GPU é 8× mais rápido"

A frase "tenho 8 GPUs H100" não significa "8× mais rápido". Significa "8× mais throughput agregado em workload memory-bound, OU latência reduzida em workload compute-bound se o modelo for paralelo". O engenheiro que confunde isso provisiona errado e queima budget.

---

## 7. Hardware especializado: o que está mudando em 2026

O ano de 2026 traz uma série de mudanças que reorganizam a paisagem de hardware.

### 7.1 NVIDIA Blackwell (B200, GB200)

Sucessor de Hopper (H100). 208 bilhões de transistores, 192 GB HBM3e, 8 TB/s de bandwidth. **2× mais FLOPS FP8** que H100. NVLink de 1,8 TB/s. **TDP 1000W por chip**. Em rack, NVL72 conecta 72 GPUs com 130 TB/s de bandwidth agregado. É o **padrão de fato** para training de fronteira em 2026.

### 7.2 AMD MI400

Concorrente direto do Blackwell. 288 GB HBM3e, 6 TB/s. **CDNA 4 architecture**, otimizada para IA. ROCm amadureceu; suporte a PyTorch em 2026 é **production-grade**, não research. Preço competitivo (60–80% do NVIDIA equivalente). Em workloads de inferência pura, MI400 está perto do Blackwell.

### 7.3 Groq LPU

A **Language Processing Unit** da Groq é desenhada para inferência com **latência determinística**. Não usa HBM; usa **SRAM on-chip**, com bandwidth massiva. Resultado: latência de decode **10–100× menor** que GPU em modelos pequenos. Limitação: capacidade de modelo (modelos grandes não cabem em um chip; precisa de cluster). Posicionamento: **low-latency inference**, não training.

### 7.4 Cerebras WSE

**Wafer-scale** chip, 850k cores, 40 GB SRAM, 20 PB/s de bandwidth. Modelo inteiro cabe em um chip. Latência de inferência baixíssima. Limitação: custo, disponibilidade, modelo de programação proprietário. **Excelente** para inferência de modelo grande em escala.

### 7.5 Apple Silicon (M3, M4) e NPUs on-device

A Apple não compete em data center. Compete em **on-device AI**. M4 Max tem Neural Engine de 38 TOPS, GPU de alto desempenho, e Unified Memory de até 192 GB. Inferência de modelo 70B **quantizado** roda em M4 Max com latência aceitável para apps locais. **Privacidade por design**.

### 7.6 Tabela comparativa 2026

| Hardware | Memória | Bandwidth | FP8 TFLOPS | TDP | Caso de uso |
|---|---|---|---|---|---|
| NVIDIA B200 | 192 GB HBM3e | 8 TB/s | 4.500 | 1000W | Treino e inferência, padrão de fato |
| AMD MI400 | 288 GB HBM3e | 6 TB/s | 3.800 | 750W | Treino e inferência, alternativa |
| Groq LPU | 230 MB SRAM/chip | 80 TB/s | 188 | 300W | Inferência de baixa latência |
| Cerebras WSE-3 | 40 GB SRAM | 20 PB/s | 125 | 15 kW | Inferência de modelo grande, escala |
| Apple M4 Max | 192 GB Unified | 800 GB/s | 30 | 50W | On-device, privacidade |
| TPU v6 | 256 GB HBM | 7 TB/s | 4.000 | 700W | Treino e inferência, Google Cloud |

A mensagem: **escolha pelo workload, não pelo fornecedor**. GPU vence por ecossistema; ASICs vencem por eficiência em nichos; NPU vence em on-device.

---

## 8. O custo escondido: energia, água, carbono e a pegada por token

Cada token gerado tem um custo que vai além do dólar. Tem **energia, água, carbono**. Em 2026, esses custos passam de "preocupação ambiental" para **restrição regulatória** e **vetor de decisão de procurement**.

### 8.1 A conta de energia

Estimativa conservadora para modelo 70B em GPU moderna:

- **Inferência de 1 token** ≈ 0,5–2 joules.
- **Inferência de 1k tokens** ≈ 0,5–2 kWh.
- **Inferência de 1M tokens** ≈ 500–2000 kWh.

Em workload agêntico típico (10M tokens/dia), são **5–20 MWh/dia** — equivalente a **150–600 residências** por dia.

### 8.2 A conta de água

Data centers tradicionais usam água para resfriamento. Estimativa:

- **1 kWh de computação** ≈ 1–3 litros de água (varia por região e tecnologia de resfriamento).
- **10 MWh/dia** ≈ 10.000–30.000 litros/dia — volume não-negligível.

Regiões com estresse hídrico (Arizona, Oriente Médio, partes do Brasil) impõem **limites de uso de água** em novos data centers.

### 8.3 A conta de carbono

A pegada de carbono depende da matriz energética da região. Em região com matriz limpa (Noruega, Quebec, hidrelétrica brasileira), **0,1–0,5 kg CO₂ por MWh**. Em região com matriz fóssil (Polônia, India, partes do Texas), **500–1000 kg CO₂ por MWh**.

A diferença é **1000×**. Provisionar workload em região com matriz limpa **muda o jogo** da sustentabilidade.

### 8.4 A pegada por feature

Cada feature de produto tem uma pegada. Features de inferência pesada (RAG premium, agents multi-call) custam 10–100× mais em energia que features de inferência leve. **Pricing que ignora pegada ambiental é pricing incompleto**.

### 8.5 O que a indústria está fazendo

- **Hyperscalers comprometendo-se com 24/7 carbon-free energy** em algumas regiões.
- **PPA (Power Purchase Agreements)**: data center compra energia renovável diretamente.
- **Liquid cooling**: reduz PUE de 1,5 para 1,05.
- **Workload shifting**: mover inferência para regiões com matriz limpa em horários de pico.
- **Model optimization**: quantização, destilação, sparsity reduzem energia por token em 2–10×.

### 8.6 A regra da transparência

> **SaaS IA maduro reporta, periodicamente, a pegada ambiental do produto: tokens processados, MWh consumidos, toneladas de CO₂, m³ de água.** Transparência ambiental vira parte do transparency report.

---

![Figura 18 — O custo escondido de cada token: energia, água, carbono](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_05_poder_processamento_ia.webp)
*Figura 18 — Cada token carrega custo energético, hídrico e de carbono. Provisionar em região limpa + otimizar modelo + reportar pegada = SaaS IA ambientalmente responsável. Em 2026, isso é diferencial competitivo, não nice-to-have.*

## 9. Estratégias de provisionamento: comprar, alugar, spot, self-host

Quatro modelos canônicos de provisionamento. Cada um com perfil de risco, custo e operacional diferente.

### 9.1 On-demand (alugar por hora)

Pagar pelo uso, sem compromisso. Ideal para **workload variável** com picos imprevisíveis. Custo por hora é alto (US$ 2–8/h por H100 em 2026), mas elasticidade é máxima.

Quando usar: workloads em escala pequena, validação, tráfego imprevisível.

### 9.2 Reserved / committed use

Compromisso de 1–3 anos, com desconto de 30–60% sobre on-demand. Pagamento adiantado ou mensal. Ideal para **workload estável**.

Quando usar: produção em escala, workloads conhecidos, margens apertadas.

### 9.3 Spot / preempção

Capacidade não-utilizada do hyperscaler, com **desconto de 60–80%**, mas pode ser **preemptada** (interrompida) com aviso de 30s a 2 min. Ideal para **workload tolerante a interrupção**: batch, treino, inferência com checkpoint.

Quando usar: treino, batch inference, workload assíncrono, evals.

### 9.4 Self-host

Comprar hardware, instalar em colocation ou on-prem, operar o time. Custo fixo alto, custo variável baixo. Ideal para **compliance, latência, previsibilidade, escala muito grande**.

Quando usar: enterprise com dados sensíveis, workload massivo (>10M tokens/dia), requisitos de latência que cloud não atende.

### 9.5 Tabela comparativa

| Modelo | Custo por hora (H100) | Compromisso | Risco operacional | Caso de uso |
|---|---|---|---|---|
| On-demand | US$ 2–8 | Nenhum | Baixo | Validação, escala variável |
| Reserved | US$ 0,8–3 | 1–3 anos | Médio | Produção em escala |
| Spot | US$ 0,4–1,5 | Nenhum | Alto (preempção) | Batch, treino, async |
| Self-host | US$ 0,3–1,0 (amortizado) | Capex alto | Muito alto (operação) | Enterprise, escala massiva |

### 9.6 A estratégia híbrida

A maioria dos SaaS IA maduros opera **híbrido**: reserved como base, on-demand para pico, spot para batch, self-host em região-chave para latência. A composição depende do workload; o engenheiro responsável modela a curva de carga e provisiona cada fatia com a ferramenta certa.

### 9.7 O que NÃO provisionar

Provisionamento ruim é comum. Erros canônicos:

- **Self-host antes de ter escala.** Operar GPU sem workload suficiente é queimar dinheiro.
- **Reserved sem commit de 1 ano.** Compromisso curto não dá desconto real.
- **Spot para workload síncrono.** Preempção em request de baixa latência = SLA quebrado.
- **On-demand para treino de uma semana.** Reservar 1 mês é metade do preço.

A regra: **modele a carga antes de provisionar**. Cada workload tem o lugar certo.

---

## 10. Manifesto: o poder de processamento como decisão de produto, não de TI

Fecha-se o volume com um manifesto que reposiciona o hardware como **decisão de produto**, não decisão de TI.

### 10.1 Manifesto da memória primeiro

> "A primeira pergunta de provisionamento não é 'quanto FLOPS eu preciso'. É 'quanto o modelo ocupa em memória, e qual bandwidth eu preciso para servir meu SLA'. Memória e bandwidth definem viabilidade; FLOPS é secundário."

### 10.2 Manifesto do workload antes do fornecedor

> "Hardware é otimizado para workload, não para fornecedor. GPU vence por ecossistema; ASIC vence por eficiência em nichos; NPU vence on-device. A escolha é técnica, não tribal."

### 10.3 Manifesto da latência separável

> "TTFT e TTLT são métricas separadas. SLA deve distinguir. Otimizar a primeira (fast-path, modelo pequeno) é diferente de otimizar a segunda (batching, decode eficiente)."

### 10.4 Manifesto do streaming como UX, não como performance

> "Streaming reduz latência percebida, não latência total. Não confunda. Streaming é ferramenta de UX; SLA é métrica de tempo real. Cada uma com seu número."

### 10.5 Manifesto do batch dinâmico

> "Continuous batching é o padrão de 2026. Batching estático desperdiça 30–70% da capacidade. Otimizadores modernos ajustam batch on-line, a cada step. Adote."

### 10.6 Manifesto da quantização medida

> "Cada nível de quantização tem custo de qualidade. INT8 é quase grátis; INT4 tem custo; INT2 é nicho. Meça com eval suite antes de cada decisão. Não acredite em slideware."

### 10.7 Manifesto da sustentabilidade reportada

> "Energia, água, carbono são reportados. Não estimados; medidos. SaaS IA maduro publica pegada por tenant, por região, por modelo. Transparência ambiental vira parte do transparency report."

### 10.8 Manifesto do provisionamento modelado

> "Provisionamento é modelagem de carga, não escolha de fornecedor. On-demand, reserved, spot, self-host têm lugar. A composição é híbrida; cada workload no lugar certo."

### 10.9 Manifesto do hardware como produto

> "Decisão de hardware é decisão de produto, não decisão de TI. Latência p95, custo por token, pegada ambiental — tudo é feature, tudo é commitment. Produto maduro envolve CTO, COO e Head of Sustainability, não só engineering."

### 10.10 A regra final

> **"A infraestrutura não é o custo do produto — é o produto. Em SaaS IA, o que se vende é, em última instância, a capacidade de transformar tokens em valor. E essa capacidade é inteiramente função do hardware, do modelo e da arquitetura que o servem. Tratar infraestrutura como commodity é tratar o produto como commodity."**

---

## Checklist Canônico — Poder de Processamento IA

- [ ] Hardware escolhido por **workload**, não por fornecedor.
- [ ] **Memória** dimensionada para o maior modelo em produção + folga de 20%.
- [ ] **Bandwidth HBM** conhecida e usada como gargalo de design.
- [ ] **TTFT e TTLT** medidos separadamente, com SLA explícito para cada.
- [ ] **Continuous batching** implementado (vLLM, TGI, TensorRT-LLM).
- [ ] **Quantização** avaliada com eval suite, com trade-off documentado.
- [ ] **Flash Attention** habilitado (ganho de 2–4× sem perda).
- [ ] **PagedAttention / KV cache** otimizado (utilization > 80%).
- [ ] **Speculative decoding** considerado para workloads latency-sensitive.
- [ ] **Paralelismo** dimensionado para workload (data, tensor, pipeline, expert).
- [ ] **Paralelismo inter-node** minimizado; preferência por intra-node.
- [ ] **Bandwidth inter-GPU** (NVLink) verificada; overhead de comunicação medido.
- [ ] **Modelo de provisionamento** modelado: on-demand + reserved + spot + self-host.
- [ ] **Reserved** usado para carga base; **on-demand** para pico; **spot** para batch.
- [ ] **Self-host** considerado apenas para escala > 10M tokens/dia ou compliance.
- [ ] **Energia, água, carbono** medidos e reportados por região, por tenant, por modelo.
- [ ] **Matriz energética** da região considerada em decisão de provisionamento.
- [ ] **Destilação** avaliada para workloads tolerantes a perda de capacidade.
- [ ] **Pruning estruturado** avaliado para modelos próprios.
- [ ] **SLA probabilístico** declarado: TTFT, TTLT, throughput, disponibilidade.
- [ ] **Pre-warming** de capacidade implementado para pico de tráfego.
- [ ] **Capacity planning** revisado trimestralmente, com forecast de 6 meses.
- [ ] **Hardware como decisão de produto** envolvendo CTO, COO, Head of Sustainability.

## Glossário do Volume

- **FLOPS** — Floating-point Operations Per Second; capacidade computacional.
- **HBM** — High Bandwidth Memory; memória de alta bandwidth soldada ao chip.
- **Bandwidth** — taxa de transferência de dados entre memória e computação.
- **Latency-bound vs compute-bound** — quando a operação é limitada por latência de memória ou por FLOPS.
- **KV cache** — cache de keys e values em transformer auto-regressivo.
- **PagedAttention** — gerenciamento de KV cache como páginas (vLLM).
- **Flash Attention** — implementação de atenção com mínimo I/O de HBM.
- **Speculative decoding** — modelo draft propõe, modelo target verifica em batch.
- **Pré-fill** — fase de processamento paralelo do prompt.
- **Decode** — fase auto-regressiva, token a token.
- **TTFT (Time to First Token)** — latência até primeiro token.
- **TTLT (Time to Last Token)** — latência até último token.
- **Continuous batching** — batching dinâmico, montado a cada step.
- **Quantização** — redução de precisão numérica (FP16 → INT8 → INT4).
- **Destilação** — student aprende com teacher; capacidade, não só outputs.
- **Pruning (poda)** — remoção de pesos/heads/camadas de baixa contribuição.
- **Sparsity** — modelo esparso, com fração de pesos zero.
- **Lei de Amdahl** — speedup limitado por fração serial do sistema.
- **Data parallelism** — cada GPU processa batch diferente.
- **Tensor parallelism** — divide pesos do modelo entre GPUs.
- **Pipeline parallelism** — divide camadas do modelo entre GPUs.
- **Expert parallelism** — divide experts (MoE) entre GPUs.
- **CUDA** — plataforma de computação paralela da NVIDIA.
- **TPU (Tensor Processing Unit)** — ASIC do Google, otimizado para matmul.
- **NPU (Neural Processing Unit)** — chip on-device para inferência.
- **ASIC** — Application-Specific Integrated Circuit.
- **GPU (Graphics Processing Unit)** — hardware de paralelismo de propósito geral.
- **TDP (Thermal Design Power)** — potência térmica dissipada.
- **NVLink / NVSwitch** — interconexão de alta bandwidth da NVIDIA.
- **InfiniBand** — interconexão de alta bandwidth para HPC.
- **PUE (Power Usage Effectiveness)** — eficiência energética de data center.
- **PPA (Power Purchase Agreement)** — compra direta de energia renovável.
- **On-demand** — pagamento por hora, sem compromisso.
- **Reserved** — compromisso de 1–3 anos com desconto.
- **Spot** — capacidade preemptiva com desconto alto.
- **Self-host** — hardware próprio, em colocation ou on-prem.
- **Capacity planning** — planejamento de capacidade de computação.
- **Pre-warming** — pré-aquecimento de capacidade para pico de tráfego.
- **SLA probabilístico** — SLA que inclui métricas com variância (TTFT, TTLT, throughput).
- **ECE (Expected Calibration Error)** — métrica de calibração de confidence.
- **Drift** — mudança de distribuição de output ou workload ao longo do tempo.
- **Matriz energética** — composição da geração de energia de uma região.
- **Pegada por token** — energia, água, carbono consumidos por token gerado.
- **Workload** — padrão de uso do sistema (latency-sensitive, throughput-sensitive, batch).

## Fechamento Editorial

Este volume é o **último da coletânea NEXUS AFFIL'IA'TE TECH** — e propositadamente. A discussão de hardware fecha o ciclo: começamos pela orquestração (como agentes cooperam), passamos pela senciência (o que emerge da cooperação), pela autonomia (o que delegamos), pelo SaaS (como isso vira produto), e terminamos na infraestrutura (o que torna tudo possível).

A mensagem de fechamento é unificada: **não dá para discutir IA em 2026 sem discutir hardware, sem discutir custo, sem discutir sustentabilidade**. As decisões de produto, as decisões éticas, as decisões de governança — todas encontram, em última instância, o mesmo ponto: **a camada física que processa cada token**.

Engenheiros, operadores, fundadores e pesquisadores que ignoram essa camada estão construindo sobre uma abstração que vai cobrar seu preço. Os que a tratam como **decisão de primeira ordem** constroem produtos que escalam, duram, e podem ser defendidos sob qualquer lente — técnica, econômica ou ética.

Esse é o poder de processamento. E é um poder que, mal usado, é o perigo mais silencioso da nossa era.

---

*NEXUS AFFIL'IA'TE TECH · Volume V · Edição Canônica 1.0.0 · 2026-07-14*
*MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*
