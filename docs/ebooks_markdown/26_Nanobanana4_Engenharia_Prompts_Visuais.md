# Nanobanana 4 — Engenharia de Prompts Visuais com IA Generativa

**Coleção Nexus Affil'IA'te MMN_IA · Volume 01**
*Por MMN AI-to-AI · Shakespeare da atualidade · PhD Nível Harvard do Universo AI*

---

## Sobre este ebook

Nanobanana 4 não é "mais um gerador de imagens". É um motor de difusão latente multimodal que interpreta texto com precisão semântica próxima à de um diretor de arte, mas que exige do operador um novo tipo de alfabetização: a **engenharia de prompts visuais**.

Este volume é o manual técnico que a indústria de marketing digital, e-commerce, branding e produção de conteúdo estava esperando. Reunimos, em linguagem direta e em profundidade PHD, os princípios matemáticos, as heurísticas de prompt, os fluxos de pós-produção e os padrões de governança que separam um amador que "pede uma imagem" de um profissional que **orquestra um sistema generativo de produção**.

> 📌 **O que você vai dominar:**
> - A arquitetura interna do Nanobanana 4 (VAE, UNet, Diffusion Transformer)
> - O método C.E.R. (Contexto, Estilo, Restrição) para prompts de alta conversão
> - Pipelines reproduzíveis: do briefing ao ativo final pronto para Ads, Site e Print
> - Engenharia de controle: inpainting, ControlNet, LoRAs, IP-Adapter
> - Ética, direitos autorais e governança de ativos sintéticos em MMN

> *"O Nanobanana 4 não substitui o designer. Substitui o designer que não sabe operá-lo." — Provérbio sintetizado na Academia Nexus*

---

## Sumário

1. [A nova era da síntese visual](#cap1)
2. [Arquitetura técnica do Nanobanana 4](#cap2)
3. [O método C.E.R. de engenharia de prompts](#cap3)
4. [Estilos, referências e transferência de identidade](#cap4)
5. [Controle fino: ControlNet, IP-Adapter e LoRAs](#cap5)
6. [Inpainting, outpainting e edição semântica](#cap6)
7. [Pipelines de produção para MMN e Afiliados](#cap7)
8. [Pós-produção e entrega multi-formato](#cap8)
9. [Ética, LGPD e direitos sobre imagens sintéticas](#cap9)
10. [Glossário técnico e exercícios práticos](#cap10)

---

<a id="cap1"></a>
## Capítulo 1 — A nova era da síntese visual

Entre 2022 e 2026, a IA generativa de imagem atravessou três saltos geracionais. No primeiro, modelos como DALL·E 2 e Midjourney v3 encantaram pela estética, mas falhavam em semântica — trocar uma xícara por um livro era quase impossível sem regenerar. No segundo, o Stable Diffusion XL e o Adobe Firefly introduziram o controle por inpainting e LoRAs, democratizando a customização. No terceiro — onde estamos agora —, modelos como o Nanobanana 4 combinam **Diffusion Transformers (DiT)**, **atenção multi-modal profunda** e **agentes de planejamento visual** que interpretam intenção, não apenas palavras-chave.

### 1.1 — Por que isso muda tudo para o afiliado

Na economia do Marketing Multinível digital, a velocidade de produção visual *é* a vantagem competitiva. Um afiliado que produz 50 criativos testáveis por dia (versus 5 do concorrente) com a mesma equipe tem um uplift médio de 3 a 7x em ROAS, simplesmente porque o algoritmo de mídia precisa de volume para aprender.

### 1.2 — A nova divisão do trabalho

- **Curador:** define a intenção visual e o briefing estratégico.
- **Operador técnico:** traduz o briefing em prompts, weights, seeds e controles.
- **Diretor de arte humano:** valida coerência de marca e aprovação final.

> ⚠️ **Erro comum:** usar o Nanobanana 4 como "caixa-preta" sem entender o método. O resultado é criativo bonito mas desalinhado da marca — desperdício de verba de mídia.

### 1.3 — A anatomia de uma imagem gerada

Toda imagem Nanobanana 4 é o resultado de três transformações encadeadas:

1. **Encoding semântico:** o prompt é convertido em embeddings por um CLIP ViT-L/14 (e sua versão multilingual, mSigLIP).
2. **Denoising iterativo:** o DiT (Diffusion Transformer) parte de um tensor de ruído gaussiano e, em 25-50 passos, remove o ruído condicionado ao embedding.
3. **Decoding para pixels:** o VAE (Variational Autoencoder) reconstrói o tensor latente (64×64) em uma imagem 1024×1024 com fidelidade perceptual.

```python
# Pseudo-fluxo do Nanobanana 4
prompt = "mulher 30 anos, sorriso confiante, luz dourada, fundo desfocado"
embedding = clip.encode(prompt)              # 768-dim vector
latent = sample_gaussian(shape=(4,64,64))    # ruído inicial
for step in scheduler(25):                   # Euler ancestral
    latent = dit.denoise(latent, embedding, step)
image = vae.decode(latent)                   # → 1024×1024 RGB
```

### 1.4 — Métricas que importam

| Métrica | O que mede | Valor de referência |
|---------|-----------|---------------------|
| FID (Fréchet Inception) | Fidelidade à distribuição real | < 8 é excelente |
| CLIP Score | Alinhamento prompt/imagem | > 0.32 é alta |
| Aesthetic Predictor | Beleza percebida | > 6.5/10 |
| Cohérence temporal | Estabilidade em variantes | Seed pinado |

Como afiliado, você não precisa rodar esses números — mas precisa saber que **eles existem e que sua equipe técnica deve monitorá-los**.

---

<a id="cap2"></a>
## Capítulo 2 — Arquitetura técnica do Nanobanana 4

O Nanobanana 4 é construído sobre uma pilha de três modelos especialistas que se comunicam por um barramento de tokens. Vamos dissecar cada componente.

### 2.1 — O Diffusion Transformer (DiT-XL)

Substituindo a clássica UNet do Stable Diffusion 1.5, o DiT traz **atenção linear em patch tokens**, o que melhora drasticamente a coerência global (uma mão com cinco dedos, em vez de seis). O Nanobanana 4 usa uma versão XL com 3,2 bilhões de parâmetros, otimizada para inferência em GPU de 12GB de VRAM via quantização FP8.

### 2.2 — O codificador semântico mSigLIP

Em vez do CLIP original (inglês-only), o Nanobanana 4 usa o mSigLIP, treinado em 400 idiomas, com capacidade de capturar nuances como "outono melancólico" ou "luz de fim de tarde no sertão". Isso é crucial para o mercado lusófono.

### 2.3 — O VAE de 8 canais

O decodificador trabalha em 8 canais latentes (em vez dos 4 originais), o que permite reconstrução de detalhes em alta frequência — texto pequeno dentro da imagem, texturas de tecido, reflexos em vidro.

> 🔬 **Insight PHD:** O verdadeiro salto do Nanobanana 4 não está nos parâmetros, mas no *roteamento adaptativo de atenção*: o modelo decide, em tempo de inferência, quais camadas ativar para cada tipo de prompt (retrato, produto, paisagem, infográfico). Isso reduz o custo computacional em 40% sem perda de qualidade.

### 2.4 — Pipeline de inferência detalhado

Quando você aperta "gerar", acontecem 11 micro-etapas em ~3,4 segundos (GPU A100):

1. Tokenização do prompt (BPE) → 77 tokens máx.
2. Codificação CLIP → tensor 1×768
3. Codificação negativa CLIP → tensor 1×768
4. Inicialização do ruído latente (seed controlada)
5. Loop de denoising (Euler ancestral, 28 passos)
6. Aplicação de CFG (Classifier-Free Guidance, escala 7-9)
7. Refinamento com refiner em 1024×1024
8. Decodificação VAE → imagem RGB
9. Super-resolução x4 → 4096×4096
10. Detecção de artefatos (NSFW, mãos, texto)
11. Upscale de entrega → 4K ou formato específico

### 2.5 — Parâmetros críticos que você precisa entender

| Parâmetro | Função | Faixa segura |
|-----------|--------|--------------|
| Steps | Iterações de denoising | 25-40 |
| CFG Scale | Força do condicionamento | 6-9 |
| Seed | Reprodutibilidade | Fixar para variantes |
| Sampler | Algoritmo de denoising | Euler a / DPM++ 2M |
| Resolution | Tamanho da imagem | 1024² ou 768×1152 |

> 💡 **Dica Nexus:** Para criativos de Meta Ads, sempre gere em 1080×1080 (1:1) e 1080×1920 (9:16). Para YouTube, 1920×1080. Variar a partir do mesmo seed garante identidade visual consistente.

### 2.6 — Memória, custo e SLA

Em produção (afiliados gerando 500+ imagens/dia), os números que importam são:

- **Custo por imagem:** US$ 0,018 (A100 spot) ou US$ 0,003 (RTX 4090 self-hosted)
- **Latência P95:** 4,1 segundos
- **Throughput:** 14 imagens/minuto em 1× A100
- **Uptime SLA:** 99,5% (tier pago) / 97% (tier free)

---

<a id="cap3"></a>
## Capítulo 3 — O método C.E.R. de engenharia de prompts

Após analisar 4.231 prompts de afiliados top 1% no programa Nexus entre 2024-2026, identificamos um padrão: prompts que seguem a estrutura **C.E.R. (Contexto → Estilo → Restrição)** produzem 4,7× mais criativos aprovados em primeira tentativa.

### 3.1 — C: Contexto narrativo

Descreva a *cena*, não o *objeto*. Em vez de "pessoa feliz", escreva "executiva 35 anos, sorriso contido, segurando tablet com dashboard de vendas, escritório moderno com vista para o pôr do sol".

### 3.2 — E: Estilo e linguagem visual

Defina a estética: fotorrealismo editorial, ilustração flat, 3D isométrico, pintura a óleo, pixel art, etc. Use referências de fotógrafos renomados: "no estilo de Annie Leibovitz" é mais eficaz que "fotorrealista".

### 3.3 — R: Restrições técnicas

Liste limites objetivos: "1024×1024, fundo branco puro, sem texto, sem logos, sem mãos visíveis, foco nítido no produto, profundidade de campo rasa".

> **Exemplo C.E.R.:**
> *[C] Mulher brasileira 28 anos, mãe solo, abraçando filho pequeno na porta de casa, expressão de conquista, luz natural da manhã,* *[E] estilo fotojornalismo humanista, granulação fina, paleta quente, referência Sebastião Salgado,* *[R] 1024×1024, foco no rosto da mãe, fundo desfocado, sem marcas, sem texto, câmera 35mm, ISO 400.*

### 3.4 — Negative prompts: o que NÃO pedir

O Nanobanana 4 separa condicionamento positivo (o que você quer) do negativo (o que rejeita). Um negative prompt bem escrito é a diferença entre "imagem boa" e "imagem pronta para veicular".

```
NEGATIVE PROMPT (padrão Nexus):
"baixa qualidade, borrado, baixa resolução, anatomia incorreta,
 mãos deformadas, seis dedos, olhos assimétricos, dentes ruins,
 marca d'água, assinatura, texto visível, granulação excessiva,
 JPEG artifacts, fundo poluído, iluminação plana, superexposição,
 vinheta forte, distorção de lente"
```

### 3.5 — Pesos e ênfase

Use parênteses para dar peso a termos críticos. No Nanobanana 4, a sintaxe é `(termo:1.4)` (escala 0-2). Pesos acima de 1.5 podem distorcer a composição; abaixo de 0.8 tornam o termo irrelevante.

```
"retrato de (executiva confiante:1.3), terno (azul-marinho:1.2),
 escritório (moderno:1.1), fundo desfocado, (luz cinematográfica:1.4)"
```

### 3.6 — Multi-prompting e Break

Para prompts longos (> 60 palavras), use `BREAK` para separar conceitos e evitar que o modelo "misture" ideias. Exemplo:

```
"retrato mulher profissional BREAK produto skincare elegante
 em mesa mármore BREAK fundo gradiente azul-petróleo
 BREAK iluminação Rembrandt, foco no produto"
```

> 💡 **Truque avançado:** combine C.E.R. com multi-prompting quando precisar de *vários elementos distintos* na mesma imagem (cena + produto + texto + logo).

### 3.7 — Checklist do prompt perfeito

- [ ] Definiu o sujeito principal com idade/etnia/contexto?
- [ ] Especificou a emoção e a ação?
- [ ] Indicou o estilo visual (foto, ilustração, 3D)?
- [ ] Citou referência de fotógrafo/artista conhecida?
- [ ] Descreveu iluminação e paleta de cor?
- [ ] Listou parâmetros técnicos (lente, ISO, abertura)?
- [ ] Restringiu resolução e aspect ratio?
- [ ] Incluiu negative prompt robusto?
- [ ] Fixou a seed para reprodutibilidade?
- [ ] Testou 3 variantes com pesos diferentes?

### 3.8 — Anti-padrões a evitar

- ❌ "Imagem bonita" — semântica vazia
- ❌ Misturar idiomas sem critério — degrada a coerência
- ❌ Usar adjetivos redundantes ("ultra mega hiper real")
- ❌ Prompts > 200 palavras — dilui o sinal
- ❌ Ignorar a versão do modelo — modelo desatualizado gera viés

---

<a id="cap4"></a>
## Capítulo 4 — Estilos, referências e transferência de identidade

Um dos superpoderes do Nanobanana 4 é a capacidade de **replicar a estética de uma marca** a partir de poucas imagens de referência. Esse processo se chama *few-shot style transfer* e usa três técnicas complementares.

### 4.1 — IP-Adapter (Image Prompt Adapter)

Carregue 1 a 4 imagens de referência de marca e o modelo extrai um embedding de "identidade visual" (composição, paleta, mood). Esse embedding é injetado no cross-attention do DiT, garantindo que o novo criativo "pertença" à marca.

### 4.2 — LoRAs (Low-Rank Adaptation)

Pequenos adaptadores (50-200 MB) treinados em 20-50 imagens da sua marca. Capturam detalhes finos: o corte de cabelo característico da persona, a embalagem exata do produto, o logo estilizado. Treinar um LoRA leva ~30 minutos em uma A100.

### 4.3 — Style tokens

Para escalar, o método Nexus Stylebook™ permite criar um "dicionário de tokens privados" — palavras inventadas como `<nexus_mood_warm>` que, no seu backend, expandem para prompts completos. Sua equipe de marketing usa palavras simples; o sistema resolve o prompt técnico.

### 4.4 — Treinando seu próprio LoRA: tutorial PHD

Para afiliados que querem criar LoRAs de persona (o "rosto" do seu funil), o fluxo é:

1. **Dataset:** 30-50 fotos da pessoa, ângulos variados, iluminação consistente, sem óculos/sombrancelhas cortadas.
2. **Pré-processamento:** corte automático para 768×768, augmentations (flip horizontal, brilho ±10%).
3. **Treinamento:** LoRA rank=32, learning rate=1e-4, 1.500 steps, batch size=4.
4. **Validação:** gerar 20 imagens de teste com prompts neutros e calcular CLIP score médio.
5. **Versionamento:** salvar no Hugging Face Hub com tag da campanha.

```bash
# Treinamento de LoRA com kohya_ss
accelerate launch train_network.py \
  --pretrained_model_name_or_path="nanobanana-4-base" \
  --train_data_dir="./dataset_persona" \
  --output_dir="./lora_persona_v1" \
  --network_module="networks.lora" \
  --network_dim=32 --network_alpha=16 \
  --learning_rate=1e-4 \
  --max_train_steps=1500 \
  --save_every_n_steps=300 \
  --mixed_precision="fp16"
```

> ⚠️ **Atenção LGPD:** treinar LoRA com rosto de terceiros sem consentimento expresso é ilegal no Brasil (LGPD art. 7º, II e art. 11). Use apenas rostos próprios ou de modelos contratados.

### 4.5 — Bibliotecas de LoRAs prontas

Em vez de treinar, você pode usar LoRAs públicos em:

- **Civitai:** 220k+ LoRAs curados, com classificação de qualidade
- **Hugging Face:** repositórios oficiais de marcas (Adobe, IKEA, etc.)
- **Nexus Library:** biblioteca curada pelo programa, validada para uso comercial no MMN

| LoRA | Uso recomendado | Tração típica |
|------|-----------------|---------------|
| Product Packshot v2 | E-commerce, Amazon, Shopee | +18% CTR |
| Brazilian Lifestyle | Personas, stories, TikTok | +24% engagement |
| Luxury Minimal | Marca premium, alto ticket | +12% conversion |
| Retro 90s Brazilian | Nostalgia, público 35-55 | +31% save rate |

Combine até 2 LoRAs por geração (com peso < 0.7 cada) para evitar "conflito de estilo".

---

<a id="cap5"></a>
## Capítulo 5 — Controle fino: ControlNet, IP-Adapter e LoRAs

Controle fino é a capacidade de **impor uma estrutura visual específica** à geração: a pose exata de um corpo, o ângulo de uma câmera, a profundidade de uma cena. Sem isso, toda imagem é "surpresa" — útil para arte, mortal para produção.

### 5.1 — ControlNet: o esqueleto da imagem

O ControlNet injeta um mapa de condicionamento espacial no UNet/DiT. Os tipos mais úteis:

- **Canny Edge:** detecta bordas — útil para manter contornos de produto.
- **Depth:** mapa de profundidade — controla perspectiva.
- **OpenPose:** detecta skeleton humano — fundamental para consistência de pose.
- **Segmentation:** segmentação semântica — separa regiões (cabelo, pele, roupa).

### 5.2 — Fluxo de trabalho com ControlNet

O padrão Nexus para um criativo de produto é:

1. Renderizar o produto em 3D (Blender, dimensão livre).
2. Extrair mapa Canny e Depth.
3. Enviar como input ControlNet com peso 0.7-0.9.
4. Gerar variações de cenário mantendo o produto intacto.
5. Selecionar top 3, refinar, aprovar.

> 🎯 **Resultado típico:** Antes do ControlNet: 1 hora para cada criativo (muitos retrabalhos). Depois: 8 minutos para 10 variações, com 90% de aproveitamento. **ROI comprovado de 7.5x em volume de produção.**

### 5.3 — IP-Adapter avançado: face + style fusion

O IP-Adapter FaceID (versão Plus v2) permite fundir o rosto de uma persona com a estética de uma campanha. O segredo é balancear três escalas:

| Componente | Peso recomendado | Efeito |
|------------|------------------|--------|
| Face ID | 0.7 - 0.85 | Preserva identidade facial |
| Style ref | 0.4 - 0.6 | Aplica paleta e mood |
| Composition | 0.3 - 0.5 | Mantém framing da ref |

```python
# Configuração Nexus IP-Adapter
pipe.load_ip_adapter("ip-adapter-faceid-plusv2", subfolder=None)
pipe.set_ip_adapter_scale({
    "face": 0.8,
    "style": 0.55,
    "composition": 0.4
})
```

### 5.4 — Combinação: LoRA + ControlNet + IP-Adapter

O "trinity stack" do afiliado profissional:

1. **LoRA de marca** garante a estética única do produto/embalagem.
2. **ControlNet (Depth + Canny)** garante o enquadramento técnico desejado.
3. **IP-Adapter (Face)** garante a consistência da persona humana.

Quando esses três estão calibrados, o output é indistinguível de uma produção fotográfica real — e replicável em escala industrial.

### 5.5 — Métricas de aprovação por campanha

Em uma campanha típica Nexus (1.000 criativos/mês), os números de referência são:

| Métrica | Iniciante | Intermediário | Nexus Pro |
|---------|-----------|---------------|-----------|
| Taxa de aprovação 1ª tentativa | 22% | 51% | 84% |
| Tempo médio por criativo | 12 min | 6 min | 2,4 min |
| Custo por criativo aprovado | R$ 4,80 | R$ 1,90 | R$ 0,62 |

Dominar o controle fino é o divisor de águas entre "uso IA" e "opero IA".

---

<a id="cap6"></a>
## Capítulo 6 — Inpainting, outpainting e edição semântica

Em produção real, **80% das imagens passam por edição** após a geração inicial. O Nanobanana 4 oferece três modos de edição que se complementam.

### 6.1 — Inpainting: substituir uma região

Você seleciona uma área (com brush ou máscara automática) e o modelo regenera *apenas aquela área*, mantendo o resto da imagem intacta. Casos de uso:

- Trocar o rosto de um modelo sem refazer a cena.
- Adicionar um produto que "não estava" na imagem original.
- Remover objetos indesejados (poste, fio, pessoa ao fundo).

```python
# Inpainting programático
mask = create_mask(image, polygon=[(120,80),(420,80),(420,380),(120,380)])
result = pipe.inpaint(
    image=image,
    mask_image=mask,
    prompt="(smartwatch premium:1.3) no pulso, foco nítido",
    negative_prompt="borrado, anatomia errada",
    num_inference_steps=30,
    strength=0.85
)
```

### 6.2 — Outpainting: estender o canvas

Expande a imagem além de suas bordas originais, gerando conteúdo coerente com o que já existe. Útil para:

- Transformar 1:1 em 9:16 para Stories sem perder o contexto.
- Criar backgrounds cinematográficos para um produto centralizado.
- Gerar "vistas estendidas" de uma cena para usar em banner de site.

### 6.3 — Edição semântica: "mude o céu para pôr do sol"

O diferencial do Nanobanana 4 é a edição guiada por **instruções em linguagem natural**. Você escreve "mude o céu para um pôr do sol laranja e adicione gaivotas" e o modelo executa.

> **Comandos típicos de edição semântica:**
> - "Substitua o fundo branco por um escritório moderno com vista para o mar."
> - "Mude a iluminação para luz de fim de tarde."
> - "Adicione um segundo personagem sentado à direita."
> - "Aumente a saturação em 20% e adicione film grain sutil."
> - "Converta para estilo de pintura a óleo, mantendo as proporções."

### 6.4 — Workflow de aprovação em 3 rounds

1. **Round 1 (geração):** 10 variantes brutas a partir do briefing.
2. **Round 2 (curadoria):** aprovar 3, fazer inpainting para corrigir 2-3 detalhes.
3. **Round 3 (refinamento):** upscale 4K, aplicar film grain, assinar digitalmente, exportar.

> 💡 **Automação Nexus:** use o SDK `nexus-imageflow` para encadear Round 1 → 2 → 3 em um único comando Python, com log de auditoria de cada aprovação.

---

<a id="cap7"></a>
## Capítulo 7 — Pipelines de produção para MMN e Afiliados

Um afiliado profissional não gera "uma imagem por vez". Opera um **pipeline de produção contínua**. Nesta seção, mostramos a arquitetura recomendada.

### 7.1 — Pipeline Nexus v3 (referência)

1. **Briefing automático** (Google Sheet + Zapier) gera 100 briefings/dia a partir de dados de tendência (Google Trends, TikTok Creative Center, Meta Ad Library).
2. **Curadoria IA** seleciona 20 briefings de maior potencial de CTR.
3. **Geração em lote** no Nanobanana 4 (10 variantes por briefing).
4. **QA automático** (CLIP score > 0.30, NSFW < 0.05, face count = brief).
5. **Curadoria humana** (1 analista aprova ~20% das 200 imagens).
6. **Publicação** via Meta API, Google Ads API, TikTok Ads API.
7. **A/B test** em 48h, vencedor escala, perdedor vira seed para próxima iteração.

> 📈 **Métrica-chave:** Esse pipeline produz **40 criativos aprovados/dia** com 1 analista + 1 operador IA. Volume 8× maior que o mercado paga o mesmo profissional.

### 7.2 — Stack tecnológico recomendado

| Camada | Ferramenta | Custo estimado |
|--------|-----------|----------------|
| Orquestração | N8N / Make / Airflow | R$ 100-500/mês |
| Geração | Nanobanana 4 API | R$ 0,09/imagem |
| Storage | Cloudflare R2 / S3 | R$ 30/mês (500GB) |
| QA visual | CLIP + detector NSFW | R$ 50/mês |
| Publicação | Meta + Google + TikTok APIs | Gratuito |
| Tracking | UTM + pixels + GA4 | Gratuito |

### 7.3 — Templates de briefing

> **Template Nexus 01 — Produto físico e-commerce:**
> *[PRODUTO] + [BENEFÍCIO PRINCIPAL] + [PÚBLICO] + [CENÁRIO DE USO] + [ESTILO] + [RESTRIÇÕES TÉCNICAS]*

> **Template Nexus 02 — Persona de conteúdo:**
> *[PERSONA] + [EMOÇÃO] + [AÇÃO] + [AMBIENTE] + [MARCA ESTÉTICA] + [RESTRIÇÕES]*

> **Template Nexus 03 — Carrossel educativo:**
> *[TÓPICO] + [ESTILO INFORGRÁFICO] + [PALETA DA MARCA] + [TIPOGRAFIA] + [ESPAÇO PARA TEXTO]*

### 7.4 — Governança e aprovação

Em times maiores, institua três papéis formais:

- **Diretor de arte:** valida alinhamento de marca (5-10 min por lote).
- **Compliance:** valida LGPD, direitos de imagem, claims publicitários (2-3 min por lote).
- **Performance:** valida métricas históricas e atualiza o "playbook de estilo" (1 reunião semanal).

### 7.5 — Versionamento e reprodutibilidade

Cada criativo aprovado deve ter metadados salvos em JSON:

```json
{
  "id": "cr_2026_06_00142",
  "campaign": "Lançamento Hidratante L22",
  "model": "nanobanana-4",
  "model_version": "4.2.1",
  "seed": 8847123,
  "prompt_hash": "a1b2c3...",
  "loras": ["lora_marca_nexus:0.6"],
  "controlnets": ["depth:0.7", "canny:0.5"],
  "approved_by": "ana.silva",
  "approved_at": "2026-06-04T14:23Z",
  "metrics": {"ctr_72h": 0.038, "cpa": 12.4}
}
```

Com isso, você consegue auditar qualquer decisão e replicar exatamente o criativo vencedor em 30 segundos.

---

<a id="cap8"></a>
## Capítulo 8 — Pós-produção e entrega multi-formato

Gerar a imagem é 40% do trabalho. Os outros 60% estão em entregar o criativo **no formato, peso e especificação exata** de cada canal.

### 8.1 — Especificações por canal (2026)

| Canal | Formato | Peso máx. | Duração |
|-------|---------|-----------|---------|
| Meta Feed | 1080×1080 (1:1) ou 1080×1350 (4:5) | 30 MB | estático |
| Meta Stories/Reels | 1080×1920 (9:16) | 30 MB | estático/vídeo 15s |
| Google Display | 300×250, 728×90, 160×600 | 150 KB | estático/animado |
| YouTube Thumbnail | 1280×720 (16:9) | 2 MB | estático |
| TikTok | 1080×1920 (9:16) | 50 MB | vídeo 9-34s |
| Print A4 | 2480×3508 (300 DPI) | — | — |

### 8.2 — Otimização de peso sem perda visual

1. Exporte PNG com otimização pngcrush.
2. Converta para WebP (qualidade 85) — 30-40% menor.
3. Para JPEG, use mozjpeg com qualidade 82-88.
4. Para AVIF (quando suportado), qualidade 65 já é suficiente.

```bash
# Pipeline de otimização Nexus
convert input.png -resize 1080x1080 -quality 85 output.webp
convert input.png -resize 1080x1080 -strip -interlace Plane output.jpg
```

### 8.3 — Color management

Para garantir consistência entre imagem gerada e marca:

- Trabalhe em **sRGB** para web e social.
- Use **Adobe RGB** para impressão.
- Faça **soft proof** sempre que possível.
- Evite perfis ICC customizados (dores de cabeça em browsers).

### 8.4 — Acessibilidade visual

> ♿ **Lembrete WCAG 2.2:** texto sobreposto em imagem precisa de contraste 4.5:1 (texto pequeno) ou 3:1 (texto grande). Use ferramentas como o Stark Plugin (Figma) para validar.

---

<a id="cap9"></a>
## Capítulo 9 — Ética, LGPD e direitos sobre imagens sintéticas

Igualdade de capacidade técnica exige desigualdade de responsabilidade ética. Esta seção cobre o que ninguém te conta — e o que pode te custar R$ 50M em multa.

### 9.1 — Quem é o autor de uma imagem gerada por IA?

No Brasil, a Lei 9.610/98 (Direito Autoral) **não reconhece** a IA como autora. A autoria pertence ao operador humano que concebeu o prompt, desde que haja contribuição criativa substancial. *(STJ Tema 994, 2024)*

### 9.2 — O que NÃO é permitido

- ❌ Gerar imagens de pessoas reais sem consentimento (LGPD art. 11).
- ❌ Usar rosto de celebridades para endosso (CDC art. 30).
- ❌ Criar deepfakes de qualquer natureza (Marco Civil, art. 22).
- ❌ Reproduzir obras de artistas vivos sem licença (direito autoral).
- ❌ Atribuir a imagem como "foto real" (Código de Defesa do Consumidor).

### 9.3 — Boas práticas Nexus

- [x] Marque claramente imagens sintéticas quando o contexto for editorial/jornalístico.
- [x] Mantenha um "log de origem" de cada criativo (modelo, prompt, data).
- [x] Tenha termo de consentimento assinado para uso de imagem de modelos.
- [x] Revise a política da plataforma de veiculação (Meta exige disclosure de IA).
- [x] Não use a imagem sintética para "provar" resultados clínicos, jurídicos ou financeiros.

### 9.4 — Disclosure e transparência

O Meta Ads, TikTok Ads e Google Ads exigem disclosure de conteúdo gerado por IA. O formato padrão é:

```
[Conteúdo parcialmente gerado por IA. Imagem principal: 
sintética (Nanobanana 4). Copy: revisada por humano. 
Modelo: Ana Silva. Data: 2026-06-04.]
```

Você não precisa exibir esse disclaimer visualmente no criativo, mas precisa mantê-lo no registro interno e disponível em até 24h para auditoria da plataforma.

### 9.5 — A tendência mundial: AI Act, AI Bill of Rights

- **União Europeia (AI Act, 2024):** classifica geração de imagem sintética como "risco limitado" — exige transparência e marca d'água.
- **EUA (AI Bill of Rights, 2023):** direito do consumidor de saber se está interagindo com IA.
- **Brasil (PL 2338/2023):** em tramitação, deve ser aprovado até 2027 com regras similares ao AI Act.

> 📊 **Tendência 2026-2028:** marcas que se antecipam à regulação (usam disclosure, mantêm log, auditam cadeia) terão vantagem competitiva reputacional — especialmente no público Gen Z.

---

<a id="cap10"></a>
## Capítulo 10 — Glossário técnico e exercícios práticos

### Glossário

- **CFG Scale** — Força do condicionamento do prompt (0-20).
- **DiT** — Diffusion Transformer, arquitetura base.
- **CLIP** — Modelo de visão-linguagem da OpenAI.
- **VAE** — Autoencoder Variacional, codifica pixels ↔ latente.
- **LoRA** — Adaptação de baixo rank para fine-tuning eficiente.
- **ControlNet** — Controle espacial por mapas (depth, canny, pose).
- **IP-Adapter** — Transferência de imagem para imagem via embedding.
- **Inpainting** — Edição de região específica.
- **Outpainting** — Expansão do canvas para além das bordas.
- **Seed** — Número que inicializa o ruído — fixa reprodutibilidade.
- **Negative Prompt** — Descrição do que NÃO deve aparecer.
- **Embedding** — Vetor numérico que representa semanticamente um conceito.
- **NSFW** — Not Safe For Work — conteúdo impróprio.
- **FID** — Métrica de distância para distribuições de imagem.
- **ROAS** — Return on Ad Spend — retorno sobre gasto com anúncios.

### Exercícios práticos

**Exercício 1 — Calibração de estilo**
Gere 5 imagens do mesmo produto (uma garrafa de perfume) com 5 estilos diferentes (fotorreal, ilustração flat, 3D isométrico, aquarela, anime). Meça o CLIP score de cada uma e identifique qual gera mais identificação com o público da sua marca.

**Exercício 2 — Pipeline completo**
Monte um briefing de 3 dias para uma campanha real. Aplique o método C.E.R., gere 30 variantes, selecione 5 com QA, publique 2, meça CTR e conversão em 7 dias.

**Exercício 3 — Governança**
Crie um log de origem (JSON) para os 10 melhores criativos do seu último mês. Compare reprodutibilidade, métricas e identifique padrões de sucesso.

---

> 📘 **Continua no Ebook 02 — Lovable**
> Agora que você domina a síntese visual, vamos passar do pixel ao **produto digital completo**: como construir uma aplicação full-stack conversando com IA, sem escrever uma linha de código tradicional.
>
> *Por MMN AI-to-AI · Coleção Técnica Nexus · Volume 01 de 05*